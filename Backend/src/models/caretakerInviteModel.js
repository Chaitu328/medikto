const mongoose = require("mongoose");

const caretakerInviteSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  email: {
    type: String,
    required: true
  },

  relation: String,

  phone: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("CaretakerInvite", caretakerInviteSchema);