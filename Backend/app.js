const dns = require("dns");

// Set custom DNS servers
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Prefer IPv4
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");


require("dotenv").config();

const cron = require("node-cron");

require("./src/jobs/cleanupSelfies");

require("./src/jobs/premiumReminderCron");

require("./src/jobs/reminder");

const app = express();

const admin = require("firebase-admin");
try {
  const serviceAccount = require("./med-vault-b69a6-firebase-adminsdk-fbsvc-96caddf0c4.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin SDK initialized successfully.");
} catch (err) {
  console.warn("Firebase Admin SDK initialization skipped or failed:", err.message);
}

app.use(cors());

app.use(express.json());

connectDB();

// Routes
app.use("/api", require("./src/Routes/routes"));

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});