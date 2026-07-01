const cron = require("node-cron");
const Dose = require("../models/doseModel");
const { sendPushNotification } = require("../utils/notificationHelper");

// ==========================================
// MEDICATION REMINDER CRON JOB
// Runs every minute. Checks for pending doses
// due at the current time and fires FCM alerts.
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
      status: "pending"
    }).populate("user", "firstName phone fcmToken timezone");

    if (pendingDoses.length === 0) {
      return;
    }

    for (const dose of pendingDoses) {
      if (!dose.user) continue;

      const tz = dose.user.timezone || "UTC";

      let localStr;
      try {
        localStr = now.toLocaleString("en-US", {
          timeZone: tz,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: true
        });
      } catch (tzErr) {
        localStr = now.toLocaleString("en-US", {
          timeZone: "UTC",
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
    }

  } catch (err) {
    console.error("[Reminder] Cron error:", err.message);
  }
});