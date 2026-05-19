const express = require("express");
const router = express.Router();

const upload = require("../utils/multer");

const {
  getProfile,
  getAllUsers,
  updateProfile,
  addFamilyMember,
  updateSubscription
} = require("../controllers/userController");

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
  sendOTP,
  verifyOTP,
  resendOTP
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


// ================= AUTH =================
router.post("/auth/sendOTP", sendOTP);
router.post("/auth/verifyOTP", verifyOTP);
router.post("/auth/resendOTP", resendOTP);


// ================= USER =================
router.get("/profile", getProfile);
router.get("/users", getAllUsers);
router.put("/profile", upload.single("image"), updateProfile);
router.post("/family-members", addFamilyMember);
router.put("/subscription", updateSubscription);


// ================= MEDICATION =================
router.post("/medications", addMedication);
router.get("/medications", getMedications);
router.get("/today", getTodaySchedule);
router.put("/medications/:id", updateMedication);
router.delete("/medications/:id", deleteMedication);
router.put("/dose/:doseId/taken", markAsTaken);
router.post("/dose/:doseId/verify", upload.single("file"), verifyWithSelfie);
router.delete("/dose/:doseId/selfie", deleteSelfie);

//====== admin ==========
router.put("/admin/recover-selfie/:id" , recoverSelfie)
router.delete("/admin/delete-selfie/:id" , adminDeleteSelfie)
router.get("/admin/deleted-selfies" , getDeletedSelfies)


// ================= LOGS ================= 
// router.post("/logs/take", upload.single("image"), takeMedication);
// router.get("/logs", getLogs);
// router.get("/logs/compliance", getCompliance);
// router.delete("/logs/:id", deleteLog);
// router.get("/logs/export", exportLogs);


// ================= REPORTS =================
router.post("/reports", upload.single("file"), uploadReport);
router.get("/reports", getReports);
router.get("/reports/type/:type", getReportsByType);
router.get("/reports/:id", getReportById);
router.delete("/reports/:id", deleteReport);


// ================= VITALS =================
router.get("/vitals", getVitals);
router.get("/vitals/:id", getVitalById);
router.put("/vitals/:id", updateVital);
router.delete("/vitals/:id", deleteVital);
router.post("/vitals/blood-pressure", addBloodPressure);
router.post("/vitals/heart-rate", addHeartRate);
router.post("/vitals/temperature", addTemperature);
router.post("/vitals/sugar", addSugar);


// ================= PRESCRIPTIONS =================
router.post("/prescriptions", upload.single("file"), addPrescription);
router.get("/prescriptions", getPrescriptions);
router.get("/prescriptions/:id", getPrescriptionById);
router.delete("/prescriptions/:id", deletePrescription);


// ================= DASHBOARD =================
router.get("/adherence", getAdherence);

module.exports = router;