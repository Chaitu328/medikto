const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function checkDb() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    const users = await db.collection("users").find({}).toArray();
    console.log("Total users:", users.length);
    console.log("Users:", users.map(u => ({ id: u._id, phone: u.phone, isVerified: u.isVerified, firstName: u.firstName, role: u.role })));

    process.exit(0);
  } catch (error) {
    console.error("Error connecting or querying:", error);
    process.exit(1);
  }
}

checkDb();
