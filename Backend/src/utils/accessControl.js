const mongoose = require("mongoose");
const Hospital = require("../models/hospitalModel");
const User = require("../models/userModel");

const toIdString = (id) => (id ? id.toString() : null);

const uniqueIds = (ids) => {
  return [...new Set(ids.map(toIdString).filter(Boolean))];
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAdminHospitalIds = async (adminId) => {
  if (adminId === "123456") {
    const demoHospital = await Hospital.findOne({ name: "Demo Hospital" }).select("_id");
    return demoHospital ? [demoHospital._id.toString()] : [];
  }

  const hospitalIds = [];

  if (isValidObjectId(adminId)) {
    const admin = await User.findById(adminId).select("hospital");
    if (admin?.hospital) {
      hospitalIds.push(admin.hospital);
    }

    const hospitals = await Hospital.find({ adminId }).select("_id");
    hospitalIds.push(...hospitals.map((hospital) => hospital._id));
  }

  return uniqueIds(hospitalIds);
};

const filterRequestedPatient = (patientIds, requestedPatientId) => {
  if (!requestedPatientId) {
    return patientIds;
  }

  const requested = requestedPatientId.toString();
  return patientIds.includes(requested) ? [requested] : [];
};

const getAccessiblePatientIds = async (req, requestedPatientId) => {
  const role = req.user?.role;
  const requesterId = req.user?.id;

  if (role === "superadmin") {
    return null;
  }

  if (!requesterId) {
    return [];
  }

 if (role === "admin") {
  const admin = await User.findById(requesterId).select("hospital");

  if (!admin || !admin.hospital) {
    return [];
  }

 const patientIds = await User.find({
  role: "user",
  $or: [
    { hospital: admin.hospital },
    { hospitals: admin.hospital },
  ],
}).distinct("_id");

  return filterRequestedPatient(uniqueIds(patientIds), requestedPatientId);
}


  if (role === "guardian") {
    if (!isValidObjectId(requesterId)) {
      return [];
    }

    const guardian = await User.findById(requesterId).select("guardianFor");
    const patientIds = uniqueIds(guardian?.guardianFor || []);
    return filterRequestedPatient(patientIds, requestedPatientId);
  }

  if (role === "user") {
    const ownId = requesterId.toString();
    return filterRequestedPatient([ownId], requestedPatientId);
  }

  return [];
};

const buildUserAccessFilter = async (req, requestedPatientId) => {
  const patientIds = await getAccessiblePatientIds(req, requestedPatientId);

  if (patientIds === null) {
    return {};
  }

  if (patientIds.length === 1) {
    return { user: patientIds[0] };
  }

  return { user: { $in: patientIds } };
};

const buildPatientListFilter = async (req, requestedPatientId) => {
  const patientIds = await getAccessiblePatientIds(req, requestedPatientId);

  // Super Admin -> return all users
  if (patientIds === null) {
    return {};
  }

  // Admin/Guardian -> only patient users
  return {
    role: "user",
    _id: { $in: patientIds },
  };
};

const shouldPopulateUser = (req) => {
  return ["superadmin", "admin", "guardian"].includes(req.user?.role);
};

module.exports = {
  buildPatientListFilter,
  buildUserAccessFilter,
  getAccessiblePatientIds,
  shouldPopulateUser,
};
