const fs = require("fs");
const { validateUploadedFile, MIME_TO_KIND } = require("./fileValidation");

/**
 * Post-multer middleware: validate file magic bytes and optionally delete invalid uploads.
 */
function assertUploadedFile(options = {}) {
  const {
    allowedMimeTypes,
    allowedKinds,
    field = "file",
  } = options;

  return (req, res, next) => {
    const file = req.file || (req.files && req.files[field]?.[0]);
    if (!file) return next();

    const validation = validateUploadedFile(file, {
      allowedMimeTypes,
      allowedKinds,
    });

    if (!validation.valid) {
      try {
        if (file.path) fs.unlinkSync(file.path);
      } catch {
        // ignore
      }
      return next(new Error(validation.error));
    }

    file.detectedKind = validation.detectedKind;
    return next();
  };
}

module.exports = { assertUploadedFile, MIME_TO_KIND };
