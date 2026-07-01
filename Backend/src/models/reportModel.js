const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: String,

  condition: {
    type: String,
    enum: ["normal", "moderate", "critical"],
    default: "normal"
  },

  date: {
    type: Date,
    required: true
  },

  fileUrl: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["medical", "lab", "vaccination", "prescription"],
    default: "medical"
  }

}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);