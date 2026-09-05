const Medication = require("../models/medicationModel");
const PLAN_LIMITS = require("../utils/planLimits");
const User = require("../models/userModel");
const Dose = require("../models/doseModel");
const {
  uploadBufferToS3,
  generateDoseProofKey,
  resolveFileUrl,
  deleteS3Object,
} = require("../config/s3");
const { applySelfieWatermark } = require("../utils/watermarkHelper");
const {
  buildUserAccessFilter,
  shouldPopulateUser,
  getAccessiblePatientIds,
} = require("../utils/accessControl");

const timingToTimeMap = {
  morning: "08:30 AM",
  afternoon: "12:00 PM",
  evening: "06:00 PM",
  night: "09:00 PM"
};

const getTodayDate = (timezone = "Asia/Kolkata") => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const year = parts.find(p => p.type === "year").value;
    const month = parts.find(p => p.type === "month").value;
    const day = parts.find(p => p.type === "day").value;
    return `${year}-${month}-${day}`;
  } catch (_) {
    return new Date().toISOString().split("T")[0];
  }
};

const isDoseInFuture = (doseDate, doseTime, timezone = "Asia/Kolkata") => {
  if (!doseDate || !doseTime) return false;
  try {
    const today = getTodayDate(timezone);
    if (doseDate > today) return true;
    if (doseDate < today) return false;

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    const parts = formatter.format(now).split(":");
    const currHour = parseInt(parts[0], 10);
    const currMinute = parseInt(parts[1], 10);
    const currTotalMinutes = currHour * 60 + currMinute;

    const cleanTime = doseTime.trim();
    const isPM = cleanTime.toUpperCase().endsWith("PM");
    const isAM = cleanTime.toUpperCase().endsWith("AM");
    const timeDigits = cleanTime.replace(/[a-zA-Z\s]/g, "");
    const [hStr, mStr] = timeDigits.split(":");
    let doseHour = parseInt(hStr, 10);
    const doseMinute = parseInt(mStr, 10);
    if (isPM && doseHour < 12) doseHour += 12;
    if (isAM && doseHour === 12) doseHour = 0;
    const doseTotalMinutes = doseHour * 60 + doseMinute;

    return currTotalMinutes < doseTotalMinutes;
  } catch (err) {
    return false;
  }
};

