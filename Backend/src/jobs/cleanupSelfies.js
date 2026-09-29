const cron = require("node-cron");
const Dose = require("../models/doseModel");
const { deleteS3Object } = require("../config/s3");

/**
 * Deletes expired dose verification selfies from S3 and updates database records.
 * Runs in batches of 100 to prevent high memory usage.
 */
const deleteExpiredSelfies = async () => {
  try {
    const now = new Date();
    const batchSize = 100;
    let totalProcessed = 0;
    let hasMore = true;

    while (hasMore) {
      // Find up to 100 expired doses that still have a proofImage
      // Handles both explicit expiryAt <= now and legacy records where expiryAt is null but createdAt is older than 48h
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const doses = await Dose.find({
        $or: [
          { expiryAt: { $lte: now }, isDeleted: false, proofImage: { $ne: null } },
          { expiryAt: null, createdAt: { $lte: fortyEightHoursAgo }, isDeleted: false, proofImage: { $ne: null } }
        ]
      })
      .limit(batchSize)
      .lean();

      if (!doses || doses.length === 0) {
        hasMore = false;
        break;
      }

      for (const dose of doses) {
        try {
          const s3Key = dose.proofImage;

          // 1. Delete the file from S3 first
          if (s3Key) {
            await deleteS3Object(s3Key);
          }

          // 2. Only after S3 deletion is triggered, update database record
          const recoverDate = new Date(now);
          recoverDate.setFullYear(recoverDate.getFullYear() + 1);

          await Dose.updateOne(
            { _id: dose._id },
            {
              $set: {
                isDeleted: true,
                deletedAt: now,
                deletionReason: "auto",
                canRecoverUntil: recoverDate,
                proofImage: null
              }
            }
          );

          totalProcessed++;
        } catch (itemErr) {
          console.error(`Failed to cleanup selfie for dose ID ${dose._id}:`, itemErr.message);
          // Do not update DB; leave proofImage intact to allow retry on next cycle
        }
      }

      // If we fetched fewer than batchSize, we are done
      if (doses.length < batchSize) {
        hasMore = false;
      }
    }

    if (totalProcessed > 0) {
      console.log(`[Selfie Cleanup] Successfully cleaned up ${totalProcessed} expired selfies.`);
    }

  } catch (err) {
    console.error("[Selfie Cleanup] Error in deleteExpiredSelfies job:", err.message);
  }
};

// ================= CRON JOB =================
// Runs every hour at minute 0
cron.schedule("0 * * * *", async () => {
  console.log("[Selfie Cleanup] Running hourly selfie cleanup cron...");
  await deleteExpiredSelfies();
});

module.exports = deleteExpiredSelfies;