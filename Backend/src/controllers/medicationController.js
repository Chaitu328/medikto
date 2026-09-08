const Medication = require("../models/medicationModel");
const { PLAN_LIMITS } = require("../utils/planLimits");
const { getEffectiveSubscription } = require("./subscriptionController");
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
const {
  getCache,
  setCache,
  invalidateUserDoseCache,
} = require("../utils/cache");

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
    const tzOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(Date.now() + tzOffset);
    return istTime.toISOString().split("T")[0];
  }
};

const getLocalTimeDetails = (dateObj, timezone = "Asia/Kolkata") => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = formatter.formatToParts(dateObj);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    const localDate = `${year}-${month}-${day}`;
    const totalMinutes = hour * 60 + minute;
    return { localDate, hour, minute, totalMinutes };
  } catch (err) {
    const tzOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(dateObj.getTime() + tzOffset);
    const fallbackDate = istTime.toISOString().split("T")[0];
    const hour = istTime.getUTCHours();
    const minute = istTime.getUTCMinutes();
    return { localDate: fallbackDate, hour, minute, totalMinutes: hour * 60 + minute };
  }
};

const getISTDateString = (dateObj, timezone = "Asia/Kolkata") => {
  if (!dateObj) return null;
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (isNaN(d.getTime())) return null;
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const parts = formatter.formatToParts(d);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    return `${year}-${month}-${day}`;
  } catch (err) {
    const tzOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(d.getTime() + tzOffset);
    return istTime.toISOString().split("T")[0];
  }
};

const getISTDayOfWeek = (dateInput, timezone = "Asia/Kolkata") => {
  const dateStr = typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
    ? dateInput
    : getISTDateString(dateInput, timezone);
  if (!dateStr) return 0;
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
};
const parseTimeToMinutes = (timeString) => {
  if (!timeString) return null;
  const cleanTime = timeString.replace(/\u202F|\u00A0/g, " ").trim();
  const isPM = cleanTime.toUpperCase().endsWith("PM");
  const isAM = cleanTime.toUpperCase().endsWith("AM");
  const timeDigits = cleanTime.replace(/[a-zA-Z\s]/g, "");
  const [hStr, mStr] = timeDigits.split(":");
  if (!hStr || !mStr) return null;
  let hour = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  if (isNaN(hour) || isNaN(minute)) return null;
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return hour * 60 + minute;
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
      hourCycle: "h23"
    });
    const parts = formatter.formatToParts(now);
    const currHour = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
    const currMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0", 10);
    const currTotalMinutes = currHour * 60 + currMinute;

    const doseTotalMinutes = parseTimeToMinutes(doseTime);
    if (doseTotalMinutes === null) return false;

    // Action window opens 10 minutes before scheduled time
    return currTotalMinutes < (doseTotalMinutes - 10);
  } catch (err) {
    return false;
  }
};

