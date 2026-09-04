const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");

const REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "medikto-s3-bucket";

// AWS S3 Client initialized with default credential provider chain (EC2 IAM Role / Environment)
const s3Client = new S3Client({
  region: REGION,
});

/**
 * Sanitizes a filename to ensure safe S3 object keys.
 */
const sanitizeFilename = (filename) => {
  if (!filename) return "file";
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_");
};

/**
 * Uploads a buffer directly to private S3.
 *
 * @param {Buffer} buffer - File buffer.
 * @param {string} key - S3 object key.
 * @param {string} contentType - MIME type of the file.
 * @returns {Promise<{ key: string, bucket: string }>}
 */
const uploadBufferToS3 = async (buffer, key, contentType = "application/octet-stream") => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return { key, bucket: BUCKET_NAME };
};

/**
 * Generates a time-limited presigned GET URL for an authorized user.
 *
 * @param {string} key - S3 object key.
 * @param {number} expiresInSeconds - Lifetime of presigned URL in seconds (default: 3600 = 1 hour).
 * @returns {Promise<string>}
 */
const getPresignedDownloadUrl = async (key, expiresInSeconds = 3600) => {
  if (!key) return null;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};

/**
 * Deletes an object from private S3.
 *
 * @param {string} key - S3 object key.
 * @returns {Promise<void>}
 */
const deleteS3Object = async (key) => {
  if (!key) return;

  // Do not attempt to delete external URLs or non-S3 keys
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
  } catch (err) {
    console.error(`Failed to delete S3 object with key "${key}":`, err.message);
  }
};

/**
 * Resolves a stored file value (either a legacy Cloudinary public URL or an S3 object key)
 * into an accessible URL for the client.
 *
 * @param {string} storedValue - The string stored in the database field.
 * @param {number} expiresInSeconds - Presigned URL validity duration.
 * @returns {Promise<string|null>}
 */
const resolveFileUrl = async (storedValue, expiresInSeconds = 3600) => {
  if (!storedValue) return null;

  // Legacy compatibility: If it's already a full HTTP(S) URL (e.g. Cloudinary), return as is
  if (storedValue.startsWith("http://") || storedValue.startsWith("https://")) {
    return storedValue;
  }

  // Otherwise, it's an S3 object key; generate a presigned GET URL
  try {
    return await getPresignedDownloadUrl(storedValue, expiresInSeconds);
  } catch (err) {
    console.error(`Error generating presigned URL for key "${storedValue}":`, err.message);
    return null;
  }
};

/**
 * S3 Key Generators for Structured Storage Partitioning
 */
const generateReportKey = (userId, originalname) => {
  const sanitized = sanitizeFilename(originalname || "report.pdf");
  return `patients/${userId}/reports/${Date.now()}_${sanitized}`;
};

const generatePrescriptionKey = (userId, originalname) => {
  const sanitized = sanitizeFilename(originalname || "prescription.pdf");
  return `patients/${userId}/prescriptions/${Date.now()}_${sanitized}`;
};

const generateDoseProofKey = (userId, doseId) => {
  return `patients/${userId}/doses/${doseId}_proof.jpg`;
};

const generateAvatarKey = (userId, originalname) => {
  const ext = originalname ? path.extname(originalname) || ".jpg" : ".jpg";
  return `users/${userId}/avatar_${Date.now()}${ext}`;
};

module.exports = {
  s3Client,
  BUCKET_NAME,
  REGION,
  uploadBufferToS3,
  getPresignedDownloadUrl,
  deleteS3Object,
  resolveFileUrl,
  generateReportKey,
  generatePrescriptionKey,
  generateDoseProofKey,
  generateAvatarKey,
};