// ================= ADD MEDICATION =================
exports.addMedication = async (req, res) => {
  try {
    const {
      name,
      dosage,
      unit,
      timings,
      notifications,
      instructions,
      frequency,
      startDate,
      duration,
      isContinue,
      status
    } = req.body;

    if (!name || !dosage || !unit || !timings?.length) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const medStartDate = startDate ? new Date(startDate) : new Date();
    let medEndDate = null;
    const isOngoing = isContinue === true || isContinue === "true";

    if (!isOngoing && duration && Number(duration) > 0) {
      const durationDays = Number(duration);
      medEndDate = new Date(medStartDate.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000);
    }

    const medication = await Medication.create({
      user: req.user.id,
      name,
      dosage,
      unit,
      timings,
      notifications: notifications !== undefined ? notifications : true,
      instructions,
      frequency: frequency || "daily",
      startDate: medStartDate,
      duration: duration ? Number(duration) : null,
      endDate: medEndDate,
      isContinue: isOngoing,
      status: status || "active"
    });

    const today = getTodayDate();
    const medStartDateStr = medStartDate.toISOString().split("T")[0];
    const medEndDateStr = medEndDate ? medEndDate.toISOString().split("T")[0] : null;

    // Only generate doses for today if today falls within [startDate, endDate] or isContinue
    const isTodayValid = today >= medStartDateStr && (isOngoing || !medEndDateStr || today <= medEndDateStr);

    if (isTodayValid && medication.status === "active") {
      const doses = timings.map((t) => ({
        user: req.user.id,
        medication: medication._id,
        name,
        dosage: `${dosage}${unit}`,
        date: today,
        time: timingToTimeMap[t.toLowerCase()] || t,
        status: "pending"
      }));

      await Dose.insertMany(doses);
    }

    res.status(201).json({
      message: "Medication added",
      medication
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ================= GET MEDICATIONS =================
exports.getMedications = async (req, res) => {
  try {
    const filter = await buildUserAccessFilter(req, req.query.patientId);

    const query = Medication.find(filter).sort({ createdAt: -1 });
    if (shouldPopulateUser(req)) {
      query.populate("user", "firstName phone email profilePic subscription hospitals");
    }

    const meds = await query;

    res.json(meds);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const ensureDosesExist = async (req, date) => {
  try {
    const patientIds = await getAccessiblePatientIds(req, req.query.patientId);
    if (!patientIds || patientIds.length === 0) return;

    for (const patientId of patientIds) {
      const medications = await Medication.find({ user: patientId });
      if (!medications || medications.length === 0) continue;

      for (const med of medications) {
        // Skip inactive, stopped, completed, or cancelled medications
        if (med.status && med.status !== "active") {
          continue;
        }

        // Date range checks
        const medStartDate = med.startDate || med.createdAt || new Date();
        const medStartDateStr = new Date(medStartDate).toISOString().split("T")[0];
        
        // If target date is before the medication's start date, skip
        if (date < medStartDateStr) {
          continue;
        }

        // If not continuous and end date exists, check if date is past end date
        if (!med.isContinue && med.endDate) {
          const medEndDateStr = new Date(med.endDate).toISOString().split("T")[0];
          if (date > medEndDateStr) {
            // Auto-complete medication if past end date
            const todayStr = getTodayDate();
            if (todayStr > medEndDateStr && med.status === "active") {
              med.status = "completed";
              await med.save();
            }
            continue;
          }
        }

        if (med.frequency === "weekly") {
          const creationDay = new Date(medStartDate).getDay();
          const targetDay = new Date(date).getDay();
          if (creationDay !== targetDay) {
            continue; // Skip this medication on this date since it is not the scheduled weekday
          }
        }

        const doseExists = await Dose.exists({
          user: patientId,
          medication: med._id,
          date: date,
        });

        if (!doseExists) {
          const newDoses = med.timings.map((t) => ({
            user: patientId,
            medication: med._id,
            name: med.name,
            dosage: `${med.dosage}${med.unit}`,
            date: date,
            time: timingToTimeMap[t.toLowerCase()] || t,
            status: "pending",
          }));

          if (newDoses.length > 0) {
            await Dose.insertMany(newDoses);
          }
        }
      }
    }
  } catch (err) {
    console.log("Error in ensureDosesExist:", err.message);
  }
};

exports.getTodaySchedule = async (req, res) => {
  try {
    // Get selected date from query
    const selectedDate = req.query.date;

    // If no date sent, use today
    const date = selectedDate || getTodayDate();

    // Ensure schedules exist for this date
    await ensureDosesExist(req, date);

    const filter = await buildUserAccessFilter(req, req.query.patientId);

    // Fetch doses filtered by user and date
    const query = Dose.find({
      ...filter,
      date: date,
    }).sort({ time: 1 });

    if (shouldPopulateUser(req)) {
      query
        .populate("user", "firstName phone email profilePic subscription hospitals")
        .populate("medication");
    }

    const doses = await query;

    // Resolve presigned URLs for private proof images and profile pictures
    const resolvedSchedules = await Promise.all(
      doses.map(async (d) => {
        const dObj = d.toObject ? d.toObject() : d;
        if (dObj.proofImage) {
          dObj.proofImage = await resolveFileUrl(dObj.proofImage);
        }
        if (dObj.user && dObj.user.profilePic) {
          dObj.user.profilePic = await resolveFileUrl(dObj.user.profilePic);
        }
        return dObj;
      })
    );

    res.status(200).json({
      success: true,
      selectedDate: date,
      totalSchedules: resolvedSchedules.length,
      schedules: resolvedSchedules,
    });

  } catch (err) {
    console.log("SCHEDULE ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ================= MARK AS TAKEN =================
exports.markAsTaken = async (req, res) => {
  try {

    const { doseId } = req.params;

    const dose = await Dose.findById(doseId).populate("user");

    if (!dose) {
      return res.status(404).json({
        message: "Dose not found"
      });
    }

    // Verify user has access to this dose
    const filter = await buildUserAccessFilter(req, dose.user._id.toString());
    if (Object.keys(filter).length > 0 && !filter.user) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const tz = (dose.user && dose.user.timezone) || "Asia/Kolkata";
    if (isDoseInFuture(dose.date, dose.time, tz)) {
      return res.status(400).json({
        message: "Cannot mark a future dose as taken before its scheduled time"
      });
    }

    dose.status = "taken";
    dose.takenAt = new Date();

    await dose.save();

    const doseObj = dose.toObject();
    if (doseObj.proofImage) {
      doseObj.proofImage = await resolveFileUrl(doseObj.proofImage);
    }

    res.json(doseObj);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ================= VERIFY WITH SELFIE =================
exports.verifyWithSelfie = async (req, res) => {
  try {

    const { doseId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Selfie required"
      });
    }

    const dose = await Dose.findById(doseId).populate("user");

    if (!dose) {
      return res.status(404).json({
        message: "Dose not found"
      });
    }

    // Verify user has access to this dose
    const filter = await buildUserAccessFilter(req, dose.user._id.toString());
    if (Object.keys(filter).length > 0 && !filter.user) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const tz = (dose.user && dose.user.timezone) || "Asia/Kolkata";
    if (isDoseInFuture(dose.date, dose.time, tz)) {
      return res.status(400).json({
        message: "Cannot mark a future dose as taken before its scheduled time"
      });
    }

    const now = new Date();

    // 1. Apply watermark with Sharp in memory (bounded at 32MB)
    const watermarkedBuffer = await applySelfieWatermark(req.file.buffer, now);

    // 2. Upload to private S3 under patients/{userId}/doses/{doseId}_proof.jpg
    const patientId = (dose.user && dose.user._id) ? dose.user._id.toString() : req.user.id;
    const s3Key = generateDoseProofKey(patientId, dose._id.toString());
    await uploadBufferToS3(watermarkedBuffer, s3Key, "image/jpeg");

    dose.status = "taken";
    dose.takenAt = now;
    dose.verified = true;
    dose.verifiedAt = now;
    dose.proofImage = s3Key;

    const user = await User.findById(dose.user || req.user.id);

const expiryAt = new Date();

// FREE + BASIC
if (
  user.subscription === "free" ||
  user.subscription === "basic"
) {

  expiryAt.setHours(
    expiryAt.getHours() + 48
  );
}

// PREMIUM
else if (
  user.subscription === "premium"
) {

  expiryAt.setMonth(
    expiryAt.getMonth() + 3
  );
}

dose.expiryAt = expiryAt;

dose.planType =
  user.subscription;

    await dose.save();

    res.json({
      message: "Verification successful",
      dose
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ================= DELETE SELFIE =================
exports.deleteSelfie = async (req, res) => {
  try {

    const { doseId } = req.params;

    const dose = await Dose.findById(doseId).populate("user");

    if (!dose) {
      return res.status(404).json({
        message: "Dose not found"
      });
    }

    // Verify user has access to this dose
    const filter = await buildUserAccessFilter(req, dose.user._id.toString());
    if (Object.keys(filter).length > 0 && !filter.user) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    dose.isDeleted = true;
    dose.deletedAt = new Date();
    dose.deletionReason = "system-auto-delete";
    dose.deletedBy = "system";

    const recoverDate = new Date();

    recoverDate.setFullYear(
      recoverDate.getFullYear() + 1
    );

    dose.canRecoverUntil = recoverDate;

    await dose.save();

    res.json({
      message: "Selfie deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ================= UPDATE MEDICATION =================
exports.updateMedication = async (req, res) => {
  try {
    const {
      name,
      dosage,
      unit,
      timings,
      notifications,
      instructions,
      frequency,
      startDate,
      duration,
      isContinue,
      status
    } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (dosage) updateData.dosage = dosage;
    if (unit) updateData.unit = unit;
    if (notifications !== undefined) updateData.notifications = notifications;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (frequency) updateData.frequency = frequency;
    if (startDate) updateData.startDate = new Date(startDate);
    if (isContinue !== undefined) updateData.isContinue = isContinue === true || isContinue === "true";
    if (duration !== undefined) updateData.duration = duration ? Number(duration) : null;
    if (status) updateData.status = status;

    if (timings) {
      updateData.timings = timings;
    }

    // Recalculate endDate
    const currentMed = await Medication.findById(req.params.id);
    if (!currentMed) {
      return res.status(404).json({ message: "Medication not found" });
    }

    const effStartDate = updateData.startDate || currentMed.startDate || currentMed.createdAt || new Date();
    const effIsContinue = updateData.isContinue !== undefined ? updateData.isContinue : currentMed.isContinue;
    const effDuration = updateData.duration !== undefined ? updateData.duration : currentMed.duration;

    if (!effIsContinue && effDuration && Number(effDuration) > 0) {
      updateData.endDate = new Date(new Date(effStartDate).getTime() + (Number(effDuration) - 1) * 24 * 60 * 60 * 1000);
    } else if (effIsContinue) {
      updateData.endDate = null;
    }

    const med = await Medication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // If status changed to stopped/completed/cancelled, cancel future pending doses
    const today = getTodayDate();
    if (med.status && med.status !== "active") {
      await Dose.updateMany(
        { medication: med._id, date: { $gte: today }, status: "pending" },
        { status: "cancelled" }
      );
    } else if (med.status === "active") {
      // Re-activate cancelled future doses
      await Dose.updateMany(
        { medication: med._id, date: { $gte: today }, status: "cancelled" },
        { status: "pending" }
      );
    }

    res.json(med);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ================= UPDATE MEDICATION STATUS =================
exports.updateMedicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "completed", "stopped", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const med = await Medication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!med) {
      return res.status(404).json({ message: "Medication not found" });
    }

    const today = getTodayDate();
    if (status !== "active") {
      // Safely mark future pending doses as cancelled rather than physical deletion
      await Dose.updateMany(
        { medication: med._id, date: { $gte: today }, status: "pending" },
        { status: "cancelled" }
      );
    } else {
      // If re-activated, restore future cancelled doses to pending
      await Dose.updateMany(
        { medication: med._id, date: { $gte: today }, status: "cancelled" },
        { status: "pending" }
      );
    }

    res.json({
      success: true,
      message: `Medication status updated to ${status}`,
      medication: med
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ================= DELETE MEDICATION =================
exports.deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const today = getTodayDate();

    // Mark future pending doses as cancelled so reminders cease, preserving historical taken/missed records
    await Dose.updateMany(
      { medication: id, date: { $gte: today }, status: "pending" },
      { status: "cancelled", isDeleted: true }
    );

    await Medication.findByIdAndDelete(id);

    res.json({
      message: "Medication deleted"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


exports.recoverSelfie =
  async (req, res) => {

    try {

      const dose =
        await Dose.findById(
          req.params.id
        );

      if (!dose) {
        return res.status(404).json({
          message:
            "Dose not found",
        });
      }

      dose.isDeleted = false;

      dose.deletedAt = null;

      dose.deletionReason = null;

      await dose.save();

      res.json({
        success: true,
        message:
          "Recovered successfully",
      });

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });
    }
  };


  exports.adminDeleteSelfie =
  async (req, res) => {

    try {

      const dose =
        await Dose.findById(
          req.params.id
        );

      if (!dose) {
        return res.status(404).json({
          message:
            "Dose not found",
        });
      }

      dose.isDeleted = true;

      dose.deletedBy = "admin";

      dose.deletedAt = new Date();

      dose.deletionReason =
        "admin-delete";

      const recoverDate =
        new Date();

      recoverDate.setFullYear(
        recoverDate.getFullYear() + 1
      );

      dose.canRecoverUntil =
        recoverDate;

      await dose.save();

      res.json({
        success: true,
        message:
          "Deleted successfully",
      });

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });
    }
  };

  exports.getDeletedSelfies =
  async (req, res) => {

    try {

      const doses =
        await Dose.find({

          isDeleted: true,

        })
        .populate(
          "user",
          "firstName phone"
        )
        .sort({
          deletedAt: -1,
        });

      res.json({
        success: true,
        doses,
      });

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });
    }
  };