const isDoseExpired = (doseDate, doseTime, timezone = "Asia/Kolkata") => {
  if (!doseDate || !doseTime) return false;
  try {
    const today = getTodayDate(timezone);
    if (doseDate < today) return true;
    if (doseDate > today) return false;

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = formatter.formatToParts(now);
    const currHour = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
    const currMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0", 10);
    const currTotalMinutes = currHour * 60 + currMinute;

    const doseTotalMinutes = parseTimeToMinutes(doseTime);
    if (doseTotalMinutes === null) return false;

    return currTotalMinutes >= doseTotalMinutes + 60;
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

    // Entitlement check: enforce active medication limit based on subscription plan
    const user = await User.findById(req.user.id);
    const { limits, plan } = getEffectiveSubscription(user);
    if (limits && limits.medications !== Infinity) {
      const activeMedCount = await Medication.countDocuments({
        user: req.user.id,
        status: "active"
      });
      if (activeMedCount >= limits.medications) {
        return res.status(403).json({
          message: `Basic plan limit reached (max ${limits.medications} active medications). Please upgrade to Premium for unlimited medications.`,
          limitReached: true,
          currentCount: activeMedCount,
          maxLimit: limits.medications,
          plan
        });
      }
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
    const medStartDateStr = getISTDateString(medStartDate);
    const medEndDateStr = medEndDate ? getISTDateString(medEndDate) : null;

    // Creation timestamp details in Asia/Kolkata
    const createdTimestamp = medication.createdAt || new Date();
    const createdLocal = getLocalTimeDetails(createdTimestamp, "Asia/Kolkata");
    const creationDateStr = createdLocal.localDate;
    const creationTimeMinutes = createdLocal.totalMinutes;

    // Only generate doses for today if today falls within [startDate, endDate] or isContinue
    const isTodayValid = today >= medStartDateStr && (isOngoing || !medEndDateStr || today <= medEndDateStr);

    if (isTodayValid && medication.status === "active") {
      const doses = [];
      for (const t of timings) {
        const scheduledTimeStr = timingToTimeMap[t.toLowerCase()] || t;
        const scheduledMinutes = parseTimeToMinutes(scheduledTimeStr);

        // Rule: If today is the creation date and the scheduled time for today had ALREADY PASSED before creation,
        // do NOT generate a retroactive dose for today.
        if (today === creationDateStr && scheduledMinutes !== null && scheduledMinutes < creationTimeMinutes) {
          console.log(`[addMedication] Skipping past scheduled dose for new medication on creation date. Med=${medication._id} Scheduled=${scheduledTimeStr} (${scheduledMinutes}m) CreatedTime=${createdLocal.hour}:${createdLocal.minute} (${creationTimeMinutes}m)`);
          continue;
        }

        doses.push({
          user: req.user.id,
          medication: medication._id,
          name,
          dosage: `${dosage}${unit}`,
          date: today,
          time: scheduledTimeStr,
          status: "pending"
        });
      }

      if (doses.length > 0) {
        await Dose.insertMany(doses);
      }
    }

    // Invalidate user cache on new medication creation
    await invalidateUserDoseCache(req.user.id);

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

    const query = Medication.find({ ...filter, status: "active" }).sort({ createdAt: -1 });
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

// Helper to iterate every date from startDate (YYYY-MM-DD) to endDate (YYYY-MM-DD) in IST
const getDateRangeList = (startDate, endDate) => {
  const dates = [];
  try {
    const curr = new Date(`${startDate}T12:00:00Z`);
    const end = new Date(`${endDate}T12:00:00Z`);
    while (curr <= end) {
      const y = curr.getUTCFullYear();
      const m = String(curr.getUTCMonth() + 1).padStart(2, "0");
      const d = String(curr.getUTCDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
      curr.setUTCDate(curr.getUTCDate() + 1);
    }
  } catch (_) {}
  return dates;
};

// Continuous Zero-Filled Timeline Builder
const buildContinuousTimeline = (schedules, startDate, endDate, timeframe) => {
  const tf = (timeframe || "custom").toLowerCase();
  
  if (tf === "day" || tf === "1d" || startDate === endDate) {
    const slots = [
      { key: "Morning", label: "Morning (8:30 AM)", taken: 0, missed: 0, pending: 0 },
      { key: "Afternoon", label: "Afternoon (12:00 PM)", taken: 0, missed: 0, pending: 0 },
      { key: "Evening", label: "Evening (6:00 PM)", taken: 0, missed: 0, pending: 0 },
      { key: "Night", label: "Night (9:00 PM)", taken: 0, missed: 0, pending: 0 },
    ];
    for (const d of schedules) {
      const t = (d.time || "").toLowerCase();
      let slotIdx = 0;
      if (t.includes("12:") || t.includes("afternoon") || t.includes("01:") || t.includes("02:")) slotIdx = 1;
      else if (t.includes("06:") || t.includes("evening") || t.includes("05:") || t.includes("07:")) slotIdx = 2;
      else if (t.includes("09:") || t.includes("night") || (t.includes("08:") && t.includes("pm")) || t.includes("10:")) slotIdx = 3;
      
      const st = (d.status || "").toLowerCase();
      if (st === "taken") slots[slotIdx].taken++;
      else if (st === "missed") slots[slotIdx].missed++;
      else slots[slotIdx].pending++;
    }
    return slots.map(s => ({
      date: s.key,
      dayLabel: s.key,
      taken: s.taken,
      missed: s.missed,
      pending: s.pending,
    }));
  }

  if (tf === "year" || tf === "1y") {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthBuckets = {};
    
    try {
      const startY = parseInt(startDate.split("-")[0], 10);
      const endY = parseInt(endDate.split("-")[0], 10);
      
      for (let y = startY; y <= endY; y++) {
        for (let m = 0; m < 12; m++) {
          const mKey = `${y}-${String(m + 1).padStart(2, "0")}`;
          if (mKey >= startDate.substring(0, 7) && mKey <= endDate.substring(0, 7)) {
            monthBuckets[mKey] = {
              date: mKey,
              dayLabel: monthNames[m],
              taken: 0,
              missed: 0,
              pending: 0,
            };
          }
        }
      }
    } catch (_) {}
    
    for (const d of schedules) {
      const mKey = (d.date || "").substring(0, 7);
      if (monthBuckets[mKey]) {
        const st = (d.status || "").toLowerCase();
        if (st === "taken") monthBuckets[mKey].taken++;
        else if (st === "missed") monthBuckets[mKey].missed++;
        else monthBuckets[mKey].pending++;
      }
    }
    return Object.values(monthBuckets);
  }

  const allDates = getDateRangeList(startDate, endDate);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dateMap = {};
  
  for (const dt of allDates) {
    const dayOfWeek = getISTDayOfWeek(dt);
    dateMap[dt] = {
      date: dt,
      dayLabel: dayNames[dayOfWeek],
      taken: 0,
      missed: 0,
      pending: 0,
    };
  }

  for (const d of schedules) {
    const dt = d.date;
    if (dateMap[dt]) {
      const st = (d.status || "").toLowerCase();
      if (st === "taken") dateMap[dt].taken++;
      else if (st === "missed") dateMap[dt].missed++;
      else dateMap[dt].pending++;
    }
  }

  return Object.values(dateMap);
};

// ================= IDEMPOTENT DOSE RANGE BACKFILL =================
const ensureDosesExistForRange = async (userId, startDate, endDate) => {
  try {
    if (!userId || !startDate || !endDate) return { created: 0, skipped: 0 };

    const medications = await Medication.find({
      user: userId,
      status: { $in: ["active", "completed", "stopped", "cancelled"] }
    });
    if (!medications || medications.length === 0) return { created: 0, skipped: 0 };

    const dates = getDateRangeList(startDate, endDate);
    if (dates.length === 0) return { created: 0, skipped: 0 };

    // Fetch existing doses for this user in range
    const existingDoses = await Dose.find(
      {
        user: userId,
        date: { $gte: startDate, $lte: endDate },
      },
      { medication: 1, date: 1, time: 1 }
    ).lean();

    const existingKeySet = new Set(
      existingDoses.map((d) => `${d.medication?.toString()}_${d.date}_${(d.time || '').trim().toLowerCase()}`)
    );

    const todayIST = getTodayDate();
    const newDoses = [];

    for (const med of medications) {
      const medStartDate = med.startDate || med.createdAt || new Date();
      const medStartDateStr = getISTDateString(medStartDate);
      const medEndDateStr = (!med.isContinue && med.endDate) ? getISTDateString(med.endDate) : null;

      const medCreationDate = med.createdAt || med.startDate || new Date();
      const createdLocal = getLocalTimeDetails(medCreationDate, "Asia/Kolkata");
      const creationDateStr = createdLocal.localDate;
      const creationTimeMinutes = createdLocal.totalMinutes;

      for (const date of dates) {
        // If date is before medication start date, skip
        if (date < medStartDateStr) continue;

        // If date is after medication end date, skip
        if (medEndDateStr && date > medEndDateStr) continue;

        // If weekly frequency, match weekday
        if (med.frequency === "weekly") {
          const creationDay = getISTDayOfWeek(medStartDate);
          const targetDay = getISTDayOfWeek(date);
          if (creationDay !== targetDay) continue;
        }

        for (const t of med.timings) {
          const scheduledTimeStr = timingToTimeMap[t.toLowerCase()] || t;
          const key = `${med._id.toString()}_${date}_${scheduledTimeStr.trim().toLowerCase()}`;
          if (existingKeySet.has(key)) continue;

          const scheduledMinutes = parseTimeToMinutes(scheduledTimeStr);

          // On creation date, skip scheduled times that had already passed before medication creation
          if (date === creationDateStr && scheduledMinutes !== null && scheduledMinutes < creationTimeMinutes) {
            continue;
          }

          // Initial status:
          // Past date or expired today -> "missed"
          // Future/current window -> "pending"
          let initialStatus = "pending";
          if (date < todayIST || (date === todayIST && isDoseExpired(date, scheduledTimeStr))) {
            initialStatus = "missed";
          }

          newDoses.push({
            user: userId,
            medication: med._id,
            name: med.name,
            dosage: `${med.dosage}${med.unit}`,
            date: date,
            time: scheduledTimeStr,
            status: initialStatus,
          });

          existingKeySet.add(key);
        }
      }
    }

    if (newDoses.length > 0) {
      await Dose.insertMany(newDoses, { ordered: false });
    }

    return { created: newDoses.length, skipped: existingDoses.length };
  } catch (err) {
    console.log("Error in ensureDosesExistForRange:", err.message);
    return { created: 0, error: err.message };
  }
};

exports.ensureDosesExistForRange = ensureDosesExistForRange;

const ensureDosesExist = async (req, date) => {
  try {
    const patientIds = await getAccessiblePatientIds(req, req.query.patientId);
    if (!patientIds || patientIds.length === 0) return;
    for (const patientId of patientIds) {
      await ensureDosesExistForRange(patientId, date, date);
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
    }).sort({ time: 1 }).populate("medication");

    if (shouldPopulateUser(req)) {
      query.populate("user", "firstName phone email profilePic subscription hospitals");
    }

    const doses = await query;

    // Auto-expire any pending doses where 60-minute action window has passed
    const defaultTz = "Asia/Kolkata";
    for (const d of doses) {
      if (d.status === "pending") {
        const userTz = (d.user && d.user.timezone) || defaultTz;
        if (isDoseExpired(d.date, d.time, userTz)) {
          d.status = "missed";
          await d.save();
        }
      }
    }

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

    if (dose.status === "taken") {
      return res.status(400).json({
        message: "Dose is already marked as taken"
      });
    }

    if (dose.status === "missed") {
      return res.status(400).json({
        message: "Dose action window has expired (marked as missed)"
      });
    }

    if (dose.status === "cancelled") {
      return res.status(400).json({
        message: "Dose is cancelled"
      });
    }

    const tz = (dose.user && dose.user.timezone) || "Asia/Kolkata";
    if (isDoseInFuture(dose.date, dose.time, tz)) {
      return res.status(400).json({
        message: "Cannot mark a future dose as taken before its scheduled time"
      });
    }

    if (isDoseExpired(dose.date, dose.time, tz)) {
      dose.status = "missed";
      await dose.save();
      return res.status(400).json({
        message: "Dose action window has expired (60 minutes exceeded). This dose is marked as missed."
      });
    }

    dose.status = "taken";
    dose.takenAt = new Date();

    await dose.save();

    // Invalidate user cache on dose status change
    await invalidateUserDoseCache(dose.user?._id?.toString() || req.user.id);

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

    if (dose.status === "taken") {
      return res.status(400).json({
        message: "Dose is already marked as taken"
      });
    }

    if (dose.status === "missed") {
      return res.status(400).json({
        message: "Dose action window has expired (marked as missed)"
      });
    }

    if (dose.status === "cancelled") {
      return res.status(400).json({
        message: "Dose is cancelled"
      });
    }

    const tz = (dose.user && dose.user.timezone) || "Asia/Kolkata";
    if (isDoseInFuture(dose.date, dose.time, tz)) {
      return res.status(400).json({
        message: "Cannot mark a future dose as taken before its scheduled time"
      });
    }

    if (isDoseExpired(dose.date, dose.time, tz)) {
      dose.status = "missed";
      await dose.save();
      await invalidateUserDoseCache(dose.user?._id?.toString() || req.user.id);
      return res.status(400).json({
        message: "Dose action window has expired (60 minutes exceeded). This dose is marked as missed."
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
    const { limits, plan } = getEffectiveSubscription(user);

    const expiryAt = new Date();
    const retentionHours = limits?.selfieRetentionHours || 48;
    expiryAt.setHours(expiryAt.getHours() + retentionHours);

    dose.expiryAt = expiryAt;
    dose.planType = plan;

    await dose.save();

    // Invalidate user cache on dose verification
    await invalidateUserDoseCache(patientId);

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

    await invalidateUserDoseCache(dose.user?._id?.toString() || req.user.id);

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
    const filter = await buildUserAccessFilter(req);
    const currentMed = await Medication.findOne({ _id: req.params.id, ...filter });
    if (!currentMed) {
      return res.status(404).json({ message: "Medication not found or unauthorized" });
    }

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
    if (dosage) updateData.dosage = Number(dosage);
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

    await invalidateUserDoseCache(req.user.id);

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

    const filter = await buildUserAccessFilter(req);
    const med = await Medication.findOneAndUpdate(
      { _id: id, ...filter },
      { status },
      { new: true }
    );

    if (!med) {
      return res.status(404).json({ message: "Medication not found or unauthorized" });
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

    await invalidateUserDoseCache(req.user.id);

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

    const filter = await buildUserAccessFilter(req);
    const med = await Medication.findOne({ _id: id, ...filter });
    if (!med) {
      return res.status(404).json({ message: "Medication not found or unauthorized" });
    }

    // Mark medication as cancelled so it is removed from active schedule while keeping history
    med.status = "cancelled";
    await med.save();

    // Mark future pending doses as cancelled so reminders cease, preserving historical taken/missed records
    await Dose.updateMany(
      { medication: id, date: { $gte: today }, status: "pending" },
      { status: "cancelled", isDeleted: true }
    );

    await invalidateUserDoseCache(req.user.id);

    res.json({
      success: true,
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

      await invalidateUserDoseCache(dose.user?.toString());

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

      await invalidateUserDoseCache(dose.user?.toString());

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

  // ================= GET DOSE HISTORY (MULTI-DAY / DATE-RANGE) =================
  exports.getDoseHistory = async (req, res) => {
    try {
      let { startDate, endDate, timeframe, patientId } = req.query;

      const now = new Date();
      const todayIST = getTodayDate();

      // Resolve date range based on timeframe if not explicitly supplied
      if (timeframe && (!startDate || !endDate)) {
        const tf = timeframe.toLowerCase();
        if (tf === "day" || tf === "1d") {
          startDate = todayIST;
          endDate = todayIST;
        } else if (tf === "week" || tf === "1w") {
          const d = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
          startDate = getISTDateString(d);
          endDate = todayIST;
        } else if (tf === "month" || tf === "1m") {
          const d = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
          startDate = getISTDateString(d);
          endDate = todayIST;
        } else if (tf === "year" || tf === "1y") {
          const d = new Date(now.getTime() - 364 * 24 * 60 * 60 * 1000);
          startDate = getISTDateString(d);
          endDate = todayIST;
        }
      }

      if (!startDate || !endDate) {
        // Default: Last 30 days up to today
        const d = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        startDate = startDate || getISTDateString(d);
        endDate = endDate || todayIST;
      }

      // Ensure chronological ordering
      if (startDate > endDate) {
        const tmp = startDate;
        startDate = endDate;
        endDate = tmp;
      }

      const cacheKey = `dosehistory:${req.user.id}:${patientId || 'self'}:${startDate}:${endDate}:${timeframe || 'custom'}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }

      const patientIds = await getAccessiblePatientIds(req, patientId);
      if (!patientIds || patientIds.length === 0) {
        const emptyResponse = {
          success: true,
          timeframe: timeframe || "custom",
          startDate,
          endDate,
          summary: { total: 0, taken: 0, missed: 0, pending: 0, adherencePercentage: 0 },
          timeline: [],
          totalSchedules: 0,
          schedules: []
        };
        return res.status(200).json(emptyResponse);
      }

      // Run idempotent backfill for each accessible patient across the requested range
      for (const pId of patientIds) {
        await ensureDosesExistForRange(pId, startDate, endDate);
      }

      const filter = await buildUserAccessFilter(req, patientId);

      const query = Dose.find({
        ...filter,
        date: { $gte: startDate, $lte: endDate },
        isDeleted: { $ne: true }
      }).sort({ date: -1, time: 1 }).populate("medication");

      if (shouldPopulateUser(req)) {
        query.populate("user", "firstName phone email profilePic subscription hospitals");
      }

      const doses = await query;

      // Auto-expire pending doses where 60-min window has passed
      const defaultTz = "Asia/Kolkata";
      for (const d of doses) {
        if (d.status === "pending") {
          const userTz = (d.user && d.user.timezone) || defaultTz;
          if (isDoseExpired(d.date, d.time, userTz)) {
            d.status = "missed";
            await d.save();
          }
        }
      }

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

      // Calculate Summary Counts
      let takenCount = 0;
      let missedCount = 0;
      let pendingCount = 0;
      for (const d of resolvedSchedules) {
        const st = (d.status || "").toLowerCase();
        if (st === "taken") takenCount++;
        else if (st === "missed") missedCount++;
        else pendingCount++;
      }
      const totalCount = resolvedSchedules.length;
      const adherencePercentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

      // Build Continuous Zero-Filled Timeline
      const timeline = buildContinuousTimeline(resolvedSchedules, startDate, endDate, timeframe);

      const responseData = {
        success: true,
        timeframe: timeframe || "custom",
        startDate,
        endDate,
        summary: {
          total: totalCount,
          taken: takenCount,
          missed: missedCount,
          pending: pendingCount,
          adherencePercentage
        },
        timeline,
        totalSchedules: resolvedSchedules.length,
        schedules: resolvedSchedules,
      };

      // Set cache (TTL: 60s if range includes today, 15m if completely in the past)
      const ttl = endDate >= todayIST ? 60 : 900;
      await setCache(cacheKey, responseData, ttl);

      res.status(200).json(responseData);

    } catch (err) {
      console.log("DOSE HISTORY ERROR:", err.message);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  };

