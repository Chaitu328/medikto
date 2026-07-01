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

    // Build a 12-hour time string to match stored dose times (e.g. "08:30 AM")
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const currentTime12 = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    const currentTime12NoZero = `${hours}:${minutes} ${ampm}`;

    // Build today's date string (YYYY-MM-DD) to match stored dose dates
    const today = now.toISOString().split("T")[0];

    console.log(`[Reminder] Checking pending doses at ${currentTime12} on ${today}`);

    // Find all pending doses for the current date and matching times
    const dueDoses = await Dose.find({
      date: today,
      time: { $in: [currentTime12, currentTime12NoZero] },
      status: "pending",
    }).populate("user", "firstName phone fcmToken");

    if (dueDoses.length === 0) {
      return; // Nothing due right now
    }

    console.log(`[Reminder] Found ${dueDoses.length} due dose(s). Sending notifications...`);

    // Send a push notification for each due dose
    for (const dose of dueDoses) {
      if (!dose.user) continue;

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

  } catch (err) {
    console.error("[Reminder] Cron error:", err.message);
  }
});