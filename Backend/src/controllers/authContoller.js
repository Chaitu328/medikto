const OTP = require("../models/authModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcrypt");

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
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",

      {
        route: "q",

        message: `Medikto Verification Code: ${otp}. This OTP is valid for 5 minutes. Do not share it with anyone.`,

        numbers: phone,
      },

      {
        headers: {
          authorization:
            process.env
              .FAST2SMS_API_KEY,

          "Content-Type":
            "application/json",
        },
      }
    );

    res.json({
      message:
        "OTP sent successfully",
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