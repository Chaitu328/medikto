const Dose = require("../models/doseModel");
const {
  buildUserAccessFilter,
  shouldPopulateUser,
} = require("../utils/accessControl");

exports.getAdherence = async (req, res) => {
  try {
    const today = new Date();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Filter for last 7 days
    const accessFilter = req.user
      ? await buildUserAccessFilter(req, req.query.patientId)
      : {};

    const filter = {
      ...accessFilter,
      createdAt: {
        $gte: sevenDaysAgo,
      },
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
