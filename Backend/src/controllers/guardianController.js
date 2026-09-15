const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Hospital = require("../models/hospitalModel");
const CaretakerInvite = require("../models/caretakerInviteModel");
const { sendGuardianCredentials } = require("../utils/emailHelper");

// ================= CREATE GUARDIAN =================
exports.createGuardian = async (req, res) => {
  try {
    const {
      patientId,
      firstName,
      email,
      phone,
      relation,
      hospital
    } = req.body;

    if (!patientId || !firstName || !email) {
      return res.status(400).json({
        success: false,
        message: "patientId, firstName and email are required"
      });
    }

    // Patient exists?
    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Existing guardian?
    const existingGuardian = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingGuardian) {
      return res.status(400).json({
        success: false,
        message: "Guardian already exists with this email"
      });
    }

    // Generate temporary password
    const temporaryPassword =
      crypto.randomBytes(4).toString("hex") + "@1";

    // Hash password
    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      10
    );

    // Resolve hospital if created by clinic admin
    let resolvedHospital = hospital;
    if (!resolvedHospital && req.user?.role === "admin") {
      const admin = await User.findById(req.user.id);
      if (admin?.hospitals?.length) {
        resolvedHospital = admin.hospitals[0];
      } else if (admin?.hospital) {
        resolvedHospital = admin.hospital;
      } else {
        const hosp = await Hospital.findOne({ adminId: req.user.id });
        if (hosp) resolvedHospital = hosp._id;
      }
    }

    // Create guardian
    const guardian = await User.create({
      firstName,
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,

      role: "guardian",

      isVerified: true,

      mustChangePassword: true,

      isFirstLogin: true,

      accountStatus: "pending",
      hospital: resolvedHospital || undefined,
      guardianFor: [patientId]
    });

    // Create invite
    const invite = await CaretakerInvite.create({

      patientId,

      caretakerId: guardian._id,

      createdBy: req.user.id,

      email: email.toLowerCase().trim(),

      phone,

      relation: relation || "Guardian",

      status: "pending"
    });

    // Send Email
    await sendGuardianCredentials(
      guardian.email,
      guardian.firstName,
      patient.firstName,
      temporaryPassword,
      relation || "Guardian"
    );

    res.status(201).json({

      success: true,

      message: "Guardian created successfully",

      guardian,

      invite

    });

  } catch (err) {

    res.status(500).json({

      success: false,

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
      const managedHospitals = await Hospital.find({ adminId: requesterId }).select("_id");
      adminHospitals.push(...managedHospitals.map(h => h._id.toString()));
      const hospitalIds = [...new Set(adminHospitals)].filter(id => mongoose.Types.ObjectId.isValid(id));

      if (hospitalIds.length === 0) {
        return res.json({ success: true, guardians: [] });
      }

      // 2. Find patients connected to these hospitals
      const hospitalObjectIds = hospitalIds.map(id => new mongoose.Types.ObjectId(id));
      const connectedPatientIds = await User.find({
        role: "patient",
        hospitals: { $in: hospitalObjectIds }
      }).distinct("_id");

      // 3. Find invites for these patients
      const inviteCaretakerIds = await CaretakerInvite.find({
        patientId: { $in: connectedPatientIds }
      }).distinct("caretakerId");

      // 4. Match guardians who are either:
      //    a) Assigned to this hospital directly
      //    b) A guardian for one of the clinic's connected patients (via guardianFor)
      //    c) An invited caretaker for one of the clinic's connected patients
      filter = {
        role: "guardian",
        $or: [
          { hospital: { $in: hospitalObjectIds } },
          { guardianFor: { $in: connectedPatientIds } },
          { _id: { $in: inviteCaretakerIds } }
        ]
      };
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

    const inviteMap = {};
    for (const inv of invites) {
      if (inv.caretakerId && !inviteMap[inv.caretakerId.toString()]) {
        inviteMap[inv.caretakerId.toString()] = inv;
      }
    }

    const guardians = rawGuardians.map(g => {
      const gObj = g.toObject();
      const inv = inviteMap[g._id.toString()];

      gObj.relation = inv?.relation || "Other";
      gObj.patientName = inv?.patientId
        ? `${inv.patientId.firstName || ""} ${inv.patientId.lastName || ""}`.trim()
        : (g.guardianFor?.[0] ? `${g.guardianFor[0].firstName || ""} ${g.guardianFor[0].lastName || ""}`.trim() : "");
      gObj.createdBy = inv?.createdBy ? `${inv.createdBy.firstName || ""} ${inv.createdBy.lastName || ""}`.trim() : "";
      gObj.hospital = g.hospital?.name || "";
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
        relation,
        guardian.email,
        temporaryPassword
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