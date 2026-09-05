const { sendIssueReportEmail } = require("../utils/emailHelper");
const User = require("../models/userModel");

/**
 * Handle user reporting an issue from the mobile app
 * POST /api/support/report-issue
 */
exports.reportIssue = async (req, res) => {
  try {
    const { category, description, appVersion, platform } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a description of the issue."
      });
    }

    // Authenticated user details from req.user
    const userId = req.user?.id;
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    const emailResult = await sendIssueReportEmail({
      userId: userId || "Unauthenticated",
      userName: user ? `${user.firstName || ""}`.trim() || "Medikto User" : "Anonymous User",
      userEmail: user?.email || req.body.email || "Not Provided",
      userPhone: user?.phone || req.body.phone || "Not Provided",
      userRole: user?.role || "patient",
      category: category || "General Issue",
      description: description.trim(),
      appVersion: appVersion || "1.0.0",
      platform: platform || "Mobile App"
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Unable to submit your issue at this time. Please try again later.",
        error: emailResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your issue has been submitted successfully."
    });

  } catch (err) {
    console.error("Report Issue Controller Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Unable to submit your issue. Please try again.",
      error: err.message
    });
  }
};
