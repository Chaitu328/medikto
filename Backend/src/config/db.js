const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

/**
 * Sanitizes a MongoDB/DocumentDB connection URI for secure logging.
 * Hides username:password credentials.
 *
 * @param {string} uri
 * @returns {string}
 */
const sanitizeMongoUri = (uri) => {
  if (!uri) return "[NOT_SET]";
  return uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("Database initialization failed: MONGO_URI environment variable is missing.");
    process.exit(1);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const isDocumentDB =
    uri.includes("docdb.amazonaws.com") ||
    process.env.IS_DOCUMENTDB === "true" ||
    uri.includes("replicaSet=rs0");

  const options = {
    // Explicitly disable autoIndex in production to prevent unexpected collection lockups on DocumentDB
    autoIndex: !isProduction,
  };

  // Configure DocumentDB specific options
  if (isDocumentDB) {
    const defaultCaPath = path.resolve(__dirname, "../../certs/global-bundle.pem");
    const caPath = process.env.DOCDB_CA_PATH || defaultCaPath;

    if (fs.existsSync(caPath)) {
      options.tls = true;
      options.tlsCAFile = caPath;
    } else {
      console.warn(
        `DocumentDB CA bundle not found at: ${caPath}. If connecting with TLS, please ensure the certificate exists.`
      );
    }

    // DocumentDB compatibility settings
    options.retryWrites = false;
  }

  try {
    await mongoose.connect(uri, options);
    console.log(`Database connected successfully to: ${sanitizeMongoUri(uri)}`);
  } catch (err) {
    console.error(`Database connection failed for ${sanitizeMongoUri(uri)}:`, err.message);
    process.exit(1);
  }
};

module.exports = connectDB;