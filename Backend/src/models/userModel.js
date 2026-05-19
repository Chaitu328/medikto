const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,

  phone: { type: String, unique: true },

  age: Number,

  gender: {
    type: String,
    enum: ["male", "female", "other"]
  },

  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  },

  height: Number, // cm
  weight: Number, // kg

  profilePic: String,

  password: String,

  isVerified: { type: Boolean, default: false },

    role: {
        type: String,

        enum: [
          "admin",
          "user",
        ],

        default: "user",
      },

  // 🔥 UPDATED SUBSCRIPTION
  subscription: {
    type: String,
    enum: ["free", "basic", "premium"],
    default: "free"
  },

  familyMembers: [
    {
      name: String,
      relation: String,
      age: Number
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);