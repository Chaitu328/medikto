const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Links to user with role: 'admin'
}, { timestamps: true });

module.exports = mongoose.model("Hospital", hospitalSchema);
