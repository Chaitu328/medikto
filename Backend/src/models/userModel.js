const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,

  phone: { type: String, unique: true, sparse: true },

  email: { type: String, sparse: true },

  firebaseUid: { type: String, sparse: true, unique: true },

  authProvider: {
    type: String,
    enum: ["phone", "google", "password"],
    default: "phone"
  },

  // Consent Tracking & Legal Versions
  termsAccepted: { type: Boolean, default: false },
  privacyPolicyAccepted: { type: Boolean, default: false },
  consentTimestamp: { type: Date },
  termsVersion: { type: String, default: "1.0" },
  privacyPolicyVersion: { type: String, default: "1.0" },

  age: Number,

  gender: {
    type: String,
    enum: ["male", "female", "other"]
  },

  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null, ""],
    default: null
  },

  height: Number, // cm
  weight: Number, // kg

  profilePic: String,

  password: String,

  isVerified: { type: Boolean, default: false },

   role: {
    type: String,
    enum: [
        "superadmin",
        "admin",
        "guardian",
        "patient"
    ],
    default: "patient"
},

  // 🔥 SUBSCRIPTION
  subscription: {
    type: String,
    enum: ["free", "basic", "premium"],
    default: "free"
  },
  subscriptionDetails: {
    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "basic"
    },
    status: {
      type: String,
      enum: ["active", "trial", "expired", "cancelled"],
      default: "active"
    },
    trialStart: { type: Date },
    trialEnd: { type: Date },
    trialUsed: { type: Boolean, default: false },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date }
  },
  familyMembers: [
    {
      name: String,
      relation: String,
      age: Number
    }
  ],

  // Hospital Admin link
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },

  // Patient links to multiple hospitals
  hospitals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hospital" }],

  fcmToken: { type: String },

  timezone: { type: String, default: "UTC" },

  // List of patients monitored by this caretaker
  guardianFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

   isFirstLogin: {
    type: Boolean,
    default: true
},

mustChangePassword: {
    type: Boolean,
    default: true
},

accountStatus: {
    type: String,
    enum: ["pending","active","disabled"],
    default: "pending"
}

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);