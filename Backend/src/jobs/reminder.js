const cron = require("node-cron");
const Medication = require("../models/medicationModel");

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const currentTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    console.log("Checking time:", currentTime);

    const meds = await Medication.find({
      "schedule.time": currentTime
    });

    meds.forEach(med => {
      console.log(`Reminder for user ${med.user} at ${currentTime}`);
    });

  } catch (err) {
    console.error("Cron error:", err);
  }
});