const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authmiddleware");

const upload = require("../utils/multer");

const {
  getProfile,
  getAllUsers,
  updateProfile,
  addFamilyMember,
  updateSubscription,
  getConnectedHospitals,
  unlinkHospital,
  updateFCMToken,
  inviteCaretaker,
  getCaretakers,
  deleteCaretaker,
  getCaretakerPatients
} = require("../controllers/userController");

const {
  sendLinkOTP,
  verifyAndLink,
  createHospitalWithAdmin,
  getHospitals,
  getHospitalById,
  updateHospital,
  updateHospitalStatus,
  deleteHospital
} = require("../controllers/hospitalController");

const {
  addMedication,
  getMedications,
  updateMedication,
  deleteMedication,
  markAsTaken,
  verifyWithSelfie,
  getTodaySchedule,
  deleteSelfie,
  recoverSelfie,
  adminDeleteSelfie,
  getDeletedSelfies
} = require("../controllers/medicationController");

// const {
//   takeMedication,
//   getLogs,
//   getCompliance,
//   deleteLog,
//   exportLogs
// } = require("../controllers/logController");

const {
  uploadReport,
  getReports,
  getReportsByType,
  getReportById,
  deleteReport
} = require("../controllers/reportController");

const {
  verifyOTP,
  register,
  adminLogin,
  changePassword,
    toggleAdminStatus,
  deleteAdmin,
  checkPhone,
} = require("../controllers/authContoller");

const {
  getVitals,
  getVitalById,
  updateVital,
  deleteVital,
  addBloodPressure,
  addHeartRate,
  addTemperature,
  addSugar
} = require("../controllers/vitalsController");

const {
  addPrescription,
  getPrescriptions,
  getPrescriptionById,
  deletePrescription
} = require("../controllers/prescriptionController");

const {
  getAdherence,
} = require("../controllers/dashboardController");

const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

const {
  loginSuccess,
} = require("../controllers/superadminController");

const {
  createGuardian,
   guardianLogin,
    changeGuardianPassword,
    getGuardianInvitations,
    acceptInvitation,
    rejectInvitation,
       getAllGuardians,
       updateGuardianStatus
} = require("../controllers/guardianController");

const passport = require("passport");

// ================= AUTH =================
router.post("/auth/verifyOTP", verifyOTP);
router.post("/auth/register", register);
router.post("/auth/check-phone", checkPhone);

// ================= ADMIN AUTH (HOSPITAL ADMINS) =================
router.post("/admin/login", adminLogin);
router.put("/admin/change-password", auth, changePassword);
router.patch(
  "/admins/:id/status",
  auth,
  toggleAdminStatus
);

router.delete(
  "/admins/:id",
  auth,
  deleteAdmin
);

// ================= SUPER ADMIN GOOGLE AUTH =================

