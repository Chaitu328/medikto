const Log = require("../models/logModel");
const User = require("../models/userModel");
const cloudinary = require("../config/cloudinary");
const PDFDocument = require("pdfkit"); 

exports.takeMedication = async (req, res) => {
  try {
    const { medId } = req.body;

    const user = await User.findById(req.user.id);

const result = await cloudinary.uploader.upload(req.file.path, {
  transformation: [
    {
      overlay: {
        font_family: "Arial",
        font_size: 30,
        text: new Date().toLocaleString()
      },
      gravity: "south_east",
      x: 10,
      y: 10
    }
  ]
});
    const autoDeleteAt =
      user.subscription === "premium"
        ? null
        : Date.now() + 48 * 60 * 60 * 1000;

    const log = await Log.create({
      user: req.user.id,
      medication: medId,
      takenAt: new Date(),
      selfieUrl: result.secure_url,
      autoDeleteAt
    });

    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user.id })
      .populate("medication")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCompliance = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user.id });

    const grouped = {};

    logs.forEach(log => {
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

    logs.forEach(log => {
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