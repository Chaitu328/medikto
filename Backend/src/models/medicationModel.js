const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },

  name: { type: String, required: true },

  dosage: Number,
  unit: String,

  timings: [String], // ["morning", "afternoon"]

  notifications: {
    type: Boolean,
    default: true
  },

  instructions: String,

}, { timestamps: true });

module.exports = mongoose.model("Medication", medicationSchema);