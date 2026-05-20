const mongoose = require("mongoose");

const doseSchema = new mongoose.Schema({

  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true
  // },

  medication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medication",
    required: true
  },

  name: String,

  dosage: String,

  date: {
    type: String,
    required: true
  },

  time: String,

  status: {
    type: String,
    enum: ["pending", "taken", "missed"],
    default: "pending"
  },

  takenAt: Date,

  verified: {
    type: Boolean,
    default: false
  },

  verifiedAt: Date,

  proofImage: String,

  // ================= STORAGE POLICY =================

  expiryAt: Date,

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: Date,

  canRecoverUntil: Date,

  deletionReason: {
    type: String,
    enum: ["auto", "user", "admin"]
  },


deletedBy: {
  type: String,
  enum: ["system", "user", "admin"]
},

planType: {
  type: String,
  enum: ["free", "basic", "premium"],
  default: "free"
},

  downloadReminderSent: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Dose", doseSchema);