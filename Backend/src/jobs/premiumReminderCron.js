const cron = require("node-cron");

const Dose = require("../models/doseModel");

cron.schedule("0 9 * * *", async () => {

  try {

    const next7Days = new Date();

    next7Days.setDate(
      next7Days.getDate() + 7
    );

    const doses =
      await Dose.find({

        planType: "premium",

        expiryAt: {
          $lte: next7Days,
        },

        isDeleted: false,

        downloadReminderSent: false,

      });

    for (const dose of doses) {

      console.log(
        `Send download reminder:
        ${dose._id}`
      );

      // EMAIL / SMS / PUSH HERE

      dose.downloadReminderSent =
        true;

      await dose.save();
    }

  } catch (err) {

    console.log(
      "Reminder cron error:",
      err.message
    );
  }
});