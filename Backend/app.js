// const dns = require("dns");

// // Set custom DNS servers
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

// // Prefer IPv4
// dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");


require("dotenv").config();

const passport = require("./src/config/passport");

const cron = require("node-cron");

require("./src/jobs/cleanupSelfies");

require("./src/jobs/premiumReminderCron");

require("./src/jobs/reminder");

const app = express();

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function initFirebase() {
  try {
    // 1. Check for JSON string in environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully via FIREBASE_SERVICE_ACCOUNT_JSON.");
      return;
    }

    // 2. Check for Base64 encoded JSON in environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8");
      const serviceAccount = JSON.parse(decoded);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully via FIREBASE_SERVICE_ACCOUNT_BASE64.");
      return;
    }

    // 3. Check for configured file path in environment variable
    const customPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (customPath && fs.existsSync(customPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(customPath, "utf-8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log(`Firebase Admin SDK initialized successfully via: ${customPath}`);
      return;
    }

    // 4. Check for standard file locations
    const candidatePaths = [
      path.resolve(__dirname, "./firebase-service-account.json"),
      path.resolve(__dirname, "./certs/firebase-service-account.json"),
      path.resolve(__dirname, "./med-vault-b69a6-firebase-adminsdk-fbsvc-96caddf0c4.json"),
    ];

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        const serviceAccount = JSON.parse(fs.readFileSync(candidate, "utf-8"));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log(`Firebase Admin SDK initialized successfully via: ${candidate}`);
        return;
      }
    }

    console.warn("⚠️ Firebase Admin SDK: No service account credentials found. Push notifications will be disabled until credentials are provided.");
  } catch (err) {
    console.warn("Firebase Admin SDK initialization failed:", err.message);
  }
}

initFirebase();

app.use(cors());

app.use(express.json());

app.use(passport.initialize());

connectDB();

// Lightweight health endpoint for Docker HEALTHCHECK and monitoring (safe, no secrets)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api", require("./src/Routes/routes"));

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});