const User = require("../models/userModel");
const Hospital = require("../models/hospitalModel");
const HospitalLinkOTP = require("../models/hospitalLinkOtpModel");
const Notification = require("../models/notificationModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const axios = require("axios");
const { sendPushNotification } = require("../utils/notificationHelper");
const { sendHospitalAdminCredentials } = require("../utils/emailHelper");

// ================= PATIENT: REQUEST TO CONNECT WITH A HOSPITAL =================
// Patient initiates this — selects a clinic from the dropdown and taps "Connect"
exports.requestHospitalLink = async (req, res) => {
  try {
    // 1. Enforce patient-only access
    if (req.user.role !== "patient") {
      return res.status(403).json({
        message: "Only patients can send hospital connection requests."
      });
    }

    const { hospitalId } = req.body;
    if (!hospitalId) {
      return res.status(400).json({ message: "Hospital ID is required" });
    }

    // 2. Verify hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    const hospitalName = hospital.name;

    // 3. Fetch patient details
    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    const patientName = patient.firstName || "Patient";
    const phone = patient.phone;

    // 4. Check if already connected
    if (patient.hospitals && patient.hospitals.map(h => h.toString()).includes(hospitalId)) {
      return res.status(400).json({ message: `You are already connected to ${hospitalName}.` });
    }

    // 5. Generate 6-digit OTP as backend security token (15-min validity)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await HospitalLinkOTP.deleteMany({ phone, hospitalId });
    await HospitalLinkOTP.create({
      phone,
      hospitalId,
      otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // 6. Find hospital admin to notify
    let adminId = hospital.adminId;
    if (!adminId) {
      const adminUser = await User.findOne({ hospital: hospitalId, role: "admin" });
      if (adminUser) adminId = adminUser._id;
    }

    // 7. Create in-app notification for the admin with machine-readable data
    if (adminId) {
      try {
        await Notification.create({
          user: adminId,
          title: "🏥 New Patient Connection Request",
          body: `${patientName} (${phone}) wants to connect their profile to ${hospitalName}. Click to review and approve.`,
          type: "hospital_link",
          isRead: false,
          data: {
            requestType: "hospital_link_request",
            phone,
            patientName,
            hospitalId: hospitalId.toString(),
            hospitalName,
          }
        });
      } catch (notifErr) {
        console.error("Admin notification skipped in requestHospitalLink:", notifErr.message);
      }
    }

    // 8. Respond to patient
    res.json({
      success: true,
      message: `Connection request sent to ${hospitalName}. The admin will review and approve shortly.`,
      hospitalName,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= ADMIN: APPROVE PATIENT LINK (no OTP entry needed) =================
// Admin clicks "Approve & Link" in the notification modal in the Admin Panel
exports.approvePatientLink = async (req, res) => {
  try {
    // 1. Enforce admin-only access
    if (req.user.role === "patient") {
      return res.status(403).json({
        message: "Patients cannot self-approve hospital connections."
      });
    }

    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Patient phone number is required" });
    }

    // 2. Identify admin's hospital (same logic as sendLinkOTP)
    let hospitalId;
    if (req.user.id === "123456") {
      const dummyHosp = await Hospital.findOne({ name: "Demo Hospital" });
      if (!dummyHosp) return res.status(404).json({ message: "Demo Hospital not found." });
      hospitalId = dummyHosp._id;
    } else {
      const admin = await User.findById(req.user.id);
      if (admin && admin.hospital) {
        hospitalId = admin.hospital;
      } else {
        const hosp = await Hospital.findOne({ adminId: req.user.id });
        if (!hosp) return res.status(403).json({ message: "You are not assigned to manage any hospital." });
        hospitalId = hosp._id;
      }
    }

    // 3. Fetch hospital details
    const hospital = await Hospital.findById(hospitalId);
    const hospitalName = hospital ? hospital.name : "Hospital";

    // 4. Find and validate the pending OTP record
    const record = await HospitalLinkOTP.findOne({ phone, hospitalId }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({
        message: "No pending connection request found for this patient. The patient may need to send a new request from the app."
      });
    }
    if (record.expiresAt < Date.now()) {
      await HospitalLinkOTP.deleteMany({ phone, hospitalId });
      return res.status(400).json({
        message: "The connection request has expired (15 minutes). Ask the patient to send a new request from the app."
      });
    }

    // 5. Find patient and link
    const patient = await User.findOne({ phone, role: "patient" });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found in the system." });
    }

    if (!patient.hospitals.map(h => h.toString()).includes(hospitalId.toString())) {
      patient.hospitals.push(hospitalId);
      await patient.save();
    }

    const patientName = patient.firstName || "Patient";

    // 6. Push notification to patient confirming successful link
    const successTitle = "🔗 Hospital Connected!";
    const successBody = `Your Medikto profile is now linked with ${hospitalName}. Your clinical team can now securely coordinate your care.`;
    try {
      await sendPushNotification(patient._id, successTitle, successBody, {
        type: "HOSPITAL_LINK_SUCCESS",
        hospitalId: hospitalId.toString(),
        hospitalName,
      });
    } catch (notifErr) {
      console.error("FCM dispatch skipped in approvePatientLink:", notifErr.message);
    }

    // 7. In-app notification for patient
    try {
      await Notification.create({
        user: patient._id,
        title: successTitle,
        body: successBody,
        type: "alert",
        isRead: false,
      });
    } catch (inAppErr) {
      console.error("Patient in-app notification skipped:", inAppErr.message);
    }

    // 8. In-app notification for admin confirming the link
    try {
      await Notification.create({
        user: req.user.id,
        title: "✅ Patient Linked Successfully",
        body: `${patientName} (${phone}) is now connected to ${hospitalName}.`,
        type: "alert",
        isRead: false,
      });
    } catch (adminNotifErr) {
      console.error("Admin success notification skipped:", adminNotifErr.message);
    }

    // 9. Cleanup OTP record and mark pending notification as read
    await HospitalLinkOTP.deleteMany({ phone, hospitalId });
    await Notification.updateMany(
      {
        user: req.user.id,
        type: "hospital_link",
        "data.phone": phone,
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: `${patientName} is now connected to ${hospitalName}.`,
      hospitalName,
      patient: {
        _id: patient._id,
        firstName: patient.firstName,
        phone: patient.phone,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= ADMIN: REJECT PATIENT LINK =================
exports.rejectPatientLink = async (req, res) => {
  try {
    // 1. Enforce admin-only access
    if (req.user.role === "patient") {
      return res.status(403).json({
        message: "Patients cannot reject hospital connections."
      });
    }

    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Patient phone number is required" });
    }

    // 2. Identify admin's hospital
    let hospitalId;
    if (req.user.id === "123456") {
      const dummyHosp = await Hospital.findOne({ name: "Demo Hospital" });
      if (!dummyHosp) return res.status(404).json({ message: "Demo Hospital not found." });
      hospitalId = dummyHosp._id;
    } else {
      const admin = await User.findById(req.user.id);
      if (admin && admin.hospital) {
        hospitalId = admin.hospital;
      } else {
        const hosp = await Hospital.findOne({ adminId: req.user.id });
        if (!hosp) return res.status(403).json({ message: "You are not assigned to manage any hospital." });
        hospitalId = hosp._id;
      }
    }

    // 3. Fetch hospital details
    const hospital = await Hospital.findById(hospitalId);
    const hospitalName = hospital ? hospital.name : "Hospital";

    // 4. Delete the pending OTP record
    await HospitalLinkOTP.deleteMany({ phone, hospitalId });

    // 5. Mark pending admin notifications as read
    await Notification.updateMany(
      {
        user: req.user.id,
        type: "hospital_link",
        "data.phone": phone,
      },
      { isRead: true }
    );

    // 6. Find patient if exists to send decline notification
    const patient = await User.findOne({ phone, role: "patient" });
    const patientName = patient?.firstName || "Patient";

    if (patient) {
      const declineTitle = "Hospital Connection Request Declined";
      const declineBody = `${hospitalName} was unable to approve your connection request at this time.`;
      try {
        await sendPushNotification(patient._id, declineTitle, declineBody, {
          type: "HOSPITAL_LINK_REJECTED",
          hospitalId: hospitalId.toString(),
          hospitalName,
        });
      } catch (notifErr) {
        console.error("FCM decline push skipped:", notifErr.message);
      }

      try {
        await Notification.create({
          user: patient._id,
          title: declineTitle,
          body: declineBody,
          type: "alert",
          isRead: false,
        });
      } catch (inAppErr) {
        console.error("Patient decline notification creation skipped:", inAppErr.message);
      }
    }

    res.json({
      success: true,
      message: `Connection request from ${patientName} has been rejected.`,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= SEND ACCESS LINK OTP =================

exports.sendLinkOTP = async (req, res) => {
  try {
    // 1. Role enforcement: Patients cannot initiate connection codes
    if (req.user.role === "patient") {
      return res.status(403).json({
        message: "Hospital connection requests must be initiated by clinic staff in the Admin Panel."
      });
    }

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Patient phone number is required" });
    }

    // 2. Verify patient exists in DB
    const patient = await User.findOne({ phone, role: "patient" });
    if (!patient) {
      return res.status(404).json({ message: "Patient not registered on Medikto. Ask patient to register in the app first." });
    }

    // 3. Identify Hospital from Admin
    let hospitalId;
    if (req.user.id === "123456") {
      // Demo Hospital for dummy admin
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

    // Fetch hospital details for accurate notification title & branding
    const hospital = await Hospital.findById(hospitalId);
    const hospitalName = hospital ? hospital.name : "Hospital";

    // 4. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // 5. Save to temporary OTP link table with 5-minute expiry
    await HospitalLinkOTP.deleteMany({ phone, hospitalId });
    await HospitalLinkOTP.create({
      phone,
      hospitalId,
      otp: otp.toString(),
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
    });

    // 6. Trigger Firebase push notification alert to the patient
    const notifTitle = "🏥 Hospital Connection Request";
    const notifBody = `${hospitalName} is requesting to connect with your Medikto profile. Share verification code ${otp} with your clinic staff to authorize.`;

    try {
      await sendPushNotification(
        patient._id,
        notifTitle,
        notifBody,
        {
          type: "HOSPITAL_LINK_REQUEST",
          hospitalId: hospitalId.toString(),
          hospitalName: hospitalName,
          otp: otp.toString()
        }
      );
    } catch (notifErr) {
      console.error("FCM dispatch skipped in sendLinkOTP:", notifErr.message);
    }

    // 7. Also create In-App notification for patient inbox
    try {
      await Notification.create({
        user: patient._id,
        title: notifTitle,
        body: notifBody,
        type: "alert",
        isRead: false
      });
    } catch (inAppErr) {
      console.error("Patient in-app notification creation skipped:", inAppErr.message);
    }

    // 8. Return response to Admin Panel
    res.json({
      success: true,
      message: `Verification code sent to patient's phone for ${hospitalName}`,
      hospitalName
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= VERIFY OTP AND LINK PATIENT =================
exports.verifyAndLink = async (req, res) => {
  try {
    // 1. Role enforcement: Patients cannot self-verify connections
    if (req.user.role === "patient") {
      return res.status(403).json({
        message: "Patients cannot self-verify hospital connections. Hospital admin must verify the code in the Admin Panel."
      });
    }

    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // 2. Identify Hospital from Admin
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

    // 3. Fetch recent OTP record
    const record = await HospitalLinkOTP.findOne({ phone, hospitalId }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: "Verification record not found. Please request a new code." });
    }

    // 4. Check expiry
    if (record.expiresAt < Date.now()) {
      await HospitalLinkOTP.deleteMany({ phone, hospitalId });
      return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
    }

    // 5. Compare OTP
    const isMatch = (otp.toString().trim() === record.otp.trim());
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid verification code. Please check and try again." });
    }

    // 6. Connect Patient
    const patient = await User.findOne({ phone, role: "patient" });
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

    // 7. Trigger push notification to the patient confirming successful link
    const successTitle = "🔗 Hospital Connected Successfully";
    const successBody = `Your Medikto profile is now linked with ${hospitalName}. Your clinical team can now securely monitor your care schedule.`;

    try {
      await sendPushNotification(
        patient._id,
        successTitle,
        successBody,
        {
          type: "HOSPITAL_LINK_SUCCESS",
          hospitalId: hospitalId.toString(),
          hospitalName: hospitalName
        }
      );
    } catch (notifErr) {
      console.error("FCM dispatch skipped in verifyAndLink:", notifErr.message);
    }

    // 8. In-App notification for patient
    try {
      await Notification.create({
        user: patient._id,
        title: successTitle,
        body: successBody,
        type: "alert",
        isRead: false
      });
    } catch (inAppErr) {
      console.error("Patient in-app notification creation skipped:", inAppErr.message);
    }

    // 9. In-App notification for Admin
    try {
      await Notification.create({
        user: req.user.id,
        title: "✅ Patient Connected",
        body: `Patient ${patient.firstName || patient.name || "User"} (${phone}) successfully linked to ${hospitalName}.`,
        type: "alert",
        isRead: false
      });
    } catch (adminNotifErr) {
      console.error("Admin notification creation skipped:", adminNotifErr.message);
    }

    // 10. Cleanup OTP records
    await HospitalLinkOTP.deleteMany({ phone, hospitalId });

    res.json({
      success: true,
      message: `Patient linked to ${hospitalName} successfully`,
      hospitalName,
      patient: {
        _id: patient._id,
        firstName: patient.firstName,
        phone: patient.phone
      }
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
    const temporaryPassword = crypto.randomBytes(4).toString("hex") + "@1";
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // 6. Create Hospital Admin User with password
    const adminUser = await User.create({
      firstName: adminFirstName,
      phone: adminPhone,
      email: adminEmail ? adminEmail.trim().toLowerCase() : undefined,
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
    let emailSent = false;
    if (adminUser.email) {
      try {
        const emailRes = await sendHospitalAdminCredentials(
          adminUser.email,
          adminUser.firstName,
          hospital.name,
          temporaryPassword
        );
        emailSent = emailRes?.success !== false;
      } catch (emailErr) {
        console.error("Email sending failed in createHospitalWithAdmin:", emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Hospital and admin created successfully. Login email sent."
        : "Hospital and admin created successfully.",
      emailSent,
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
        role: adminUser.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET ALL HOSPITALS =================
exports.getHospitals = async (req, res) => {
  try {
    // 1. Verify Authorized Role
    if (!["superadmin", "admin", "user", "guardian", "patient"].includes(req.user?.role)) {
      return res.status(403).json({ message: "Unauthorized access to hospitals list" });
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
