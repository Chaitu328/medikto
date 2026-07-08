const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://healthreportsapp7_db_user:zSZbiNXGcYpXQLUP@cluster0.oeib98d.mongodb.net/Medikto";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));

    const otps = await db.collection("hospitallinkotps").find({}).toArray();
    console.log("All hospitallinkotps documents:");
    console.log(JSON.stringify(otps, null, 2));

    const users = await db.collection("users").find({ role: "patient" }).toArray();
    console.log("All patients:");
    console.log(JSON.stringify(users.map(u => ({ id: u._id, phone: u.phone, hospitals: u.hospitals })), null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
