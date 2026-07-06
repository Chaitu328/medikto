const https = require("https");
const mongoose = require("mongoose");

function fetchDnsOverHttps(name, type) {
  return new Promise((resolve, reject) => {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

async function getMongoConnectionUri() {
  const host = "cluster0.oeib98d.mongodb.net";
  console.log("Resolving MongoDB SRV and TXT records via HTTPS (Google DoH)...");
  
  try {
    const [srvRes, txtRes] = await Promise.all([
      fetchDnsOverHttps(`_mongodb._tcp.${host}`, "SRV"),
      fetchDnsOverHttps(host, "TXT")
    ]);

    if (!srvRes.Answer || srvRes.Answer.length === 0) {
      throw new Error(`Failed to resolve SRV record for ${host}`);
    }

    // Parse SRV answers to extract hostnames and ports
    // Data format is: "priority weight port target." (e.g. "0 0 27017 target.")
    const nodes = srvRes.Answer.map(ans => {
      const parts = ans.data.split(" ");
      const port = parts[2];
      let target = parts[3];
      if (target.endsWith(".")) target = target.slice(0, -1);
      return `${target}:${port}`;
    }).join(",");

    // Parse TXT record to extract parameters
    let txtParams = "ssl=true&authSource=admin";
    if (txtRes.Answer && txtRes.Answer.length > 0) {
      // Data format is quoted: "\"authSource=admin&replicaSet=...\""
      let txtData = txtRes.Answer[0].data;
      if (txtData.startsWith('"') && txtData.endsWith('"')) {
        txtData = txtData.slice(1, -1);
      }
      txtParams = txtData;
    }

    const credentials = "healthreportsapp7_db_user:zSZbiNXGcYpXQLUP";
    const directUri = `mongodb://${credentials}@${nodes}/Medikto?${txtParams}&ssl=true`;
    return directUri;
  } catch (error) {
    console.error("DNS DoH Resolution failed:", error.message);
    // Return standard fallback if DNS fails
    return "mongodb+srv://healthreportsapp7_db_user:zSZbiNXGcYpXQLUP@cluster0.oeib98d.mongodb.net/Medikto";
  }
}

async function checkDb() {
  try {
    const MONGO_URI = await getMongoConnectionUri();
    console.log("Using direct MongoDB URI:", MONGO_URI.replace(/:[^:@]+@/, ":****@")); // hide password in print

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log("Connected successfully.");
    
    const db = mongoose.connection.db;

    // Fetch all users
    const users = await db.collection("users").find({}).toArray();
    console.log("\n--- USERS IN DATABASE ---");
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.firstName}, Phone: ${u.phone}, Role: ${u.role}, GuardianFor: ${JSON.stringify(u.guardianFor)}`);
    });

    // Fetch all caretaker invites
    const invites = await db.collection("caretakerinvites").find({}).toArray();
    console.log("\n--- CARETAKER INVITATIONS ---");
    invites.forEach(i => {
      console.log(`ID: ${i._id}, PatientId: ${i.patientId}, CaretakerId: ${i.caretakerId}, Email: ${i.email}, Phone: ${i.phone}, Status: ${i.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error connecting or querying:", error);
    process.exit(1);
  }
}

checkDb();
