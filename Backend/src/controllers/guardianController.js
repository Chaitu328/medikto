const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
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
      hospital: hospital || undefined
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

exports.getAllGuardians = async (req, res) => {
  try {
    const guardians = await User.find({
      role: "guardian",
    }).select("-password");

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