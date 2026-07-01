const mongoose = require("mongoose");

const vitalsSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["bloodPressure", "heartRate", "temperature", "sugar"],
    required: true
  },

  // Store values dynamically
  bloodPressure: {
    systolic: Number,
    diastolic: Number,
    status: String
  },

  heartRate: Number,
  heartRateStatus: String,

  temperature: Number,
  temperatureStatus: String,

  sugarLevel: Number,
  sugarStatus: String,

  notes: String,

  recordedAt: {
    type: Date,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Vitals", vitalsSchema);