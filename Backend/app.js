const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");


require("dotenv").config();

const cron = require("node-cron"); 

require("./src/jobs/cleanupSelfies");

require("./src/jobs/premiumReminderCron");

require("./src/jobs/reminder");

const app = express();

app.use(cors());

app.use(express.json());

connectDB();

// Routes
app.use("/api", require("./src/Routes/routes")); 

cron.schedule("0 * * * *", () => {
  console.log("Running cleanup job...");
  deleteExpiredSelfies();
});

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});