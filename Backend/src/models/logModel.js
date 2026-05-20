const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  medication: { type: mongoose.Schema.Types.ObjectId, ref: "Medication" },

  takenAt: Date,

  selfieUrl: String,

  autoDeleteAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Log", logSchema);