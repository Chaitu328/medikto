const mongoose = require("mongoose");

const hospitalLinkOtpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("HospitalLinkOTP", hospitalLinkOtpSchema);
