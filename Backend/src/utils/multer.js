const multer = require("multer");
const path = require("path");

// Use memory storage for controlled in-memory validation and S3 streaming
const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${ext}. Allowed formats: jpg, jpeg, png, webp, pdf, doc, docx`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB standardized maximum file size limit
  },
});

module.exports = upload;
