const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  time: String, // "04:30 PM"
  enabled: { type: Boolean, default: true }
});

const prescriptionSchema = new mongoose.Schema({
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true
  // },

  medicineName: {
    type: String,
    required: true
  },

  dosageInstructions: String, // "500mg after breakfast"

  reminders: [reminderSchema], // multiple times with toggle

  fileUrl: String // uploaded prescription

}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);