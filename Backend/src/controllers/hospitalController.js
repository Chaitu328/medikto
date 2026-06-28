const User = require("../models/userModel");
const Hospital = require("../models/hospitalModel");
const HospitalLinkOTP = require("../models/hospitalLinkOtpModel");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { sendSMS } = require("../utils/smsHelper");
const { sendPushNotification } = require("../utils/notificationHelper");

// ================= SEND ACCESS LINK OTP =================
exports.sendLinkOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Patient phone number is required" });
    }

    // 1. Verify patient exists in DB
    const patient = await User.findOne({ phone, role: "user" });
    if (!patient) {
      return res.status(404).json({ message: "Patient not registered on Medikto. Ask patient to register in the app first." });
    }

    // 2. Identify Admin's Hospital
    let hospitalId;
    if (req.user.id === "123456") {
      // Create or get Demo Hospital for dummy admin
      let dummyHosp = await Hospital.findOne({ name: "Demo Hospital" });
      if (!dummyHosp) {
        dummyHosp = await Hospital.create({
          name: "Demo Hospital",
          address: "123 Health Ave",
          adminId: req.user.id
        });
      }
      hospitalId = dummyHosp._id;
    } else {
      const admin = await User.findById(req.user.id);
      if (admin && admin.hospital) {
        hospitalId = admin.hospital;
      } else {
        const hosp = await Hospital.findOne({ adminId: req.user.id });
        if (!hosp) {
          return res.status(403).json({ message: "You are not assigned to manage any hospital. Please link admin account to a hospital first." });
        }
        hospitalId = hosp._id;
      }
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOTP = await bcrypt.hash(otp.toString(), 10);

    // 4. Save to temporary OTP link table
    await HospitalLinkOTP.deleteMany({ phone, hospitalId });
    await HospitalLinkOTP.create({
      phone,
      hospitalId,
      otp: hashedOTP,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
    });

    // 5. Send SMS via SMS Helper
    const result = await sendSMS(
      phone,
      `Medikto: Use code ${otp} to authorize connection with the hospital. This code is valid for 5 minutes.`
    );

    // Trigger Firebase push notification alert to the patient
    try {
      await sendPushNotification(
        patient._id,
        "Hospital Connection Request",
        "A hospital is requesting to connect with your Medikto profile. Check your SMS messages for the authorization code."
      );
    } catch (notifErr) {
      console.error("FCM dispatch skipped in sendLinkOTP:", notifErr.message);
    }

    res.json({
      message: result.provider === "twilio" || result.provider === "fast2sms"
        ? "OTP sent to patient's mobile number"
        : "OTP generated successfully (SMS provider offline)",
      otp: result.provider === "mock" ? otp : undefined // Expose OTP for local testing if SMS helper is in mock mode
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= VERIFY OTP AND LINK PATIENT =================
exports.verifyAndLink = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // 1. Identify Admin's Hospital
    let hospitalId;
    if (req.user.id === "123456") {
      const dummyHosp = await Hospital.findOne({ name: "Demo Hospital" });
      if (!dummyHosp) {
        return res.status(404).json({ message: "Demo Hospital not found. Send OTP first." });
      }
      hospitalId = dummyHosp._id;
    } else {
      const admin = await User.findById(req.user.id);
      if (admin && admin.hospital) {
        hospitalId = admin.hospital;
      } else {
        const hosp = await Hospital.findOne({ adminId: req.user.id });
        if (!hosp) {
          return res.status(403).json({ message: "You are not assigned to manage any hospital." });
        }
        hospitalId = hosp._id;
      }
    }

    // 2. Fetch recent OTP record
    const record = await HospitalLinkOTP.findOne({ phone, hospitalId }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: "Verification record not found. Try sending OTP again." });
    }

    // 3. Check expiry
    if (record.expiresAt < Date.now()) {
      await HospitalLinkOTP.deleteMany({ phone, hospitalId });
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    // 4. Compare OTP
    const isMatch = await bcrypt.compare(otp.toString(), record.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 5. Connect Patient
    const patient = await User.findOne({ phone, role: "user" });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (!patient.hospitals.includes(hospitalId)) {
      patient.hospitals.push(hospitalId);
      await patient.save();
    }

    // Fetch hospital details for name lookup
    const hospital = await Hospital.findById(hospitalId);
    const hospitalName = hospital ? hospital.name : "Hospital";

    // Trigger push notification to the patient
    try {
      await sendPushNotification(
        patient._id,
        "Connection Successful",
        `Your Medikto profile is now successfully connected with ${hospitalName}.`
      );
    } catch (notifErr) {
      console.error("FCM dispatch skipped in verifyAndLink:", notifErr.message);
    }

    // 6. Cleanup
    await HospitalLinkOTP.deleteMany({ phone, hospitalId });

    res.json({
      success: true,
      message: "Patient linked to hospital successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
