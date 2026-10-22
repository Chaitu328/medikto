const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Hospital = require("../models/hospitalModel");
const CaretakerInvite = require("../models/caretakerInviteModel");
const { sendGuardianCredentials, sendGuardianAccessGrantedEmail } = require("../utils/emailHelper");
const { getEffectiveSubscription } = require("./subscriptionController");

// ================= CREATE GUARDIAN =================
exports.createGuardian = async (req, res) => {
  try {
    const {
      patientId: bodyPatientId,
      firstName: bodyFirstName,
      name,
      email,
      phone,
      relation,
      hospital
    } = req.body;

    // 1. Resolve patient ID: patient role can only add for themselves; admins/superadmin specify in body
    const patientId = req.user?.role === "patient" ? req.user.id : (bodyPatientId || (req.user?.role === "superadmin" || req.user?.role === "admin" ? null : req.user?.id));
    const firstName = (bodyFirstName || name || "").trim();
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanPhone = (phone && typeof phone === "string" && phone.trim() !== "") ? phone.trim() : undefined;

    // 2. Validate required fields
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient selection is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Patient ID provided"
      });
    }

    if (!firstName) {
      return res.status(400).json({
        success: false,
        message: "Guardian full name is required"
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Guardian email address is required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address (e.g., guardian@example.com)"
      });
    }

    // 3. Verify Patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Selected patient not found"
      });
    }

    // 4. Enforce Premium subscription for patient self-service carer nomination
    if (req.user?.role === "patient") {
      const { isPremium } = getEffectiveSubscription(patient);
      if (!isPremium) {
        return res.status(403).json({
          success: false,
          code: "PREMIUM_REQUIRED",
          message: "Carer/Guardian nomination is available exclusively for Premium members. Please upgrade to unlock caretaker invitations."
        });
      }
    }

    // 5. Resolve and validate hospital (genuinely optional for Super Admin and patient)
    let resolvedHospital = hospital;
    if (resolvedHospital === "Select Hospital" || resolvedHospital === "undefined" || resolvedHospital === "null" || resolvedHospital === "") {
      resolvedHospital = undefined;
    }

    if (resolvedHospital && typeof resolvedHospital === "string" && resolvedHospital.trim() !== "") {
      resolvedHospital = resolvedHospital.trim();
      if (!mongoose.Types.ObjectId.isValid(resolvedHospital)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Hospital ID provided"
        });
      }
      const hospExists = await Hospital.findById(resolvedHospital);
      if (!hospExists) {
        return res.status(404).json({
          success: false,
          message: "Assigned hospital not found"
        });
      }
    } else if (!resolvedHospital && req.user?.role === "admin") {
      const admin = await User.findById(req.user.id);
      if (admin?.hospitals?.length) {
        resolvedHospital = admin.hospitals[0];
      } else if (admin?.hospital) {
        resolvedHospital = admin.hospital;
      } else {
        const hosp = await Hospital.findOne({ adminId: req.user.id });
        if (hosp) resolvedHospital = hosp._id;
      }
    } else {
      resolvedHospital = undefined;
    }

    // 6. Check for existing accounts and duplicate phone/email conflicts
    let guardian = await User.findOne({ email: cleanEmail });
    let guardianByPhone = cleanPhone ? await User.findOne({ phone: cleanPhone }) : null;

    if (guardian && guardianByPhone && guardian._id.toString() !== guardianByPhone._id.toString()) {
      return res.status(400).json({
        success: false,
        message: `The phone number ${cleanPhone} is already registered to a different user account (${guardianByPhone.email || guardianByPhone.firstName}).`
      });
    }

    if (!guardian && guardianByPhone) {
      if (guardianByPhone.role !== "guardian") {
        return res.status(400).json({
          success: false,
          message: `A user with phone number ${cleanPhone} already exists with account role: ${guardianByPhone.role}.`
        });
      }
      guardian = guardianByPhone;
    }

    // Generate temporary password
    const temporaryPassword = crypto.randomBytes(4).toString("hex") + "@1";
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    let isNewUser = false;

    if (!guardian) {
      isNewUser = true;

      // Create new guardian directly with active account status so they can log in to portal
      guardian = await User.create({
        firstName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
        password: hashedPassword,
        role: "guardian",
        isVerified: true,
        mustChangePassword: true,
        isFirstLogin: true,
        accountStatus: "active",
        hospital: resolvedHospital || undefined,
        guardianFor: [] // Relationship becomes active when invitation is accepted
      });
    } else {
      // Existing account: Ensure they are a guardian
      if (guardian.role !== "guardian") {
        return res.status(400).json({
          success: false,
          message: `This email is registered with a ${guardian.role} account and cannot be added as a caretaker.`
        });
      }

      // If phone changed or provided, verify no conflict with another account
      if (cleanPhone && guardian.phone !== cleanPhone) {
        const phoneConflict = await User.findOne({
          phone: cleanPhone,
          _id: { $ne: guardian._id }
        });
        if (phoneConflict) {
          return res.status(400).json({
            success: false,
            message: `The phone number ${cleanPhone} is already in use by another user account.`
          });
        }
        guardian.phone = cleanPhone;
      }

      if (resolvedHospital && !guardian.hospital) {
        guardian.hospital = resolvedHospital;
      }

      // If guardian still has not logged in, update temporary password
      if (guardian.isFirstLogin || guardian.mustChangePassword) {
        guardian.password = hashedPassword;
      }

      await guardian.save();
    }

    // 7. Create or update invite record with "pending" status to preserve the invitation lifecycle
    let invite = await CaretakerInvite.findOne({
      patientId,
      caretakerId: guardian._id
    });

    if (invite && invite.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "This guardian is already connected to the selected patient."
      });
    }

    if (!invite) {
      invite = await CaretakerInvite.create({
        patientId,
        caretakerId: guardian._id,
        createdBy: req.user.id,
        email: cleanEmail,
        phone: cleanPhone || guardian.phone,
        relation: relation || "Guardian",
        status: "pending"
      });
    } else {
      if (invite.status === "rejected") {
        invite.status = "pending";
      }
      invite.relation = relation || invite.relation || "Guardian";
      if (cleanPhone) invite.phone = cleanPhone;
      await invite.save();
    }

    // 8. Send credentials email for new user or access granted email for existing user
    let emailSent = true;
    let emailError = null;

    try {
      if (isNewUser) {
        const emailRes = await sendGuardianCredentials(
          guardian.email,
          guardian.firstName,
          patient.firstName,
          temporaryPassword,
          relation || "Guardian"
        );
        emailSent = emailRes?.success !== false;
        if (!emailSent) {
          emailError = emailRes?.error || "Failed to deliver email";
        }
      } else {
        const emailRes = await sendGuardianAccessGrantedEmail(
          guardian.email,
          guardian.firstName,
          patient.firstName,
          relation || "Guardian"
        );
        emailSent = emailRes?.success !== false;
        if (!emailSent) {
          emailError = emailRes?.error || "Failed to deliver email";
        }
      }
    } catch (emailErr) {
      console.error("[Email] Guardian credentials dispatch failed:", emailErr.message);
      emailSent = false;
      emailError = emailErr.message;
    }

    let message = "";
    if (isNewUser) {
      message = emailSent
        ? "Guardian created successfully. Credentials sent to email."
        : "Guardian created successfully, but credentials email could not be sent.";
    } else {
      message = emailSent
        ? "Guardian invitation sent successfully to existing account."
        : "Guardian linked successfully, but notification email could not be sent.";
    }

    return res.status(201).json({
      success: true,
      message,
      emailSent,
      emailError: emailSent ? undefined : emailError,
      guardian,
      invite
    });

  } catch (err) {
    console.error("createGuardian error:", err);
    const isDup = err.code === 11000;
    const statusCode = isDup ? 400 : 500;
    let userMessage = err.message || "Failed to create guardian. Please try again.";

    if (isDup) {
      if (err.keyPattern?.email || err.message?.includes("email")) {
        userMessage = "A guardian with this email already exists.";
      } else if (err.keyPattern?.phone || err.message?.includes("phone")) {
        userMessage = "A user with this phone number already exists.";
      } else {
        userMessage = "An account with this email address or phone number already exists.";
      }
    }

    return res.status(statusCode).json({
      success: false,
      message: userMessage,
      error: err.message
    });
  }
};

