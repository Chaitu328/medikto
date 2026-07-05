const User = require("../models/userModel");
const Hospital = require("../models/hospitalModel");
const HospitalLinkOTP = require("../models/hospitalLinkOtpModel");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { sendPushNotification } = require("../utils/notificationHelper");
const { sendHospitalAdminCredentials } = require("../utils/emailHelper");

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

    // 5. Trigger Firebase push notification alert with the OTP code to the patient
    try {
      await sendPushNotification(
        patient._id,
        "Hospital Connection Request",
        `A hospital is requesting to connect with your Medikto profile. Use code ${otp} to authorize connection.`
      );
    } catch (notifErr) {
      console.error("FCM dispatch skipped in sendLinkOTP:", notifErr.message);
    }

    res.json({
      message: "OTP generated and sent to patient via push notification",
      otp: otp // Keep for local development/testing verification
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

// ================= CREATE HOSPITAL WITH ADMIN (SUPER ADMIN ONLY) =================
exports.createHospitalWithAdmin = async (req, res) => {
  try {
    // 1. Verify Super Admin Role
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only Super Admin can create hospitals" });
    }

    const { hospitalName, hospitalAddress, adminFirstName, adminPhone, adminEmail } = req.body;

    // 2. Validate required fields
    if (!hospitalName || !adminFirstName || !adminPhone) {
      return res.status(400).json({ message: "Hospital name, admin name, and admin phone are required" });
    }

    // 3. Check if hospital already exists
    const existingHospital = await Hospital.findOne({ name: hospitalName });
    if (existingHospital) {
      return res.status(400).json({ message: "Hospital with this name already exists" });
    }

    // 4. Check if admin phone already exists
    const existingAdmin = await User.findOne({ phone: adminPhone });
    if (existingAdmin) {
      return res.status(400).json({ message: "A user with this phone number already exists" });
    }

    // 5. Generate and hash temporary password for admin
    const temporaryPassword = "Admin@123";
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // 6. Create Hospital Admin User with password
    const adminUser = await User.create({
      firstName: adminFirstName,
      phone: adminPhone,
      email: adminEmail || undefined,
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });

    // 6. Create Hospital and link to admin
    const hospital = await Hospital.create({
      name: hospitalName,
      address: hospitalAddress || "",
      adminId: adminUser._id,
      status: "active"
    });

    // 7. Link hospital to admin user
    adminUser.hospital = hospital._id;
    await adminUser.save();

    // 8. Send hospital admin credentials via email (non-blocking)
    try {
      await sendHospitalAdminCredentials(
        adminUser.email,
        adminUser.firstName,
        hospital.name,
        temporaryPassword
      );
    } catch (emailErr) {
      console.error("Email sending failed in createHospitalWithAdmin:", emailErr.message);
      // Do not crash the parent process if email fails
    }

    res.status(201).json({
      success: true,
      message: "Hospital and admin created successfully",
      hospital: {
        _id: hospital._id,
        name: hospital.name,
        address: hospital.address,
        adminId: hospital.adminId,
        status: hospital.status,
        createdAt: hospital.createdAt
      },
      admin: {
        _id: adminUser._id,
        firstName: adminUser.firstName,
        phone: adminUser.phone,
        email: adminUser.email,
        role: adminUser.role,
        temporaryPassword: temporaryPassword
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET ALL HOSPITALS (SUPER ADMIN ONLY) =================
exports.getHospitals = async (req, res) => {
  try {
    // 1. Verify Super Admin Role
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only Super Admin can view all hospitals" });
    }

    // 2. Fetch all hospitals with admin details
    const hospitals = await Hospital.find()
      .populate("adminId", "firstName phone email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET HOSPITAL BY ID (SUPER ADMIN ONLY) =================
exports.getHospitalById = async (req, res) => {
  try {
    // 1. Verify Super Admin Role
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only Super Admin can view hospital details" });
    }

    const { id } = req.params;

    // 2. Fetch hospital with admin details
    const hospital = await Hospital.findById(id)
      .populate("adminId", "firstName phone email role");

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json({
      success: true,
      hospital
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE HOSPITAL (SUPER ADMIN ONLY) =================
exports.updateHospital = async (req, res) => {
  try {
    // 1. Verify Super Admin Role
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only Super Admin can update hospitals" });
    }

    const { id } = req.params;
    const { name, address } = req.body;

    // 2. Check if hospital exists
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // 3. Check if new name is already used by another hospital
    if (name && name !== hospital.name) {
      const existingHospital = await Hospital.findOne({ name });
      if (existingHospital) {
        return res.status(400).json({ message: "Hospital with this name already exists" });
      }
    }

    // 4. Update hospital
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;

    const updatedHospital = await Hospital.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("adminId", "firstName phone email role");

    res.json({
      success: true,
      message: "Hospital updated successfully",
      hospital: updatedHospital
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE HOSPITAL STATUS (SUPER ADMIN ONLY) =================
exports.updateHospitalStatus = async (req, res) => {
  try {
    // 1. Verify Super Admin Role
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only Super Admin can update hospital status" });
    }

    const { id } = req.params;
    const { status } = req.body;

    // 2. Validate status value
    const validStatuses = ["active", "inactive", "suspended"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    // 3. Check if hospital exists
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // 4. Update status
    hospital.status = status;
    await hospital.save();

    res.json({
      success: true,
      message: `Hospital status updated to ${status}`,
      hospital: await hospital.populate("adminId", "firstName phone email role")
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= DELETE HOSPITAL (SUPER ADMIN ONLY) =================
exports.deleteHospital = async (req, res) => {
  try {
    // 1. Verify Super Admin Role
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only Super Admin can delete hospitals" });
    }

    const { id } = req.params;

    // 2. Check if hospital exists
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // 3. Remove hospital reference from all patients
    await User.updateMany(
      { hospitals: id },
      { $pull: { hospitals: id } }
    );

    // 4. Delete the hospital
    await Hospital.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Hospital deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
