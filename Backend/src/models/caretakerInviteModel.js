const mongoose = require("mongoose");

const caretakerInviteSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  relation: String,
  phone: String,
  status: { type: String, enum: ["pending", "accepted"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("CaretakerInvite", caretakerInviteSchema);
