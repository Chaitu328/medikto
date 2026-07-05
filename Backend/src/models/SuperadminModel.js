const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
{
    name: String,
    email: {
        type: String,
        unique: true,
    },
    googleId: String,
    avatar: String,
    role: {
        type: String,
        default: "superadmin",
    },
},
{
    timestamps: true,
});

module.exports = mongoose.model(
    "SuperAdmin",
    superAdminSchema
);