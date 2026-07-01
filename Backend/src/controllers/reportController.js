const PLAN_LIMITS = require("../utils/planLimits");
const User = require("../models/userModel");
const Report = require("../models/reportModel");
const cloudinary = require("../config/cloudinary");


const formatDate = (date) => {
  return new Date(date);
};


exports.uploadReport = async (req, res) => {
  try {
    const { title, description, condition, date, type } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        message: "Title and date are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File is required"
      });
    }

    const normalizedCondition = condition?.toLowerCase();

    const fileUrl = req.file.path;

    const report = await Report.create({
      user: req.user.id,
      title,
      description,
      condition: normalizedCondition,
      date: new Date(date),
      type: type || "medical",
      fileUrl
    });

    res.status(201).json(report);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};


exports.getReports =
  async (req, res) => {
    try {
      const userId = req.query.patientId || req.user.id;
      const reports =
        await Report.find({ user: userId })
          // .populate("user")
          .sort({
            date: -1,
          });

      res.json(reports);

    } catch (err) {

      res
        .status(500)
        .json({
          error:
            err.message,
        });
    }
  };



exports.getReportById = async (req, res) => {
  try {
    const userId = req.query.patientId || req.user.id;
    const report = await Report.findOne({ _id: req.params.id, user: userId });

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    res.json(report);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};


exports.updateReport = async (req, res) => {
  try {

    const {
      title,
      description,
      condition,
      date
    } = req.body;

    const report = await Report.findOne({ _id: req.params.id, user: req.user.id });

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    if (title) report.title = title;

    if (description)
      report.description = description;

    if (condition)
      report.condition = condition.toLowerCase();

    if (date)
      report.date = formatDate(date);

    // Optional: update file
    if (req.file) {

      const result = await cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: "auto"
        }
      );

      report.fileUrl = result.secure_url;
    }

    await report.save();

    res.json(report);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};



exports.deleteReport = async (req, res) => {
  try {

    const report = await Report.findOne({ _id: req.params.id, user: req.user.id });

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    await report.deleteOne();

    res.json({
      message: "Report deleted successfully"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};



exports.getReportsByType = async (req, res) => {
  try {
    const userId = req.query.patientId || req.user.id;
    const reports = await Report.find({
      type: req.params.type,
      user: userId
    }).sort({
      date: -1
    });

    res.json(reports);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};