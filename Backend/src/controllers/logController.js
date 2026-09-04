const Log = require("../models/logModel");
const User = require("../models/userModel");
const {
  uploadBufferToS3,
  resolveFileUrl,
  deleteS3Object,
} = require("../config/s3");
const { applySelfieWatermark } = require("../utils/watermarkHelper");
const PDFDocument = require("pdfkit");

exports.takeMedication = async (req, res) => {
  try {
    const { medId } = req.body;

    const user = await User.findById(req.user.id);
    const now = new Date();

    let selfieUrl = null;
    if (req.file) {
      const watermarkedBuffer = await applySelfieWatermark(req.file.buffer, now);
      const s3Key = `patients/${req.user.id}/logs/${Date.now()}_selfie.jpg`;
      await uploadBufferToS3(watermarkedBuffer, s3Key, "image/jpeg");
      selfieUrl = s3Key;
    }

    const autoDeleteAt =
      user && user.subscription === "premium"
        ? null
        : Date.now() + 48 * 60 * 60 * 1000;

    const log = await Log.create({
      user: req.user.id,
      medication: medId,
      takenAt: now,
      selfieUrl,
      autoDeleteAt,
    });

    const logObj = log.toObject();
    if (logObj.selfieUrl) {
      logObj.selfieUrl = await resolveFileUrl(logObj.selfieUrl);
    }

    res.json(logObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user.id })
      .populate("medication")
      .sort({ createdAt: -1 });

    const resolvedLogs = await Promise.all(
      logs.map(async (l) => {
        const lObj = l.toObject ? l.toObject() : l;
        if (lObj.selfieUrl) {
          lObj.selfieUrl = await resolveFileUrl(lObj.selfieUrl);
        }
        return lObj;
      })
    );

    res.json(resolvedLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCompliance = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user.id });

    const grouped = {};

    logs.forEach((log) => {
      const date = log.takenAt.toISOString().split("T")[0];

      if (!grouped[date]) grouped[date] = 0;
      grouped[date]++;
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (log && log.selfieUrl) {
      await deleteS3Object(log.selfieUrl);
    }
    await Log.findByIdAndDelete(req.params.id);
    res.json({ message: "Log deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.exportLogs = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user.id }).populate("medication");

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=logs.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Medication Report", { align: "center" });
    doc.moveDown();

    logs.forEach((log) => {
      doc
        .fontSize(12)
        .text(`Medicine: ${log.medication?.name || "N/A"}`)
        .text(`Taken At: ${log.takenAt}`)
        .text("----------------------------");
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};