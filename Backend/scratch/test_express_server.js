const http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Public health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount /api routes
app.use("/api", require("../src/Routes/routes"));

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test Express server running on port ${port}`);

  try {
    // 1. Test /health
    const healthRes = await fetch(`http://localhost:${port}/health`);
    const healthData = await healthRes.json();
    console.log("Health Check Status:", healthRes.status, healthData);

    if (healthRes.status === 200 && healthData.status === "ok") {
      console.log("-> SUCCESS: /health endpoint is operational.");
    } else {
      throw new Error("/health returned unexpected response");
    }

    server.close(() => {
      console.log("Test Express server closed cleanly.");
      process.exit(0);
    });
  } catch (err) {
    console.error("Test failed:", err.message);
    server.close(() => process.exit(1));
  }
});