exports.guardianLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find guardian
        const guardian = await User.findOne({
            email: email.toLowerCase().trim(),
            role: "guardian"
        });

        if (!guardian) {
            return res.status(404).json({
                success: false,
                message: "Guardian account not found"
            });
        }

        // Account status
        if (guardian.accountStatus === "pending") {
            return res.status(403).json({
                success: false,
                message: "Your account is pending admin approval."
            });
        }
        if (guardian.accountStatus === "disabled") {
            return res.status(403).json({
                success: false,
                message: "Your account has been disabled."
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            guardian.password || ""
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // JWT
        const token = jwt.sign(
            {
                id: guardian._id,
                role: guardian.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({

            success: true,

            message: "Guardian login successful",

            mustChangePassword: guardian.mustChangePassword,

            token,

            user: {

                _id: guardian._id,

                firstName: guardian.firstName,

                email: guardian.email,

                phone: guardian.phone,

                role: guardian.role,

                accountStatus: guardian.accountStatus
            }

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

};

// ================= CHANGE GUARDIAN PASSWORD =================
exports.changeGuardianPassword = async (req, res) => {

    try {

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required."
            });
        }

        // Find logged in guardian
        const guardian = await User.findById(req.user.id);

        if (!guardian) {
            return res.status(404).json({
                success: false,
                message: "Guardian not found."
            });
        }

        if (guardian.role !== "guardian") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(
            oldPassword,
            guardian.password || ""
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect."
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        guardian.password = hashedPassword;

        guardian.mustChangePassword = false;

        guardian.isFirstLogin = false;

        await guardian.save();

        return res.json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

};

// ================= GET PENDING INVITATIONS =================
exports.getGuardianInvitations = async (req, res) => {

    try {

        const guardian = await User.findById(req.user.id);

        if (!guardian) {
            return res.status(404).json({
                success: false,
                message: "Guardian not found."
            });
        }

        const invitations = await CaretakerInvite.find({

            caretakerId: guardian._id,

            status: "pending"

        })
        .populate("patientId", "firstName profilePic phone age gender bloodGroup");

        return res.json({

            success: true,

            count: invitations.length,

            invitations

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            error: err.message

        });

    }

};

// ================= ACCEPT INVITATION =================
exports.acceptInvitation = async (req, res) => {

    try {

        const { id } = req.params;

        const guardian = await User.findById(req.user.id);

        if (!guardian) {
            return res.status(404).json({
                success: false,
                message: "Guardian not found."
            });
        }

        // Find invitation
        const invite = await CaretakerInvite.findById(id);

        if (!invite) {
            return res.status(404).json({
                success: false,
                message: "Invitation not found."
            });
        }

        // Make sure this invitation belongs to this guardian
        if (invite.caretakerId.toString() !== guardian._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized invitation."
            });
        }

        // Already accepted?
        if (invite.status === "accepted") {
            return res.status(400).json({
                success: false,
                message: "Invitation already accepted."
            });
        }

        // Link patient
        const alreadyLinked = guardian.guardianFor.some(
            patientId => patientId.toString() === invite.patientId.toString()
        );

        if (!alreadyLinked) {
            guardian.guardianFor.push(invite.patientId);
        }

        invite.status = "accepted";

        guardian.accountStatus = "active";

        await guardian.save();

        await invite.save();

        return res.json({

            success: true,

            message: "Invitation accepted successfully.",

            patientId: invite.patientId

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            error: err.message

        });

    }

};

// ================= REJECT INVITATION =================
exports.rejectInvitation = async (req, res) => {

    try {

        const { id } = req.params;

        const guardian = await User.findById(req.user.id);

        if (!guardian) {
            return res.status(404).json({
                success: false,
                message: "Guardian not found."
            });
        }

        const invite = await CaretakerInvite.findById(id);

        if (!invite) {
            return res.status(404).json({
                success: false,
                message: "Invitation not found."
            });
        }

        // Verify ownership
        if (invite.caretakerId.toString() !== guardian._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized invitation."
            });
        }

        // Already processed
        if (invite.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Invitation already processed."
            });
        }

        // Reject invitation
        invite.status = "rejected";

        await invite.save();

        return res.json({
            success: true,
            message: "Invitation rejected successfully."
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

};

// ================= GET ALL GUARDIANS (ROLE-BASED & ENRICHED) =================
exports.getAllGuardians = async (req, res) => {
  try {
    const role = req.user?.role;
    const requesterId = req.user?.id;

    let filter = { role: "guardian" };

    if (role === "admin") {
      // 1. Find the hospitals this admin manages
      const admin = await User.findById(requesterId).select("hospitals hospital");
      const adminHospitals = [];
      if (admin?.hospitals?.length) {
        adminHospitals.push(...admin.hospitals.map(id => id.toString()));
      }
      if (admin?.hospital) {
        adminHospitals.push(admin.hospital.toString());
      }
      const isReqObjectId = mongoose.Types.ObjectId.isValid(requesterId);
      const managedHospitals = await Hospital.find({
        $or: [
          { adminId: requesterId },
          ...(isReqObjectId ? [{ adminId: new mongoose.Types.ObjectId(requesterId) }] : [])
        ]
      }).select("_id");
      adminHospitals.push(...managedHospitals.map(h => h._id.toString()));
      const hospitalIds = [...new Set(adminHospitals)].filter(id => mongoose.Types.ObjectId.isValid(id));

      if (hospitalIds.length > 0) {
        const hospitalObjectIds = hospitalIds.map(id => new mongoose.Types.ObjectId(id));

        // 2. Find patients connected to these hospitals (check both 'hospitals' array and 'hospital' single field)
        const connectedPatientIds = await User.find({
          role: { $in: ["patient", "user"] },
          $or: [
            { hospitals: { $in: hospitalObjectIds } },
            { hospital: { $in: hospitalObjectIds } },
            { hospitals: { $in: hospitalIds } },
            { hospital: { $in: hospitalIds } }
          ]
        }).distinct("_id");

        // 3. Find invites for these patients
        const inviteCaretakerIds = await CaretakerInvite.find({
          patientId: { $in: connectedPatientIds }
        }).distinct("caretakerId");

        // 4. Match guardians who are either:
        //    a) Assigned to this hospital directly
        //    b) A guardian for one of the clinic's connected patients (via guardianFor)
        //    c) An invited caretaker for one of the clinic's connected patients
        const hospitalScopedFilter = {
          role: "guardian",
          $or: [
            { hospital: { $in: hospitalObjectIds } },
            { guardianFor: { $in: connectedPatientIds } },
            { _id: { $in: inviteCaretakerIds } }
          ]
        };

        const count = await User.countDocuments(hospitalScopedFilter);
        if (count > 0) {
          filter = hospitalScopedFilter;
        } else {
          // Fallback: If no hospital-specific guardians exist yet, allow admin view access to guardians
          filter = { role: "guardian" };
        }
      } else {
        // Admin has no specific hospital attached yet: allow view access to guardians
        filter = { role: "guardian" };
      }
    } else if (role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const rawGuardians = await User.find(filter)
      .select("-password")
      .populate("hospital", "name")
      .populate("guardianFor", "firstName lastName phone")
      .sort({ createdAt: -1 });

    // Fetch related invites to enrich metadata
    const guardianIds = rawGuardians.map(g => g._id);
    const invites = await CaretakerInvite.find({
      caretakerId: { $in: guardianIds }
    })
      .populate("patientId", "firstName lastName")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });

    const invitesByCaretaker = {};
    for (const inv of invites) {
      if (inv.caretakerId) {
        const cId = inv.caretakerId.toString();
        if (!invitesByCaretaker[cId]) {
          invitesByCaretaker[cId] = [];
        }
        invitesByCaretaker[cId].push(inv);
      }
    }

    const guardians = rawGuardians.map(g => {
      const gObj = g.toObject();
      const gInvites = invitesByCaretaker[g._id.toString()] || [];

      // Collect all connected patient names and relations
      const patientNames = [];
      const relations = [];

      gInvites.forEach(inv => {
        if (inv.patientId) {
          const pName = `${inv.patientId.firstName || ""} ${inv.patientId.lastName || ""}`.trim();
          if (pName) patientNames.push(pName);
          if (inv.relation) relations.push(inv.relation);
        }
      });

      // Fallback to guardianFor if no invites
      if (patientNames.length === 0 && g.guardianFor?.length) {
        g.guardianFor.forEach(p => {
          const pName = `${p.firstName || ""} ${p.lastName || ""}`.trim();
          if (pName) patientNames.push(pName);
        });
      }

      gObj.relation = relations.length ? [...new Set(relations)].join(", ") : "Guardian";
      gObj.patientName = patientNames.length ? [...new Set(patientNames)].join(", ") : "—";
      gObj.connectedPatients = gInvites.map(inv => ({
        patientId: inv.patientId?._id,
        patientName: inv.patientId ? `${inv.patientId.firstName || ""} ${inv.patientId.lastName || ""}`.trim() : "—",
        relation: inv.relation || "Guardian",
        status: inv.status
      }));
      const latestInvite = gInvites[0];
      gObj.status = latestInvite?.status || (g.guardianFor?.length > 0 ? "accepted" : "pending");
      gObj.accountStatus = g.accountStatus || "active";
      gObj.tempPasswordSent = true;
      gObj.passwordChanged = !g.mustChangePassword;

      return gObj;
    });

    res.json({
      success: true,
      guardians,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= ADMIN: UPDATE GUARDIAN STATUS =================
exports.updateGuardianStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    }

    const guardian = await User.findById(id);
    if (!guardian || guardian.role !== "guardian") {
      return res.status(404).json({ success: false, message: "Guardian not found." });
    }

    guardian.accountStatus = status;
    await guardian.save();

    res.json({
      success: true,
      message: `Guardian status updated to ${status} successfully.`,
      guardian
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ================= ADMIN: RESEND GUARDIAN CREDENTIALS =================
exports.resendGuardianCredentials = async (req, res) => {
  try {
    const { id } = req.params;

    const guardian = await User.findById(id);
    if (!guardian || guardian.role !== "guardian") {
      return res.status(404).json({ success: false, message: "Guardian not found." });
    }

    // Generate new temporary password
    const temporaryPassword = crypto.randomBytes(4).toString("hex") + "@1";
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    guardian.password = hashedPassword;
    guardian.mustChangePassword = true;
    guardian.isFirstLogin = true;
    await guardian.save();

    // Fetch related invite for metadata
    const invite = await CaretakerInvite.findOne({ caretakerId: guardian._id }).populate("patientId");
    const patientName = invite?.patientId ? `${invite.patientId.firstName || ""} ${invite.patientId.lastName || ""}`.trim() : "Patient";
    const relation = invite?.relation || "Caretaker";

    // Send email
    try {
      await sendGuardianCredentials(
        guardian.email,
        guardian.firstName,
        patientName,
        temporaryPassword,
        relation
      );
    } catch (emailErr) {
      console.error("Email dispatch error in resendGuardianCredentials:", emailErr.message);
    }

    res.json({
      success: true,
      message: "Guardian credentials resent successfully."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADMIN: DELETE GUARDIAN =================
exports.deleteGuardian = async (req, res) => {
  try {
    const { id } = req.params;

    const guardian = await User.findById(id);
    if (!guardian || guardian.role !== "guardian") {
      return res.status(404).json({ success: false, message: "Guardian not found." });
    }

    // Clean up guardianFor references on patients
    await User.updateMany(
      { guardianFor: guardian._id },
      { $pull: { guardianFor: guardian._id } }
    );

    // Delete associated invites
    await CaretakerInvite.deleteMany({ caretakerId: guardian._id });

    // Delete guardian user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Guardian removed successfully."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};