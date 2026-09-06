const cron = require("node-cron");
const Dose = require("../models/doseModel");
const { sendPushNotification } = require("../utils/notificationHelper");

const parseTimeToMinutes = (timeString) => {
  if (!timeString) return null;
  // Normalize whitespace, remove non-breaking spaces
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
    const fallbackDate = dateObj.toISOString().split("T")[0];
    return { localDate: fallbackDate, hour: dateObj.getUTCHours(), minute: dateObj.getUTCMinutes(), totalMinutes: dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes() };
  }
};

// ==========================================
// MEDICATION REMINDER CRON JOB
// Runs every minute. Checks for pending doses
// due at the current time and fires FCM alerts.
// Also detects missed doses 60 minutes after
// scheduled time and dispatches missed alerts.
// ==========================================
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const utcDateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD in UTC
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Find pending doses within a 3-day window of UTC now
    const pendingDoses = await Dose.find({
      date: { $in: [yesterday, utcDateStr, tomorrow] },
      status: "pending",
      isDeleted: { $ne: true }
    })
      .populate("user", "firstName phone fcmToken timezone")
      .populate("medication", "status notifications");

    if (pendingDoses.length === 0) {
      return;
    }

    for (const dose of pendingDoses) {
      if (!dose.user) continue;

      // If medication exists and is stopped, completed, cancelled, or has notifications disabled, skip
      if (dose.medication) {
        if (dose.medication.status && dose.medication.status !== "active") {
          continue;
        }
        if (dose.medication.notifications === false) {
          continue;
        }
      }

      const tz = dose.user.timezone || "Asia/Kolkata";
      const { localDate: userLocalDate, totalMinutes: currentMinutes, hour: currH, minute: currM } = getLocalTimeDetails(now, tz);
      const scheduledMinutes = parseTimeToMinutes(dose.time);

      if (scheduledMinutes === null) {
        continue;
      }

      // 1. Regular on-time reminder
      if (dose.date === userLocalDate && currentMinutes === scheduledMinutes) {
        console.log(`[Reminder:Scheduled] Dose=${dose._id} User=${dose.user._id} (${tz}) Time=${dose.time} CurrentIST=${userLocalDate} ${currH}:${currM}`);
        
        const userName = dose.user.firstName || dose.user.phone || "User";
        const title = "💊 Medication Reminder";
        const body = `Hi ${userName}, it's time to take your ${dose.name} (${dose.dosage}).`;
        const data = {
          type: "medicine",
          doseId: dose._id.toString(),
          medicineName: dose.name || "",
          dosage: dose.dosage || "",
          time: dose.time || "",
        };

        const dispatchResult = await sendPushNotification(dose.user._id.toString(), title, body, data);
        console.log(`[Reminder:Scheduled:Result] Dose=${dose._id} Success=${dispatchResult?.success} Reason=${dispatchResult?.reason || dispatchResult?.error || "OK"}`);
      }

      // 2. Missed dose check (1 hour / 60 minutes after scheduled time)
      const isPastDate = dose.date < userLocalDate;
      const isPastOneHourToday = (dose.date === userLocalDate && currentMinutes >= scheduledMinutes + 60);

      if (isPastDate || isPastOneHourToday) {
        console.log(`[Reminder:Missed] Dose=${dose._id} (${dose.name}) marked MISSED. Scheduled=${dose.date} ${dose.time}, Current=${userLocalDate} ${currH}:${currM}`);
        dose.status = "missed";

        if (!dose.missedReminderSent) {
          dose.missedReminderSent = true;
          const userName = dose.user.firstName || dose.user.phone || "User";
          const title = "⚠️ Missed Medication Reminder";
          const body = `Hi ${userName}, you missed your dose of ${dose.name} (${dose.dosage}) scheduled for ${dose.time}.`;
          const data = {
            type: "missed_medicine",
            doseId: dose._id.toString(),
            medicineName: dose.name || "",
            dosage: dose.dosage || "",
            time: dose.time || "",
          };

          const missedResult = await sendPushNotification(dose.user._id.toString(), title, body, data);
          console.log(`[Reminder:Missed:Result] Dose=${dose._id} Success=${missedResult?.success} Reason=${missedResult?.reason || missedResult?.error || "OK"}`);
        }

        await dose.save();
      }
    }

  } catch (err) {
    console.error("[Reminder] Cron error:", err.message);
  }
});