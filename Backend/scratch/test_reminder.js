const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const Dose = require("../src/models/doseModel");
const User = require("../src/models/userModel");

async function test() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/medikto");
  console.log("Connected to MongoDB");

  const users = await User.find({});
  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    console.log(`- User: ${u.firstName} (${u.phone}), Timezone: ${u.timezone}, FCM Token: ${u.fcmToken ? 'Yes' : 'No'}`);
  }

  await mongoose.disconnect();
}

test().catch(console.error);
