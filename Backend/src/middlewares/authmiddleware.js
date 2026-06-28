const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // 1. Dev Bypass for Admin Panel Developers
    if (token === "dummy-token") {
      req.user = { id: "123456", role: "admin" };
      return next();
    }

    // 2. Dev Bypass for Mobile App Developers (Patient test users)
    if (token.startsWith("mock_")) {
      const firstUser = await User.findOne({ role: "user" });
      if (firstUser) {
        req.user = { id: firstUser._id.toString(), role: "user" };
      } else {
        // Create fallback test patient if DB is empty
        const testUser = await User.create({
          phone: "9999999999",
          firstName: "John Doe",
          role: "user",
          isVerified: true
        });
        req.user = { id: testUser._id.toString(), role: "user" };
      }
      return next();
    }

    // 3. Standard JWT Validation
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({
      message: "Invalid token"
    });
  }
};

auth.blockGuardianWrite = (req, res, next) => {
  if (req.user && req.user.role === "guardian") {
    return res.status(403).json({
      message: "Caretakers (guardians) have read-only access and are not allowed to modify data."
    });
  }
  next();
};

module.exports = auth;