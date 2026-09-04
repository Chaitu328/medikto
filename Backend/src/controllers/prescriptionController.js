const Prescription = require("../models/prescriptionModel");
const cloudinary = require("../config/cloudinary");
const {
  buildUserAccessFilter,
  shouldPopulateUser,
} = require("../utils/accessControl");


exports.addPrescription = async (req, res) => {
  try {
    const {
      medicineName,
      dosageInstructions,
      reminders
    } = req.body;

    let parsedReminders = [];

    if (reminders) {
      try {
        parsedReminders =
          typeof reminders === "string"
            ? JSON.parse(reminders)
            : reminders;
      } catch (err) {
        parsedReminders = [];
      }
    }

    if (!medicineName) {
      return res.status(400).json({
        message: "Medicine name is required"
      });
    }

    let fileUrl = null;

    if (req.file) {
      fileUrl = req.file.path;
    }

    const prescription = await Prescription.create({
      user: req.user.id,
      medicineName,
      dosageInstructions: dosageInstructions || "",
      reminders: Array.isArray(parsedReminders) ? parsedReminders : [],
      fileUrl
    });

    res.status(201).json(prescription);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



exports.getPrescriptions =
  async (req, res) => {
    try {
      const filter = await buildUserAccessFilter(req, req.query.patientId);
      const query = Prescription.find(filter).sort({
        createdAt: -1,
      });

      if (shouldPopulateUser(req)) {
        query.populate("user", "firstName phone email profilePic subscription hospitals");
      }

      const data = await query;

      res.json(data);

    } catch (err) {
      res
        .status(500)
        .json({
          error:
            err.message,
        });
    }
  };



exports.getPrescriptionById = async (req, res) => {
  try {
    const filter = await buildUserAccessFilter(req, req.query.patientId);
    const query = Prescription.findOne({ _id: req.params.id, ...filter });

    if (shouldPopulateUser(req)) {
      query.populate("user", "firstName phone email profilePic subscription hospitals");
    }

    const data = await query;

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.updatePrescription = async (req, res) => {
  try {
    const {
      medicineName,
      dosageInstructions,
      reminders
    } = req.body;

    const prescription = await Prescription.findOne({ _id: req.params.id, user: req.user.id });

    if (!prescription) {
      return res.status(404).json({ message: "Not found" });
    }

    if (medicineName) prescription.medicineName = medicineName;

    if (dosageInstructions)
      prescription.dosageInstructions = dosageInstructions;

    if (reminders)
      prescription.reminders = reminders;

    // update file if new uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto"
      });

      prescription.fileUrl = result.secure_url;
    }

    await prescription.save();

    res.json(prescription);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.deletePrescription = async (req, res) => {
  try {
    const data = await Prescription.findOne({ _id: req.params.id, user: req.user.id });

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    await data.deleteOne();

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
