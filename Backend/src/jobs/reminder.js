const cron = require("node-cron");
const Dose = require("../models/doseModel");
const { sendPushNotification } = require("../utils/notificationHelper");

const parseTimeToMinutes = (timeString) => {
  if (!timeString) return null;
  const cleanTime = timeString.trim();
  const isPM = cleanTime.toUpperCase().endsWith("PM");
  const isAM = cleanTime.toUpperCase().endsWith("AM");
  const timeDigits = cleanTime.replace(/[a-zA-Z\s]/g, "");
  const [hStr, mStr] = timeDigits.split(":");
  if (!hStr || !mStr) return null;
  let hour = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return hour * 60 + minute;
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

      let localStr;
      try {
        localStr = now.toLocaleString("en-US", {
          timeZone: tz,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: true
        });
      } catch (tzErr) {
        localStr = now.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: true
        });
      }

      // Parse output e.g. "07/01/2026, 02:30 PM"
      const parts = localStr.split(", ");
      if (parts.length < 2) continue;

      const dateParts = parts[0].split("/");
      if (dateParts.length < 3) continue;

      const userLocalDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`; // YYYY-MM-DD
      const timeStr = parts[1].replace(/^0/, ""); // "2:30 PM"
      const timeStrWithZero = parts[1]; // "02:30 PM"

      // 1. Regular on-time reminder
      if (dose.date === userLocalDate && 
          (dose.time === timeStr || dose.time === timeStrWithZero)) {
        
        console.log(`[Reminder] Timezone triggered: User ${dose.user._id} (${tz}) matches scheduled time ${dose.time} at user local date ${userLocalDate}`);
        
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

        await sendPushNotification(dose.user._id.toString(), title, body, data);
      }

      // 2. Missed dose check (1 hour / 60 minutes after scheduled time)
      const scheduledMinutes = parseTimeToMinutes(dose.time);
      const currentMinutes = parseTimeToMinutes(parts[1]);

      if (scheduledMinutes !== null && currentMinutes !== null) {
        const isPastDate = dose.date < userLocalDate;
        const isPastOneHourToday = (dose.date === userLocalDate && currentMinutes >= scheduledMinutes + 60);

        if (isPastDate || isPastOneHourToday) {
          console.log(`[Reminder] Dose ${dose._id} (${dose.name}) is missed. Scheduled: ${dose.date} ${dose.time}, Current: ${userLocalDate} ${parts[1]}`);
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

            await sendPushNotification(dose.user._id.toString(), title, body, data);
          }

          await dose.save();
        }
      }
    }

  } catch (err) {
    console.error("[Reminder] Cron error:", err.message);
  }
});