const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const CaretakerInvite = require("../models/caretakerInviteModel");
const { sendInviteEmail } = require("../utils/emailHelper");

// ================= VERIFY OTP / FIREBASE LOGIN =================
exports.verifyOTP = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Firebase ID Token is required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return res.status(400).json({ message: "Invalid Firebase token: phone number not found" });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      // Create user if they do not exist
      const isAdmin = phone === "+919704855196" || phone === "9704855196";
      user = await User.create({
        phone,
        role: isAdmin ? "admin" : "user",
        isVerified: true
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    // Check for pending caretaker invitations
    await linkPendingCaretakerInvites(user);

    // Generate App JWT Token
    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token: appToken,
      user
    });

  } catch (err) {
    console.error("Firebase ID Token verification failed:", err.message);
    res.status(401).json({ error: "Authentication failed: " + err.message });
  }
};

// ================= REGISTER USER =================
exports.register = async (req, res) => {
  try {
    const { full_name, mobile_number, token } = req.body;

    let phone = mobile_number || req.body.phone;
    if (token) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      phone = decodedToken.phone_number;
    }

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const name = full_name || req.body.firstName || req.body.name;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Check if user already exists
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ message: "User with this phone number already exists. Please log in." });
    }

    // Create the user
    user = await User.create({
      phone,
      firstName: name,
      role: "user",
      isVerified: true
    });

    // If caretaker details are provided during patient registration
    const { caretakerEmail, caretakerName, caretakerRelation } = req.body;
    if (caretakerEmail && caretakerName) {
      try {
        await CaretakerInvite.create({
          patientId: user._id,
          email: caretakerEmail.trim().toLowerCase(),
          relation: caretakerRelation || "Caretaker",
          status: "pending"
        });
        await sendInviteEmail(caretakerEmail.trim().toLowerCase(), name, caretakerRelation || "Caretaker");
      } catch (inviteErr) {
        console.error("Caretaker invite dispatch failed during signup:", inviteErr.message);
      }
    }

    // Check for pending caretaker invitations
    await linkPendingCaretakerInvites(user);

    // Generate App JWT Token
    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token: appToken,
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= LINK PENDING CARETAKER INVITATIONS =================
async function linkPendingCaretakerInvites(user) {
  try {
    const queryConditions = [
      { phone: user.phone },
      { email: user.phone }
    ];
    if (user.email) {
      queryConditions.push({ email: user.email.toLowerCase().trim() });
    }

    const invites = await CaretakerInvite.find({
      $or: queryConditions,
      status: "pending"
    });

    if (invites.length > 0) {
      user.role = "guardian";
      if (!user.guardianFor) {
        user.guardianFor = [];
      }
      for (const invite of invites) {
        if (!user.guardianFor.includes(invite.patientId)) {
          user.guardianFor.push(invite.patientId);
        }
        invite.status = "accepted";
        await invite.save();
      }
      await user.save();
      console.log(`User ${user._id} auto-promoted to caretaker guardian role.`);
    }
  } catch (err) {
    console.error("linkPendingCaretakerInvites error:", err.message);
  }
}