const Dose = require("../models/doseModel");
const Medication = require("../models/medicationModel");
const {
  buildUserAccessFilter,
  shouldPopulateUser,
} = require("../utils/accessControl");

const getISTDateStr = (dateObj = new Date()) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const parts = formatter.formatToParts(dateObj);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    return `${year}-${month}-${day}`;
  } catch (err) {
    const tzOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(dateObj.getTime() + tzOffset);
    return istTime.toISOString().split("T")[0];
  }
};

exports.getAdherence = async (req, res) => {
  try {
    const now = new Date();
    const todayIST = getISTDateStr(now);
    const sevenDaysAgoIST = getISTDateStr(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));

    // Filter for user/patient access
    const accessFilter = await buildUserAccessFilter(req, req.query.patientId);

    // Check count of currently active medications
    const activeMedications = await Medication.countDocuments({
      ...accessFilter,
      status: "active"
    });
    const hasActiveMedications = activeMedications > 0;

    // Filter for last 7 days using Asia/Kolkata date strings
    const filter = {
      ...accessFilter,
      date: {
        $gte: sevenDaysAgoIST,
        $lte: todayIST,
      },
      status: { $ne: "cancelled" },
      isDeleted: { $ne: true }
    };

    const query = Dose.find(filter);

    if (req.user && shouldPopulateUser(req)) {
      query
        .populate("user", "firstName lastName phone email profilePic subscription hospitals role")
        .populate("medication");
    }

    const doses = await query;

    const totalDoses = doses.length;

    const takenDoses = doses.filter(
      (dose) =>
        dose.status === "taken" ||
        dose.taken === true ||
        dose.isTaken === true
    ).length;

    const missedDoses = doses.filter(
      (dose) =>
        dose.status === "pending" ||
        dose.status === "missed"
    ).length;

    let adherence = 0;
    let weeklyStatus = "Active";

    if (totalDoses === 0) {
      // 0 past doses in 7-day window (new user or before taking first dose)
      adherence = 0;
      weeklyStatus = "Active";
    } else {
      // Active regimen with scheduled doses in the window
      adherence = Math.round((takenDoses / totalDoses) * 100);
      if (adherence >= 90) {
        weeklyStatus = "Excellent";
      } else if (adherence >= 75) {
        weeklyStatus = "Good";
      } else if (adherence >= 50) {
        weeklyStatus = "Average";
      } else {
        weeklyStatus = "Poor";
      }
    }

    res.status(200).json({
      success: true,
      period: "Last 7 Days",
      weeklyAdherence: adherence,
      weeklyStatus,
      totalDoses,
      takenDoses,
      missedDoses,
      hasActiveMedications,
      activeMedications,
      data: doses,
    });

  } catch (error) {
    console.log("ADHERENCE ERROR:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
