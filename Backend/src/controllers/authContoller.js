const OTP = require("../models/authModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcrypt");
const { sendSMS } = require("../utils/smsHelper");
const CaretakerInvite = require("../models/caretakerInviteModel");
const { sendInviteEmail } = require("../utils/emailHelper");

// ================= SEND OTP =================
exports.sendOTP = async (
  req,
  res
) => {
  try {
    const { phone } =
      req.body;

    if (!phone) {
      return res
        .status(400)
        .json({
          msg:
            "Phone number is required",
        });
    }

    // ================= CHECK RECENT OTP =================
    const recentOTP =
      await OTP.findOne({
        phone,

        createdAt: {
          $gt:
            Date.now() -
            60 * 1000,
        },
      });

    if (recentOTP) {
      return res
        .status(429)
        .json({
          msg:
            "Wait 60 seconds before requesting again",
        });
    }

    // ================= MAX OTP LIMIT =================
    const otpCount =
      await OTP.countDocuments(
        {
          phone,

          createdAt: {
            $gt:
              Date.now() -
              10 *
                60 *
                1000,
          },
        }
      );

    if (
      otpCount >= 3
    ) {
      return res
        .status(429)
        .json({
          msg:
            "Too many OTP requests. Try again later",
        });
    }

    // ================= DELETE OLD OTP =================
    await OTP.deleteMany(
      {
        phone,
      }
    );

    // ================= GENERATE OTP =================
    const otp =
      Math.floor(
        100000 +
          Math.random() *
            900000
      );

    const hashedOTP =
      await bcrypt.hash(
        otp.toString(),
        10
      );

    // ================= SAVE OTP =================
    await OTP.create({
      phone,

      otp: hashedOTP,

      expiresAt:
        Date.now() +
        5 *
          60 *
          1000,
    });

    // ================= SEND SMS =================
    const result = await sendSMS(
      phone,
      `Medikto Verification Code: ${otp}. This OTP is valid for 5 minutes. Do not share it with anyone.`
    );

    res.json({
      message: result.provider === "twilio" || result.provider === "fast2sms"
        ? "OTP sent successfully"
        : "OTP generated successfully (SMS provider offline)",
      otp: result.provider === "mock" ? otp : undefined // Expose for testing
    });
  } catch (err) {
    console.error(
      err
    );

    res
      .status(500)
      .json({
        error:
          "Failed to send OTP",
      });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP =
  async (req, res) => {
    try {
      const {
        phone,
        otp,
      } = req.body;

      if (
        !phone ||
        !otp
      ) {
        return res
          .status(400)
          .json({
            msg:
              "Phone and OTP required",
          });
      }

      // ================= FIND OTP =================
      const record =
        await OTP.findOne(
          {
            phone,
          }
        ).sort({
          createdAt: -1,
        });

      if (
        !record
      ) {
        return res
          .status(400)
          .json({
            msg:
              "Invalid OTP",
          });
      }

      // ================= OTP EXPIRED =================
      if (
        record.expiresAt <
        Date.now()
      ) {
        await OTP.deleteMany(
          {
            phone,
          }
        );

        return res
          .status(400)
          .json({
            msg:
              "OTP expired",
          });
      }

      // ================= MAX ATTEMPTS =================
      if (
        record.attempts >=
        3
      ) {
        await OTP.deleteMany(
          {
            phone,
          }
        );

        return res
          .status(429)
          .json({
            msg:
              "Too many attempts. Request new OTP",
          });
      }

      // ================= VERIFY OTP =================
      const isMatch =
        await bcrypt.compare(
          otp.toString(),
          record.otp
        );

      if (!isMatch) {
        record.attempts += 1;

        await record.save();

        return res
          .status(400)
          .json({
            msg:
              "Invalid OTP",
          });
      }

      // ================= DELETE OTP =================
      await OTP.deleteMany(
        {
          phone,
        }
      );

      // ================= FIND USER =================
      let user =
        await User.findOne(
          {
            phone,
          }
        );

      // ================= CREATE USER =================
      if (!user) {
        // ADMIN NUMBER
        const isAdmin =
          phone ===
          "9704855196";

        user =
          await User.create(
            {
              phone,

              role:
                isAdmin
                  ? "admin"
                  : "user",

              isVerified: true,
            }
          );
      }

      // ================= VERIFY USER =================
      user.isVerified = true;

      await user.save();

      // Check for pending caretaker invitations
      await linkPendingCaretakerInvites(user);

      // ================= JWT TOKEN =================
      const token =
        jwt.sign(
          {
            id: user._id,

            role:
              user.role,
          },

          process.env
            .JWT_SECRET,

          {
            expiresIn:
              "7d",
          }
        );

      // ================= RESPONSE =================
      res.json({
        success: true,

        message:
          "Login successful",

        token,

        user,
      });
    } catch (err) {
      console.error(
        err
      );

      res
        .status(500)
        .json({
          error:
            "OTP verification failed",
        });
    }
  };

// ================= RESEND OTP =================
exports.resendOTP =
  async (req, res) => {
    try {
      const { phone } =
        req.body;

      if (!phone) {
        return res
          .status(400)
          .json({
            msg:
              "Phone required",
          });
      }

      req.body = {
        phone,
      };

      return exports.sendOTP(
        req,
        res
      );
    } catch (err) {
      res
        .status(500)
        .json({
          error:
            "Resend failed",
        });
    }
  };

// ================= REGISTER USER =================
exports.register = async (req, res) => {
  try {
    const { full_name, mobile_number } = req.body;

    const phone = mobile_number || req.body.phone;
    const name = full_name || req.body.firstName || req.body.name;

    if (!phone || !name) {
      return res.status(400).json({ message: "Name and Phone number are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User with this phone number already exists. Please log in." });
    }

    // Create the user but set isVerified to false
    const newUser = await User.create({
      phone,
      firstName: name,
      role: "user",
      isVerified: false
    });

    // If caretaker details are provided during patient registration
    const { caretakerEmail, caretakerName, caretakerRelation } = req.body;
    if (caretakerEmail && caretakerName) {
      try {
        await CaretakerInvite.create({
          patientId: newUser._id,
          email: caretakerEmail.trim().toLowerCase(),
          relation: caretakerRelation || "Caretaker",
          status: "pending"
        });
        await sendInviteEmail(caretakerEmail.trim().toLowerCase(), name, caretakerRelation || "Caretaker");
      } catch (inviteErr) {
        console.error("Caretaker invite dispatch failed during signup:", inviteErr.message);
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOTP = await bcrypt.hash(otp.toString(), 10);

    // Save OTP
    await OTP.deleteMany({ phone });
    await OTP.create({
      phone,
      otp: hashedOTP,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send SMS
    const result = await sendSMS(
      phone,
      `Medikto Verification Code: ${otp}. Valid for 5 minutes.`
    );

    res.status(201).json({
      success: true,
      message: result.provider === "twilio" || result.provider === "fast2sms"
        ? "OTP sent successfully"
        : "Registration initiated. Verification OTP generated.",
      otp: result.provider === "mock" ? otp : undefined // For local dev testing
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= LINK PENDING CARETAKER INVITATIONS =================
async function linkPendingCaretakerInvites(user) {
  try {
    const queryConditions = [
      { phone: user.phone },
      { email: user.phone }
    ];
    if (user.email) {
      queryConditions.push({ email: user.email.toLowerCase().trim() });
    }

    const invites = await CaretakerInvite.find({
      $or: queryConditions,
      status: "pending"
    });

    if (invites.length > 0) {
      user.role = "guardian";
      if (!user.guardianFor) {
        user.guardianFor = [];
      }
      for (const invite of invites) {
        if (!user.guardianFor.includes(invite.patientId)) {
          user.guardianFor.push(invite.patientId);
        }
        invite.status = "accepted";
        await invite.save();
      }
      await user.save();
      console.log(`User ${user._id} auto-promoted to caretaker guardian role.`);
    }
  } catch (err) {
    console.error("linkPendingCaretakerInvites error:", err.message);
  }
}