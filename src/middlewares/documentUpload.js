const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { validateUploadedFile } = require("../lib/fileValidation");

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: "uploads/documents",
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.UPLOAD_DOCUMENT_MAX_BYTES || 10 * 1024 * 1024) },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("Unsupported file type."), false);
    }
    cb(null, true);
  },
}).single("file");

function documentUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next();

    const validation = validateUploadedFile(req.file, {
      allowedMimeTypes: [...ALLOWED_MIME],
    });

    if (!validation.valid) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // ignore cleanup errors
      }
      return next(new Error(validation.error));
    }

    req.file.detectedKind = validation.detectedKind;
    return next();
  });
}

module.exports = documentUpload;
