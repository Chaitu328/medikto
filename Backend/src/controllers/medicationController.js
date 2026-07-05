const Medication = require("../models/medicationModel");
const PLAN_LIMITS = require("../utils/planLimits");
const User = require("../models/userModel");
const Dose = require("../models/doseModel");
const cloudinary = require("../config/cloudinary");
const {
  buildUserAccessFilter,
  shouldPopulateUser,
} = require("../utils/accessControl");

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
      user: req.user.id,
      name,
      dosage,
      unit,
      timings,
      notifications,
      instructions
    });

    const today = getTodayDate();

    const doses = timings.map((t) => ({
      user: req.user.id,
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
    const filter = await buildUserAccessFilter(req, req.query.patientId);

    const query = Medication.find(filter).sort({ createdAt: -1 });
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
    const selectedDate = req.query.date;

    // If no date sent, use today
    const date = selectedDate || getTodayDate();

    const filter = await buildUserAccessFilter(req, req.query.patientId);

    // Fetch doses filtered by user and date
    const query = Dose.find({
      ...filter,
      date: date,
    }).sort({ time: 1 });

    if (shouldPopulateUser(req)) {
      query
        .populate("user", "firstName phone email profilePic subscription hospitals")
        .populate("medication");
    }

    const doses = await query;

    res.status(200).json({
      success: true,
      selectedDate: date,
      totalSchedules: doses.length,
      schedules: doses,
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
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const dateStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Upload to Cloudinary with text stamp baked into the image
    const result = await cloudinary.uploader.upload(req.file.path, {
      transformation: [
        { width: 800, crop: "limit" },
        {
          overlay: {
            font_family: "Arial",
            font_size: 28,
            font_weight: "bold",
            text: `Medikto | ${timeStr} | ${dateStr}`,
          },
          color: "white",
          gravity: "south_west",
          x: 16,
          y: 16,
          opacity: 90,
        },
      ],
    });

    dose.status = "taken";
    dose.takenAt = now;
    dose.verified = true;
    dose.verifiedAt = now;
    dose.proofImage = result.secure_url;

    const user = await User.findById(dose.user || req.user.id);

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