// Login with Google
router.get(
  "/superadmin/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google Callback
router.get(
  "/superadmin/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  loginSuccess
);


// ================= USER =================
router.get("/profile", auth, getProfile);
router.get("/users", auth, getAllUsers);
router.put("/profile", auth, upload.single("image"), updateProfile);
router.post("/family-members", auth, auth.blockGuardianWrite, addFamilyMember);
router.put("/subscription", updateSubscription);
router.put("/profile/fcm-token", auth, updateFCMToken);

// ================= HOSPITAL LINKS =================
router.post("/hospitals/send-link-otp", auth, sendLinkOTP);
router.post("/hospitals/verify-link", auth, verifyAndLink);
router.get("/profile/hospitals", auth, getConnectedHospitals);
router.delete("/profile/hospitals/:hospitalId", auth, unlinkHospital);

// ================= SUPER ADMIN HOSPITAL MANAGEMENT =================
router.post("/hospitals/create-with-admin", auth, createHospitalWithAdmin);
router.get("/hospitals", auth, getHospitals);
router.get("/hospitals/:id", auth, getHospitalById);
router.put("/hospitals/:id", auth, updateHospital);
router.patch("/hospitals/:id/status", auth, updateHospitalStatus);
router.delete("/hospitals/:id", auth, deleteHospital);

// ================= CARETAKERS / OBSERVERS =================
// router.post("/profile/caretakers/invite", auth, inviteCaretaker);
router.get("/profile/caretakers", auth, getCaretakers);
router.delete("/profile/caretakers/:id", auth, deleteCaretaker);
router.get("/profile/caretakers/patients", auth, getCaretakerPatients);
router.post(
  "/guardians/create",
  auth,
  createGuardian
);
router.post("/guardian/login", guardianLogin);
router.put(
    "/guardian/change-password",
    auth,
    changeGuardianPassword
);

router.get(
    "/guardian/invitations",
    auth,
    getGuardianInvitations
);

router.post(
    "/guardian/invitations/:id/accept",
    auth,
    acceptInvitation
);
router.post(
    "/guardian/invitations/:id/reject",
    auth,
    rejectInvitation
);
router.get(
    "/guardians",
    auth,
    getAllGuardians
);
router.patch(
    "/guardians/:id/status",
    auth,
    updateGuardianStatus
);


// ================= MEDICATION =================
router.post("/medications", auth, auth.blockGuardianWrite, addMedication);
router.get("/medications", auth, getMedications);
router.get("/today", auth, getTodaySchedule);
router.put("/medications/:id", auth, auth.blockGuardianWrite, updateMedication);
router.delete("/medications/:id", auth, auth.blockGuardianWrite, deleteMedication);
router.put("/dose/:doseId/taken", auth, auth.blockGuardianWrite, markAsTaken);
router.post("/dose/:doseId/verify", auth, auth.blockGuardianWrite, upload.single("file"), verifyWithSelfie);
router.delete("/dose/:doseId/selfie", auth, auth.blockGuardianWrite, deleteSelfie);

//====== admin ==========
router.put("/admin/recover-selfie/:id", auth, recoverSelfie);
router.delete("/admin/delete-selfie/:id", auth, adminDeleteSelfie);
router.get("/admin/deleted-selfies", auth, getDeletedSelfies);


// ================= LOGS ================= 
// router.post("/logs/take", upload.single("image"), takeMedication);
// router.get("/logs", getLogs);
// router.get("/logs/compliance", getCompliance);
// router.delete("/logs/:id", deleteLog);
// router.get("/logs/export", exportLogs);


// ================= REPORTS =================
router.post("/reports", auth, auth.blockGuardianWrite, upload.single("file"), uploadReport);
router.get("/reports", auth, getReports);
router.get("/reports/type/:type", auth, getReportsByType);
router.get("/reports/:id", auth, getReportById);
router.delete("/reports/:id", auth, auth.blockGuardianWrite, deleteReport);


// ================= VITALS =================
router.get("/vitals", auth, getVitals);
router.get("/vitals/:id", auth, getVitalById);
router.put("/vitals/:id", auth, auth.blockGuardianWrite, updateVital);
router.delete("/vitals/:id", auth, auth.blockGuardianWrite, deleteVital);
router.post("/vitals/blood-pressure", auth, auth.blockGuardianWrite, addBloodPressure);
router.post("/vitals/heart-rate", auth, auth.blockGuardianWrite, addHeartRate);
router.post("/vitals/temperature", auth, auth.blockGuardianWrite, addTemperature);
router.post("/vitals/sugar", auth, auth.blockGuardianWrite, addSugar);


// ================= PRESCRIPTIONS =================
router.post("/prescriptions", auth, auth.blockGuardianWrite, upload.single("file"), addPrescription);
router.get("/prescriptions", auth, getPrescriptions);
router.get("/prescriptions/:id", auth, getPrescriptionById);
router.delete("/prescriptions/:id", auth, auth.blockGuardianWrite, deletePrescription);


// ================= DASHBOARD =================
router.get("/adherence", getAdherence);

// ================= NOTIFICATIONS =================
router.get("/notifications", auth, getNotifications);
router.put("/notifications/:id/read", auth, markAsRead);
router.put("/notifications/read-all", auth, markAllAsRead);

module.exports = router;