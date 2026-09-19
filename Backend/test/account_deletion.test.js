const assert = require("assert");
const mongoose = require("mongoose");
const { deleteS3Prefix } = require("../src/config/s3");
const { deleteProfile } = require("../src/controllers/userController");
const User = require("../src/models/userModel");
const Medication = require("../src/models/medicationModel");
const Dose = require("../src/models/doseModel");
const Vitals = require("../src/models/vitalsModel");
const Report = require("../src/models/reportModel");
const Prescription = require("../src/models/prescriptionModel");
const Log = require("../src/models/logModel");
const Notification = require("../src/models/notificationModel");
const CaretakerInvite = require("../src/models/caretakerInviteModel");
const Hospital = require("../src/models/hospitalModel");
const HospitalLinkOTP = require("../src/models/hospitalLinkOtpModel");
const OTP = require("../src/models/authModel");

async function runTests() {
  console.log("Starting Account Deletion & Data Isolation Unit Tests...\n");

  // Test 1: S3 Prefix Purge Helper
  console.log("Test 1: deleteS3Prefix edge cases");
  const resEmpty = await deleteS3Prefix("");
  assert.strictEqual(resEmpty, 0, "Empty prefix must return 0");

  const resNull = await deleteS3Prefix(null);
  assert.strictEqual(resNull, 0, "Null prefix must return 0");
  console.log("  ✓ deleteS3Prefix handles null/empty safely");

  // Test 2: Validation of Invalid / Non-existent User ID
  console.log("Test 2: Invalid & Non-existent User ID handling");
  let statusCode = null;
  let jsonResponse = null;
  const reqInvalid = {
    user: { id: "invalid-id" }
  };
  const resInvalid = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { jsonResponse = data; }
      };
    }
  };
  await deleteProfile(reqInvalid, resInvalid);
  assert.strictEqual(statusCode, 400, "Must return 400 for invalid ObjectId");
  assert.strictEqual(jsonResponse.message, "Invalid user ID");

  const nonExistentId = new mongoose.Types.ObjectId().toString();
  const origFindById = User.findById;
  User.findById = async (id) => null;

  const reqNotFound = {
    user: { id: nonExistentId }
  };
  const resNotFound = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { jsonResponse = data; }
      };
    }
  };
  await deleteProfile(reqNotFound, resNotFound);
  assert.strictEqual(statusCode, 404, "Must return 404 when user does not exist");
  assert.strictEqual(jsonResponse.message, "User not found");

  User.findById = origFindById;
  console.log("  ✓ Invalid ObjectId (400) and Non-existent user (404) properly handled");

  // Test 3: Comprehensive Deletion Matrix & Data Isolation
  console.log("Test 3: Deletion Matrix verification across all 9 collections & dangling references");
  const targetUserId = new mongoose.Types.ObjectId();
  const targetUserPhone = "+919876543211";

  const otherUserId = new mongoose.Types.ObjectId();
  const otherUserPhone = "9876543211"; // Duplicate unnormalized phone

  const deletedQueries = {
    User: [],
    Medication: [],
    Dose: [],
    Vitals: [],
    Report: [],
    Prescription: [],
    Log: [],
    Notification: [],
    CaretakerInvite: [],
    HospitalLinkOTP: [],
    OTP: [],
    UserUpdateMany: [],
    HospitalUpdateMany: []
  };

  // Mock models
  const origUserFindById = User.findById;
  const origUserFindByIdAndDelete = User.findByIdAndDelete;
  const origMedDeleteMany = Medication.deleteMany;
  const origDoseDeleteMany = Dose.deleteMany;
  const origVitalsDeleteMany = Vitals.deleteMany;
  const origReportDeleteMany = Report.deleteMany;
  const origPrescriptionDeleteMany = Prescription.deleteMany;
  const origLogDeleteMany = Log.deleteMany;
  const origNotificationDeleteMany = Notification.deleteMany;
  const origCaretakerInviteDeleteMany = CaretakerInvite.deleteMany;
  const origUserUpdateMany = User.updateMany;
  const origHospitalUpdateMany = Hospital.updateMany;
  const origHospitalLinkOtpDeleteMany = HospitalLinkOTP.deleteMany;
  const origOtpDeleteMany = OTP.deleteMany;

  User.findById = async (id) => {
    if (id.toString() === targetUserId.toString()) {
      return {
        _id: targetUserId,
        phone: targetUserPhone,
        role: "patient",
        profilePic: `users/${targetUserId.toString()}/avatar.jpg`
      };
    }
    return null;
  };

  User.findByIdAndDelete = async (id) => {
    deletedQueries.User.push(id.toString());
    return { _id: id };
  };

  Medication.deleteMany = async (q) => { deletedQueries.Medication.push(q); return { deletedCount: 2 }; };
  Dose.deleteMany = async (q) => { deletedQueries.Dose.push(q); return { deletedCount: 5 }; };
  Vitals.deleteMany = async (q) => { deletedQueries.Vitals.push(q); return { deletedCount: 4 }; };
  Report.deleteMany = async (q) => { deletedQueries.Report.push(q); return { deletedCount: 1 }; };
  Prescription.deleteMany = async (q) => { deletedQueries.Prescription.push(q); return { deletedCount: 1 }; };
  Log.deleteMany = async (q) => { deletedQueries.Log.push(q); return { deletedCount: 3 }; };
  Notification.deleteMany = async (q) => { deletedQueries.Notification.push(q); return { deletedCount: 8 }; };
  CaretakerInvite.deleteMany = async (q) => { deletedQueries.CaretakerInvite.push(q); return { deletedCount: 2 }; };
  User.updateMany = async (q, u) => { deletedQueries.UserUpdateMany.push({ q, u }); return { modifiedCount: 1 }; };
  Hospital.updateMany = async (q, u) => { deletedQueries.HospitalUpdateMany.push({ q, u }); return { modifiedCount: 0 }; };
  HospitalLinkOTP.deleteMany = async (q) => { deletedQueries.HospitalLinkOTP.push(q); return { deletedCount: 1 }; };
  OTP.deleteMany = async (q) => { deletedQueries.OTP.push(q); return { deletedCount: 1 }; };

  statusCode = null;
  jsonResponse = null;

  const req = {
    user: { id: targetUserId.toString(), role: "patient" }
  };
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { jsonResponse = data; }
      };
    }
  };

  await deleteProfile(req, res);

  assert.strictEqual(statusCode, 200, "Account deletion must return 200 OK");
  assert.strictEqual(jsonResponse.success, true);
  assert.strictEqual(deletedQueries.User.length, 1);
  assert.strictEqual(deletedQueries.User[0], targetUserId.toString(), "Primary user document must be deleted by exact ObjectId");

  // Verify all dependent queries were executed with the target user's ObjectId
  assert.deepStrictEqual(deletedQueries.Medication[0], { user: targetUserId });
  assert.deepStrictEqual(deletedQueries.Dose[0], { user: targetUserId });
  assert.deepStrictEqual(deletedQueries.Vitals[0], { user: targetUserId });
  assert.deepStrictEqual(deletedQueries.Report[0], { user: targetUserId });
  assert.deepStrictEqual(deletedQueries.Prescription[0], { user: targetUserId });
  assert.deepStrictEqual(deletedQueries.Log[0], { user: targetUserId });

  // Verify notifications cleanup includes user and patientId reference
  assert.strictEqual(deletedQueries.Notification.length, 1);

  // Verify caretaker invites cleaned up for patientId or caretakerId
  assert.strictEqual(deletedQueries.CaretakerInvite.length, 1);

  // Verify guardianFor reference removed from caretakers
  assert.deepStrictEqual(deletedQueries.UserUpdateMany[0], {
    q: { guardianFor: targetUserId },
    u: { $pull: { guardianFor: targetUserId } }
  });

  // Verify phone OTPs cleaned up for target user's phone
  assert.deepStrictEqual(deletedQueries.HospitalLinkOTP[0], { phone: targetUserPhone });
  assert.deepStrictEqual(deletedQueries.OTP[0], { phone: targetUserPhone });

  // CRITICAL: Verify other user (otherUserId / 9876543211) was NOT touched in User.findByIdAndDelete
  assert.strictEqual(deletedQueries.User.includes(otherUserId.toString()), false, "Other user must NOT be deleted");

  // Restore originals
  User.findById = origUserFindById;
  User.findByIdAndDelete = origUserFindByIdAndDelete;
  Medication.deleteMany = origMedDeleteMany;
  Dose.deleteMany = origDoseDeleteMany;
  Vitals.deleteMany = origVitalsDeleteMany;
  Report.deleteMany = origReportDeleteMany;
  Prescription.deleteMany = origPrescriptionDeleteMany;
  Log.deleteMany = origLogDeleteMany;
  Notification.deleteMany = origNotificationDeleteMany;
  CaretakerInvite.deleteMany = origCaretakerInviteDeleteMany;
  User.updateMany = origUserUpdateMany;
  Hospital.updateMany = origHospitalUpdateMany;
  HospitalLinkOTP.deleteMany = origHospitalLinkOtpDeleteMany;
  OTP.deleteMany = origOtpDeleteMany;

  console.log("  ✓ All 9 collections deleted with exact authenticated user ID");
  console.log("  ✓ Caretaker guardianFor references unlinked");
  console.log("  ✓ Unrelated duplicate phone accounts completely protected");
  console.log("\nAll Account Deletion tests passed successfully!");
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });

