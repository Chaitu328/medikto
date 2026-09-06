const { PLAN_LIMITS } = require("../utils/planLimits");
const { getEffectiveSubscription } = require("./subscriptionController");
const User = require("../models/userModel");
const Report = require("../models/reportModel");
const {
  uploadBufferToS3,
  generateReportKey,
  resolveFileUrl,
  deleteS3Object,
} = require("../config/s3");
const {
  buildUserAccessFilter,
  shouldPopulateUser,
} = require("../utils/accessControl");

const formatDate = (date) => {
  return new Date(date);
};

exports.uploadReport = async (req, res) => {
  try {
    const { title, description, condition, date, type } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        message: "Title and date are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    // Entitlement check: enforce report limit based on subscription plan
    const user = await User.findById(req.user.id);
    const { limits, plan } = getEffectiveSubscription(user);
    if (limits && limits.reports !== Infinity) {
      const reportCount = await Report.countDocuments({ user: req.user.id });
      if (reportCount >= limits.reports) {
        return res.status(403).json({
          message: `Basic plan limit reached (max ${limits.reports} reports). Please upgrade to Premium to store up to 250 reports.`,
          limitReached: true,
          currentCount: reportCount,
          maxLimit: limits.reports,
          plan
        });
      }
    }

    const normalizedCondition = condition?.toLowerCase();

    // Upload file directly to S3
    const s3Key = generateReportKey(req.user.id, req.file.originalname);
    await uploadBufferToS3(
      req.file.buffer,
      s3Key,
      req.file.mimetype || "application/pdf"
    );

    const report = await Report.create({
      user: req.user.id,
      title,
      description,
      condition: normalizedCondition,
      date: new Date(date),
      type: type || "medical",
      fileUrl: s3Key,
    });

    const reportObj = report.toObject();
    if (reportObj.fileUrl) {
      reportObj.fileUrl = await resolveFileUrl(reportObj.fileUrl);
    }

    res.status(201).json(reportObj);

  } catch (err) {
    console.error("uploadReport error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const filter = await buildUserAccessFilter(req, req.query.patientId);
    const query = Report.find(filter).sort({
      date: -1,
    });

    if (shouldPopulateUser(req)) {
      query.populate("user", "firstName phone email profilePic subscription hospitals");
    }

    const reports = await query;

    const resolvedReports = await Promise.all(
      reports.map(async (r) => {
        const rObj = r.toObject ? r.toObject() : r;
        if (rObj.fileUrl) {
          rObj.fileUrl = await resolveFileUrl(rObj.fileUrl);
        }
        if (rObj.user && rObj.user.profilePic) {
          rObj.user.profilePic = await resolveFileUrl(rObj.user.profilePic);
        }
        return rObj;
      })
    );

    res.json(resolvedReports);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const filter = await buildUserAccessFilter(req, req.query.patientId);
    const query = Report.findOne({ _id: req.params.id, ...filter });

    if (shouldPopulateUser(req)) {
      query.populate("user", "firstName phone email profilePic subscription hospitals");
    }

    const report = await query;

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    const reportObj = report.toObject();
    if (reportObj.fileUrl) {
      reportObj.fileUrl = await resolveFileUrl(reportObj.fileUrl);
    }
    if (reportObj.user && reportObj.user.profilePic) {
      reportObj.user.profilePic = await resolveFileUrl(reportObj.user.profilePic);
    }

    res.json(reportObj);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { title, description, condition, date } = req.body;

    const filter = await buildUserAccessFilter(req, req.query.patientId);
    const report = await Report.findOne({ _id: req.params.id, ...filter });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    if (title) report.title = title;
    if (description) report.description = description;
    if (condition) report.condition = condition.toLowerCase();
    if (date) report.date = formatDate(date);

    // Optional: update file
    if (req.file) {
      const s3Key = generateReportKey(report.user.toString(), req.file.originalname);
      await uploadBufferToS3(
        req.file.buffer,
        s3Key,
        req.file.mimetype || "application/pdf"
      );
      report.fileUrl = s3Key;
    }

    await report.save();

    const reportObj = report.toObject();
    if (reportObj.fileUrl) {
      reportObj.fileUrl = await resolveFileUrl(reportObj.fileUrl);
    }

    res.json(reportObj);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const filter = await buildUserAccessFilter(req, req.query.patientId);
    const report = await Report.findOne({ _id: req.params.id, ...filter });

    if (!report) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (report.fileUrl) {
      await deleteS3Object(report.fileUrl);
    }

    await report.deleteOne();

    res.json({
      message: "Report deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getReportsByType = async (req, res) => {
  try {
    const filter = await buildUserAccessFilter(req, req.query.patientId);
    const query = Report.find({
      type: req.params.type,
      ...filter,
    }).sort({
      date: -1,
    });

    if (shouldPopulateUser(req)) {
      query.populate("user", "firstName phone email profilePic subscription hospitals");
    }

    const reports = await query;

    const resolvedReports = await Promise.all(
      reports.map(async (r) => {
        const rObj = r.toObject ? r.toObject() : r;
        if (rObj.fileUrl) {
          rObj.fileUrl = await resolveFileUrl(rObj.fileUrl);
        }
        if (rObj.user && rObj.user.profilePic) {
          rObj.user.profilePic = await resolveFileUrl(rObj.user.profilePic);
        }
        return rObj;
      })
    );

    res.json(resolvedReports);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
