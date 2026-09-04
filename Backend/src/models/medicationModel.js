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

  startDate: {
    type: Date,
    default: Date.now
  },

  duration: {
    type: Number,
    default: null // Duration in days
  },

  endDate: {
    type: Date,
    default: null
  },

  isContinue: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ["active", "completed", "stopped", "cancelled"],
    default: "active"
  },

  frequency: {
    type: String,
    enum: ["daily", "weekly"],
    default: "daily"
  },

}, { timestamps: true });

module.exports = mongoose.model("Medication", medicationSchema);