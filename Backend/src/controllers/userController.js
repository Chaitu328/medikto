const mongoose = require("mongoose");
const User = require("../models/userModel");
const {
  uploadBufferToS3,
  generateAvatarKey,
  resolveFileUrl,
} = require("../config/s3");
const CaretakerInvite = require("../models/caretakerInviteModel");
const { sendInviteEmail } = require("../utils/emailHelper");
const { buildPatientListFilter } = require("../utils/accessControl");
const bcrypt = require("bcrypt");



exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "hospital",
        select: "name email phone address",
      })
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userObj = user.toObject();
    if (userObj.profilePic) {
      userObj.profilePic = await resolveFileUrl(userObj.profilePic);
    }

    return res.status(200).json(userObj);

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const query = await buildPatientListFilter(req, req.query.patientId);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    // Find the current admin's hospital ID
    let hospitalId;
    if (req.user) {
      const admin = await User.findById(req.user.id);
      if (admin && admin.hospital) {
        hospitalId = admin.hospital;
      } else {
        const Hospital = require("../models/hospitalModel");
        const hosp = await Hospital.findOne({ adminId: req.user.id });
        if (hosp) hospitalId = hosp._id;
      }
    }

    // Convert users to plain JS objects so we can add custom properties
    const usersJson = [];
    const HospitalLinkOTP = require("../models/hospitalLinkOtpModel");

    for (const u of users) {
      const uObj = u.toObject();
      if (uObj.profilePic) {
        uObj.profilePic = await resolveFileUrl(uObj.profilePic);
      }
      if (hospitalId && uObj.phone) {
        // Find if there is an active OTP for this patient & hospital
        const linkOtp = await HospitalLinkOTP.findOne({
          phone: uObj.phone,
          hospitalId: hospitalId,
          expiresAt: { $gt: new Date() }
        });
        if (linkOtp) {
          uObj.otpCode = linkOtp.otp; // Attach OTP
        }
      }
      usersJson.push(uObj);
    }

    res.status(200).json({
      success: true,
      count: usersJson.length,
      users: usersJson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      phone,
      age,
      gender,
      bloodGroup,
      height,
      weight
    } = req.body;

    let profilePic;

    // upload image to S3
    if (req.file) {
      const s3Key = generateAvatarKey(req.user.id, req.file.originalname);
      await uploadBufferToS3(
        req.file.buffer,
        s3Key,
        req.file.mimetype || "image/jpeg"
      );
      profilePic = s3Key;
    }

    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (phone) updateData.phone = phone;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender.toLowerCase();
    if (bloodGroup) updateData.bloodGroup = bloodGroup.toUpperCase();
    if (height) updateData.height = height;
    if (weight) updateData.weight = weight;

    if (profilePic) updateData.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    const userObj = user ? user.toObject() : {};
    if (userObj.profilePic) {
      userObj.profilePic = await resolveFileUrl(userObj.profilePic);
    }

    res.json(userObj);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.addFamilyMember = async (req, res) => {
  try {
    const { name, relation, age } = req.body;

    if (!name || !relation) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findById(req.user.id);

    user.familyMembers.push({ name, relation, age });

    await user.save();

    res.json(user.familyMembers);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// exports.updateSubscription = async (req, res) => {
//   try {
//     const { plan } = req.body;

//     if (!["free", "basic", "premium"].includes(plan)) {
//       return res.status(400).json({ message: "Invalid plan" });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { subscription: plan },
//       { new: true }
//     ).select("-password");

//     res.json({
//       message: "Subscription updated",
//       subscription: user.subscription
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


exports.updateSubscription = async (req, res) => {
  try {
    const { plan, userId } = req.body;

    // Validate plan
    if (!["free", "basic", "premium"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    // Update subscription without token
    const user = await User.findByIdAndUpdate(
      userId,
      { subscription: plan },
      { new: true }
    ).select("-password");

    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription: user.subscription,
      data: user,
    });

  } catch (err) {
    console.log("SUBSCRIPTION UPDATE ERROR:", err.message);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ================= PATIENT: GET CONNECTED HOSPITALS =================
exports.getConnectedHospitals = async (req, res) => {
  try {
    const patientId = req.user.id;
    const patient = await User.findById(patientId).populate("hospitals");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient.hospitals || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= PATIENT: UNLINK/DISCONNECT HOSPITAL =================
exports.unlinkHospital = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { hospitalId } = req.params;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Remove hospitalId from array
    patient.hospitals = (patient.hospitals || []).filter(
      (id) => id.toString() !== hospitalId
    );
    await patient.save();

    res.json({
      success: true,
      message: "Hospital disconnected successfully"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= PATIENT: UPDATE FCM TOKEN =================
exports.updateFCMToken = async (req, res) => {
  try {
    const { fcmToken, timezone } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    const updateFields = { fcmToken };
    if (timezone) {
      updateFields.timezone = timezone;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "FCM token updated successfully",
      fcmToken: user.fcmToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= PATIENT: INVITE CARETAKER =================
exports.inviteCaretaker = async (req, res) => {
  try {
    const { email, relation, phone, name, password } = req.body;
    const patientId = req.user.id;

    if (!email) {
      return res.status(400).json({ message: "Caretaker email is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "Caretaker name is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Caretaker password is required" });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find or create caretaker user document
    let caretaker = await User.findOne({ email: email.trim().toLowerCase() });
    if (!caretaker) {
      const hashedPassword = await bcrypt.hash(password, 10);
      caretaker = await User.create({
        firstName: name,
        email: email.trim().toLowerCase(),
        phone: phone || undefined,
        password: hashedPassword,
        role: "guardian",
        isVerified: true,
        accountStatus: "pending"
      });
    }

    // Create the invite
    const invite = await CaretakerInvite.create({
      patientId,
      caretakerId: caretaker._id,
      email: email.trim().toLowerCase(),
      relation: relation || "Caretaker",
      phone: phone || null,
      status: "pending"
    });

    // Send invitation email
    await sendInviteEmail(email.trim().toLowerCase(), patient.firstName || "Medikto Patient", relation || "Caretaker");

    res.json({
      success: true,
      message: "Caretaker invitation sent successfully",
      invite
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= PATIENT: GET CARETAKERS =================
exports.getCaretakers = async (req, res) => {
  try {
    const patientId = req.user.id;
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    const patientObjectId = new mongoose.Types.ObjectId(patientId);
    
    // Find all accepted caretakers
    const acceptedCaretakers = await User.find({
      role: "guardian",
      guardianFor: patientObjectId
    }).select("-password");

    // Find all pending invites
    const pendingInvites = await CaretakerInvite.find({
      patientId: patientObjectId,
      status: "pending"
    });

    res.json({
      caretakers: acceptedCaretakers,
      pendingInvites
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= PATIENT: DELETE/REVOKE CARETAKER ACCESS =================
exports.deleteCaretaker = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params; // Caretaker user ID or invite ID

    // Try deleting invite if pending
    const inviteDeleted = await CaretakerInvite.findOneAndDelete({
      _id: id,
      patientId
    });

    if (inviteDeleted) {
      return res.json({ success: true, message: "Pending invitation cancelled successfully" });
    }

    // Otherwise, remove patientId from caretaker's guardianFor list
    const caretaker = await User.findById(id);
    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    caretaker.guardianFor = (caretaker.guardianFor || []).filter(
      (pId) => pId.toString() !== patientId
    );

    await caretaker.save();

    res.json({
      success: true,
      message: "Caretaker access revoked successfully"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GUARDIAN: GET MONITORED PATIENTS =================
exports.getCaretakerPatients = async (req, res) => {
  try {
    const guardianId = req.user.id;
    const guardian = await User.findById(guardianId).populate("guardianFor", "-password");
    if (!guardian) {
      return res.status(404).json({ message: "Guardian not found" });
    }

    res.json(guardian.guardianFor || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
