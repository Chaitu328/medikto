const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://healthreportsapp7_db_user:zSZbiNXGcYpXQLUP@cluster0.oeib98d.mongodb.net/Medikto";

async function checkDb() {
  try {
    console.log("Connecting to:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");
    
    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).toArray();
    console.log("Total users:", users.length);
    
    console.log("Searching for number: 8367258677");
    const targetUser = users.find(u => u.phone && u.phone.includes("8367258677"));
    if (targetUser) {
      console.log("Found user matching phone:", targetUser);
    } else {
      console.log("No user found matching '8367258677'");
    }

    console.log("First few users in database:");
    console.log(users.slice(0, 10).map(u => ({ id: u._id, phone: u.phone, isVerified: u.isVerified, firstName: u.firstName, role: u.role })));

    process.exit(0);
  } catch (error) {
    console.error("Error connecting or querying:", error);
    process.exit(1);
  }
}

checkDb();
