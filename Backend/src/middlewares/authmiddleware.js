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
    // 2. Super Admin Dev Bypass
if (token === "superadmin-token") {
  const superAdmin = await User.findOne({ role: "superadmin" });

  if (!superAdmin) {
    return res.status(404).json({
      message: "Super Admin not found"
    });
  }

  req.user = {
    id: superAdmin._id.toString(),
    role: "superadmin"
  };

  return next();
}

    // 3. Dev Bypass for Mobile App Developers (Patient test users)
    if (token.startsWith("mock_")) {
      const firstUser = await User.findOne({ role: "patient" });
      if (firstUser) {
        req.user = { id: firstUser._id.toString(), role: "patient" };
      } else {
        // Create fallback test patient if DB is empty
        const testUser = await User.create({
          phone: "9999999999",
          firstName: "John Doe",
          role: "patient",
          isVerified: true
        });
        req.user = { id: testUser._id.toString(), role: "patient" };
      }
      return next();
    }

    // 4. Standard JWT Validation
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("TOKEN:", token);

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