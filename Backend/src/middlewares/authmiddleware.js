const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const SuperAdmin = require("../models/SuperadminModel");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // 1. Dev Bypass for Admin Panel Developers (only non-production)
    if (process.env.NODE_ENV !== "production" && token === "dummy-token") {
      req.user = { id: "123456", role: "admin" };
      return next();
    }

    // 2. Super Admin Dev Bypass (only non-production)
    if (process.env.NODE_ENV !== "production" && token === "superadmin-token") {
      const superAdmin = await User.findOne({ role: "superadmin" }) || await SuperAdmin.findOne();

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

    // 3. Dev Bypass for Mobile App Developers (only non-production)
    if (process.env.NODE_ENV !== "production" && token.startsWith("mock_")) {
      const firstUser = await User.findOne({ role: "patient" });
      if (firstUser) {
        req.user = { id: firstUser._id.toString(), role: "patient" };
      } else {
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    // Finding 3: Server-side session invalidation check
    // If the account has logged out since the token was issued, invalidate it
    let account = await User.findById(decoded.id).select("lastLogoutAt isVerified role").lean();
    if (!account && decoded.role === "superadmin") {
      account = await SuperAdmin.findById(decoded.id).select("lastLogoutAt role").lean();
    }

    if (account) {
      if (account.isVerified === false && (account.role === "admin" || account.role === "guardian")) {
        return res.status(403).json({
          message: "Account is disabled. Please contact administrator."
        });
      }

      if (account.lastLogoutAt && decoded.iat) {
        const tokenIssuedMs = decoded.iat * 1000;
        const lastLogoutMs = new Date(account.lastLogoutAt).getTime();
        // Allow 1000ms clock skew buffer
        if (tokenIssuedMs < (lastLogoutMs - 1000)) {
          return res.status(401).json({
            message: "Session has expired or user has logged out. Please log in again."
          });
        }
      }
    }

    next();

  } catch (error) {
    res.status(401).json({
      message: "Invalid token"
    });
  }
};

// Finding 1: Strict Role-Based Access Control Middlewares
auth.requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Superadmin access required."
    });
  }
  next();
};

auth.requireAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user || !["superadmin", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Administrative access required."
    });
  }
  next();
};

auth.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Hospital Admin access required."
    });
  }
  next();
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
