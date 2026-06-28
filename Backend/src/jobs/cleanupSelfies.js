const cron = require("node-cron");

const Dose = require("../models/doseModel");

const deleteExpiredSelfies = async () => {

  try {

    const now = new Date();

    // find expired selfies
    const doses = await Dose.find({

      expiryAt: { $lte: now },

      isDeleted: false,

      proofImage: { $ne: null }

    });

    for (const dose of doses) {

      // soft delete

      dose.isDeleted = true;

      dose.deletedAt = now;

      dose.deletionReason = "auto";

      // recover available for 1 year

      const recoverDate = new Date(now);

      recoverDate.setFullYear(
        recoverDate.getFullYear() + 1
      );

      dose.canRecoverUntil = recoverDate;

      // remove image url to free storage

      dose.proofImage = null;

      await dose.save();
    }

    console.log("Expired selfies cleaned");

  } catch (err) {

    console.error(
      "Cleanup error:",
      err.message
    );
  }

};

// ================= CRON JOB =================

// Runs every hour
cron.schedule("0 * * * *", async () => {

  console.log("Running selfie cleanup cron...");

  await deleteExpiredSelfies();

});

module.exports = deleteExpiredSelfies;