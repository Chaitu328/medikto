const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const User = require("../models/userModel");
const CaretakerInvite = require("../models/caretakerInviteModel");
const { sendInviteEmail } = require("../utils/emailHelper");
const bcrypt = require("bcrypt");

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
      return res.status(400).json({
        message: "This phone number is not registered. Please sign up first."
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    // Check for pending caretaker invitations
    await linkPendingCaretakerInvites(user);

    console.log("===============");
console.log("Calling linkPendingCaretakerInvites");
console.log(user.phone);
console.log(user.role);
console.log("===============");

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

    // Create the user with consent record
    const termsAccepted = req.body.termsAccepted === true || req.body.termsAccepted === "true";
    const privacyPolicyAccepted = req.body.privacyPolicyAccepted === true || req.body.privacyPolicyAccepted === "true";
    const termsVersion = req.body.termsVersion || "1.0";
    const privacyPolicyVersion = req.body.privacyPolicyVersion || "1.0";

    user = await User.create({
      phone,
      firstName: name,
      role: "patient",
      authProvider: "phone",
      isVerified: true,
      termsAccepted: termsAccepted,
      privacyPolicyAccepted: privacyPolicyAccepted,
      consentTimestamp: (termsAccepted && privacyPolicyAccepted) ? new Date() : undefined,
      termsVersion: termsVersion,
      privacyPolicyVersion: privacyPolicyVersion,
      accountStatus: "active"
    });

    // If caretaker details are provided during patient registration
    const { caretakerEmail, caretakerName, caretakerRelation, caretakerPhone, caretakerPassword } = req.body;
    if (caretakerEmail && caretakerName) {
      try {
        let caretaker = await User.findOne({ email: caretakerEmail.trim().toLowerCase() });
        if (!caretaker) {
          const hashedPassword = caretakerPassword ? await bcrypt.hash(caretakerPassword, 10) : undefined;
          caretaker = await User.create({
            firstName: caretakerName,
            email: caretakerEmail.trim().toLowerCase(),
            phone: caretakerPhone || undefined,
            password: hashedPassword,
            role: "guardian",
            isVerified: true,
            accountStatus: "pending"
          });
        }
        await CaretakerInvite.create({
          patientId: user._id,
          caretakerId: caretaker._id,
          email: caretakerEmail.trim().toLowerCase(),
          phone: caretakerPhone || null,
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
    // Only link caretaker invitations if the user registering/logging in is a guardian.
    // This prevents patient accounts (role 'user') from being converted into caretakers.
    if (user.role !== "guardian") {
      return;
    }

    console.log("Inside linkPendingCaretakerInvites");
    console.log(user.phone);

    const queryConditions = [
      { phone: user.phone },
      { email: user.phone }
    ];

    if (user.email) {
      queryConditions.push({
        email: user.email.toLowerCase().trim()
      });
    }

    const invites = await CaretakerInvite.find({
      $or: queryConditions,
      status: "pending"
    });

    console.log("Invites Found");
    console.log(invites);
    console.log("Invite Count:", invites.length);

    if (invites.length > 0) {
      user.role = "guardian";

      if (!user.guardianFor) {
        user.guardianFor = [];
      }

      for (const invite of invites) {

        const alreadyExists = user.guardianFor.some(
          id => id.toString() === invite.patientId.toString()
        );

        console.log("Already Exists:", alreadyExists);

        if (!alreadyExists) {
          user.guardianFor.push(invite.patientId);
        }

        invite.status = "accepted";
        await invite.save();
      }

      console.log("Saving User...");
      await user.save();

      console.log("Saved Successfully");
      console.log(user);
    }

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ================= DELETE ADMIN =================
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not an admin",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

// ================= HOSPITAL ADMIN LOGIN =================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password || "");
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }


    if (!user.isVerified) {
  return res.status(403).json({
    success: false,
    message: "Your account has been disabled. Please contact the Super Admin.",
  });
}
    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hospital: user.hospital
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CHANGE ADMIN PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    // 1. Find logged-in admin
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Verify old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password || "");
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // 3. Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= DISABLE / ENABLE ADMIN =================
exports.toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const admin = await User.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not an admin",
      });
    }

    admin.isVerified = isVerified;
    await admin.save();

    res.json({
      success: true,
      message: `Admin ${isVerified ? "enabled" : "disabled"} successfully`,
      data: admin,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ================= DELETE ADMIN =================
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not an admin",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ================= CHECK PHONE NUMBER REGISTERED =================
exports.checkPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    const user = await User.findOne({ phone });
    return res.json({
      exists: !!user,
      message: user ? "User is already registered" : "Phone number is not registered"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================= GOOGLE AUTHENTICATION =================
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID Token is required for Google authentication"
      });
    }

    // 1. Verify Firebase ID Token via Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Firebase token: UID not found"
      });
    }

    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    // 2. Identify if user already exists (by firebaseUid OR matching email)
    let user = await User.findOne({
      $or: [
        { firebaseUid: uid },
        ...(normalizedEmail ? [{ email: normalizedEmail }] : [])
      ]
    });

    // 3. Existing User Flow
    if (user) {
      // Check account status
      if (user.accountStatus === "disabled" || user.isVerified === false && user.role === "admin") {
        return res.status(403).json({
          success: false,
          message: "Your account is currently disabled. Please contact support."
        });
      }

      // Link firebaseUid if it was not linked yet
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
      }
      if (normalizedEmail && !user.email) {
        user.email = normalizedEmail;
      }
      if (picture && !user.profilePic) {
        user.profilePic = picture;
      }
      user.isVerified = true;
      await user.save();

      // Check for pending caretaker invitations
      await linkPendingCaretakerInvites(user);

      // Generate App JWT Token
      const appToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        isNewUser: false,
        message: "Login successful",
        token: appToken,
        user
      });
    }

    // 4. New Google User -> Return prompt for explicit consent & account creation
    return res.json({
      success: true,
      isNewUser: true,
      message: "New user. Explicit consent and profile completion required.",
      firebaseUid: uid,
      email: normalizedEmail,
      name: name || "Medikto User",
      picture: picture || null
    });

  } catch (err) {
    console.error("Google Auth Firebase ID Token verification error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Unable to sign in with Google. Please try again.",
      error: err.message
    });
  }
};

