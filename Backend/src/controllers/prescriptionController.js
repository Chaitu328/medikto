const Prescription = require("../models/prescriptionModel");
const {
  uploadBufferToS3,
  generatePrescriptionKey,
  resolveFileUrl,
  deleteS3Object,
} = require("../config/s3");
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
      const s3Key = generatePrescriptionKey(req.user.id, req.file.originalname);
      await uploadBufferToS3(
        req.file.buffer,
        s3Key,
        req.file.mimetype || "application/pdf"
      );
      fileUrl = s3Key;
    }

    const prescription = await Prescription.create({
      user: req.user.id,
      medicineName,
      dosageInstructions: dosageInstructions || "",
      reminders: Array.isArray(parsedReminders) ? parsedReminders : [],
      fileUrl
    });

    const prescriptionObj = prescription.toObject();
    if (prescriptionObj.fileUrl) {
      prescriptionObj.fileUrl = await resolveFileUrl(prescriptionObj.fileUrl);
    }

    res.status(201).json(prescriptionObj);

  } catch (err) {
    console.error("addPrescription error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const filter = await buildUserAccessFilter(req, req.query.patientId);
    const query = Prescription.find(filter).sort({
      createdAt: -1,
    });

    if (shouldPopulateUser(req)) {
      query.populate("user", "firstName phone email profilePic subscription hospitals");
    }

    const data = await query;

    const resolvedPrescriptions = await Promise.all(
      data.map(async (p) => {
        const pObj = p.toObject ? p.toObject() : p;
        if (pObj.fileUrl) {
          pObj.fileUrl = await resolveFileUrl(pObj.fileUrl);
        }
        if (pObj.user && pObj.user.profilePic) {
          pObj.user.profilePic = await resolveFileUrl(pObj.user.profilePic);
        }
        return pObj;
      })
    );

    res.json(resolvedPrescriptions);

  } catch (err) {
    res.status(500).json({
      error: err.message,
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

    const pObj = data.toObject();
    if (pObj.fileUrl) {
      pObj.fileUrl = await resolveFileUrl(pObj.fileUrl);
    }
    if (pObj.user && pObj.user.profilePic) {
      pObj.user.profilePic = await resolveFileUrl(pObj.user.profilePic);
    }

    res.json(pObj);

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

    // update file in S3 if new uploaded
    if (req.file) {
      const s3Key = generatePrescriptionKey(prescription.user.toString(), req.file.originalname);
      await uploadBufferToS3(
        req.file.buffer,
        s3Key,
        req.file.mimetype || "application/pdf"
      );
      prescription.fileUrl = s3Key;
    }

    await prescription.save();

    const pObj = prescription.toObject();
    if (pObj.fileUrl) {
      pObj.fileUrl = await resolveFileUrl(pObj.fileUrl);
    }

    res.json(pObj);

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

    if (data.fileUrl) {
      await deleteS3Object(data.fileUrl);
    }

    await data.deleteOne();

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
