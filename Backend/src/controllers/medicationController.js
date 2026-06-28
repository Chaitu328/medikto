const Medication = require("../models/medicationModel");
const PLAN_LIMITS = require("../utils/planLimits");
const User = require("../models/userModel");
const Dose = require("../models/doseModel");
const cloudinary = require("../config/cloudinary");

const timingToTimeMap = {
  morning: "08:30 AM",
  afternoon: "12:00 PM",
  evening: "06:00 PM",
  night: "09:00 PM"
};

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
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
      instructions
    } = req.body;

    if (!name || !dosage || !unit || !timings?.length) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const medication = await Medication.create({
      name,
      dosage,
      unit,
      timings,
      notifications,
      instructions
    });

    const today = getTodayDate();

    const doses = timings.map((t) => ({
      medication: medication._id,
      name,
      dosage: `${dosage}${unit}`,
      date: today,
      time: timingToTimeMap[t.toLowerCase()] || t,
      status: "pending"
    }));

    await Dose.insertMany(doses);

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

    const meds = await Medication.find()
      // .populate("user")
      .sort({
        createdAt: -1
      });

    res.json(meds);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ================= TODAY SCHEDULE =================
// exports.getTodaySchedule = async (req, res) => {
//   try {

//     const today = getTodayDate();

//     const doses = await Dose.find({
//       date: today
//     })
//       // .populate("user")
//       .sort({
//         time: 1
//       });

//     res.json(doses);

//   } catch (err) {
//     res.status(500).json({
//       error: err.message
//     });
//   }
// };

exports.getTodaySchedule = async (req, res) => {
  try {

    // Get selected date from query
    const selectedDate =
      req.query.date;

    // If no date sent use today
    const date =
      selectedDate ||
      getTodayDate();

    // Fetch schedules date-wise
    const doses = await Dose.find({
      date: date,
    })
      // .populate("user")
      .sort({
        time: 1,
      });

    res.status(200).json({
      success: true,
      selectedDate: date,
      totalSchedules: doses.length,
      schedules: doses,
    });

  } catch (err) {

    console.log(
      "SCHEDULE ERROR:",
      err.message
    );

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

    const dose = await Dose.findById(doseId);

    if (!dose) {
      return res.status(404).json({
        message: "Dose not found"
      });
    }

    dose.status = "taken";
    dose.takenAt = new Date();

    await dose.save();

    res.json(dose);

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

    const dose = await Dose.findById(doseId);

    if (!dose) {
      return res.status(404).json({
        message: "Dose not found"
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const now = new Date();

    dose.status = "taken";
    dose.takenAt = now;
    dose.verified = true;
    dose.verifiedAt = now;
    dose.proofImage = result.secure_url;

    const user = await User.findById(
  dose.user
);

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

    const dose = await Dose.findById(doseId);

    if (!dose) {
      return res.status(404).json({
        message: "Dose not found"
      });
    }

    dose.isDeleted = true;
    dose.deletedAt = new Date();
   dose.deletionReason =
  "system-auto-delete";

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
      instructions
    } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (dosage) updateData.dosage = dosage;
    if (unit) updateData.unit = unit;
    if (notifications !== undefined)
      updateData.notifications = notifications;
    if (instructions)
      updateData.instructions = instructions;

    if (timings) {
      updateData.timings = timings;
    }

    const med = await Medication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(med);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ================= DELETE MEDICATION =================
exports.deleteMedication = async (req, res) => {
  try {

    await Medication.findByIdAndDelete(req.params.id);

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