// ================= COMPLETE GOOGLE REGISTRATION (WITH EXPLICIT CONSENT) =================
exports.completeGoogleRegistration = async (req, res) => {
  try {
    const {
      token,
      fullName,
      phone,
      termsAccepted,
      privacyPolicyAccepted,
      termsVersion,
      privacyPolicyVersion
    } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID Token is required"
      });
    }

    // 1. Verify consent
    const hasConsented = (termsAccepted === true || termsAccepted === "true") &&
                         (privacyPolicyAccepted === true || privacyPolicyAccepted === "true");

    if (!hasConsented) {
      return res.status(400).json({
        success: false,
        message: "Please agree to the Terms & Conditions and Privacy Policy to continue."
      });
    }

    // 2. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    // 3. Double check if user already exists
    let existingUser = await User.findOne({
      $or: [
        { firebaseUid: uid },
        ...(normalizedEmail ? [{ email: normalizedEmail }] : [])
      ]
    });

    if (existingUser) {
      // User already registered
      existingUser.termsAccepted = true;
      existingUser.privacyPolicyAccepted = true;
      existingUser.consentTimestamp = new Date();
      existingUser.termsVersion = termsVersion || "1.0";
      existingUser.privacyPolicyVersion = privacyPolicyVersion || "1.0";
      existingUser.isVerified = true;
      await existingUser.save();

      const appToken = jwt.sign(
        { id: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        message: "Account verified and logged in successfully",
        token: appToken,
        user: existingUser
      });
    }

    // If phone is provided, verify it's not already used
    if (phone) {
      const phoneUser = await User.findOne({ phone });
      if (phoneUser) {
        return res.status(400).json({
          success: false,
          message: "This phone number is already associated with another account."
        });
      }
    }

    // 4. Create new user with explicit consent record
    const user = await User.create({
      firstName: fullName || name || "Medikto User",
      email: normalizedEmail || undefined,
      phone: phone || undefined,
      profilePic: picture || undefined,
      role: "patient",
      authProvider: "google",
      firebaseUid: uid,
      isVerified: true,
      termsAccepted: true,
      privacyPolicyAccepted: true,
      consentTimestamp: new Date(),
      termsVersion: termsVersion || "1.0",
      privacyPolicyVersion: privacyPolicyVersion || "1.0",
      accountStatus: "active"
    });

    // Link any pending caretaker invites
    await linkPendingCaretakerInvites(user);

    // Generate App JWT Token
    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token: appToken,
      user
    });

  } catch (err) {
    console.error("Complete Google Registration Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create your account. Please try again.",
      error: err.message
    });
  }
};