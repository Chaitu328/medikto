const Dose = require("../models/doseModel");
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

    // Filter for last 7 days using Asia/Kolkata date strings
    const accessFilter = await buildUserAccessFilter(req, req.query.patientId);

    const filter = {
      ...accessFilter,
      date: {
        $gte: sevenDaysAgoIST,
        $lte: todayIST,
      },
      isDeleted: { $ne: true }
    };

    const query = Dose.find(filter);

    if (req.user && shouldPopulateUser(req)) {
      query
        .populate("user", "firstName phone email profilePic subscription hospitals")
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

    const adherence =
      totalDoses > 0
        ? Math.round((takenDoses / totalDoses) * 100)
        : 0;

    let weeklyStatus = "Poor";

    if (adherence >= 90) {
      weeklyStatus = "Excellent";
    } else if (adherence >= 75) {
      weeklyStatus = "Good";
    } else if (adherence >= 50) {
      weeklyStatus = "Average";
    }

    res.status(200).json({
      success: true,
      period: "Last 7 Days",
      weeklyAdherence: adherence,
      weeklyStatus,
      totalDoses,
      takenDoses,
      missedDoses,
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
