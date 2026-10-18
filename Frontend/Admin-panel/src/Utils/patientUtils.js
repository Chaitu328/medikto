/**
 * Utility functions for resolving and formatting patient details
 * across Vitals, Medications, Prescriptions, and Reports.
 */

/**
 * Returns a human-friendly display name for a patient.
 * If no valid patient or name exists, returns 'Patient information unavailable'.
 */
export function getPatientDisplayName(patient) {
  if (!patient || typeof patient !== "object") {
    return "Patient information unavailable";
  }

  const parts = [patient.firstName, patient.lastName].filter(Boolean);
  const fullName = parts.join(" ").trim();
  if (fullName) return fullName;

  if (patient.name && typeof patient.name === "string" && patient.name.trim()) {
    return patient.name.trim();
  }

  if (patient.phone && typeof patient.phone === "string" && patient.phone.trim()) {
    return patient.phone.trim();
  }

  if (patient.email && typeof patient.email === "string" && patient.email.trim()) {
    return patient.email.trim();
  }

  const rawId = patient._id || patient.id;
  if (rawId) {
    return `Patient (${String(rawId).slice(-6)})`;
  }

  return "Patient information unavailable";
}

/**
 * Returns a secondary identifier for a patient (e.g. phone, ID, or email).
 */
export function getPatientIdentifier(patient) {
  if (!patient || typeof patient !== "object") return "";

  if (patient.patientId) {
    return `ID: ${patient.patientId}`;
  }

  if (patient.phone) {
    return patient.phone;
  }

  if (patient.email) {
    return patient.email;
  }

  const rawId = patient._id || patient.id;
  if (rawId) {
    return `ID: ${String(rawId).slice(-6)}`;
  }

  return "";
}

/**
 * Robustly resolves a record's associated patient.
 * Handles:
 * 1. Populated patient/user objects
 * 2. Unpopulated string IDs / ObjectIds matched against `usersList`
 * 3. Fallback to null (never assumes relationships or uses array index)
 *
 * @param {Object} record - The record (vital, medication, prescription, report)
 * @param {Array} usersList - Optional list of authorized patients
 * @returns {Object|null} - The resolved patient object, or null
 */
export function resolvePatient(record, usersList = []) {
  if (!record || typeof record !== "object") return null;

  // 1. Populated user object
  if (record.user && typeof record.user === "object") {
    if (
      record.user.firstName ||
      record.user.lastName ||
      record.user.name ||
      record.user.phone ||
      record.user.email
    ) {
      return record.user;
    }
    // If it's an object with only _id, try looking it up
    const objId = record.user._id || record.user.id;
    if (objId && Array.isArray(usersList) && usersList.length > 0) {
      const found = usersList.find(
        (u) => String(u._id || u.id) === String(objId)
      );
      if (found) return found;
    }
    if (objId) return record.user;
  }

  // 2. Populated patient object
  if (record.patient && typeof record.patient === "object") {
    if (
      record.patient.firstName ||
      record.patient.lastName ||
      record.patient.name ||
      record.patient.phone ||
      record.patient.email
    ) {
      return record.patient;
    }
    const pId = record.patient._id || record.patient.id;
    if (pId && Array.isArray(usersList) && usersList.length > 0) {
      const found = usersList.find(
        (u) => String(u._id || u.id) === String(pId)
      );
      if (found) return found;
    }
    if (pId) return record.patient;
  }

  // 3. String references (user, patient, patientId, userId)
  const rawId =
    (typeof record.user === "string" ? record.user : null) ||
    (typeof record.patient === "string" ? record.patient : null) ||
    (typeof record.patientId === "string" ? record.patientId : null) ||
    (typeof record.userId === "string" ? record.userId : null) ||
    (record.user?._id ? String(record.user._id) : null) ||
    (record.patient?._id ? String(record.patient._id) : null);

  if (rawId && Array.isArray(usersList) && usersList.length > 0) {
    const found = usersList.find(
      (u) =>
        String(u._id || u.id) === String(rawId) ||
        String(u.patientId) === String(rawId)
    );
    if (found) return found;
  }

  return null;
}

/**
 * Checks if a record belongs to a specific patient.
 *
 * @param {Object} record - The record to check
 * @param {Object|string} targetPatientOrId - Patient object or ID string
 * @param {Array} usersList - Optional list of authorized patients
 * @returns {boolean}
 */
export function recordMatchesPatient(record, targetPatientOrId, usersList = []) {
  if (!record || !targetPatientOrId) return false;

  const targetId =
    typeof targetPatientOrId === "object"
      ? String(targetPatientOrId._id || targetPatientOrId.id || "")
      : String(targetPatientOrId);

  if (!targetId || targetId === "all") return true;

  const resolved = resolvePatient(record, usersList);
  if (resolved) {
    const resolvedId = String(resolved._id || resolved.id || "");
    if (resolvedId && resolvedId === targetId) return true;
    if (resolved.patientId && String(resolved.patientId) === targetId) return true;
  }

  // Direct check on record fields as fallback
  const recUserId =
    typeof record.user === "object"
      ? String(record.user?._id || record.user?.id || "")
      : String(record.user || "");

  const recPatientId =
    typeof record.patient === "object"
      ? String(record.patient?._id || record.patient?.id || "")
      : String(record.patient || record.patientId || "");

  return recUserId === targetId || recPatientId === targetId;
}
