const fs = require("fs");

const MAGIC = {
  pdf: [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }],
  jpeg: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  png: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }],
  gif: [
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] },
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] },
  ],
  zip: [{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }],
  ole: [{ offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0] }],
  xlsx: [{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }],
};

const MIME_TO_KIND = {
  "application/pdf": "pdf",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/gif": "gif",
  "application/msword": "ole",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "zip",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

function readHead(filePath, length = 16) {
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(length);
    const bytesRead = fs.readSync(fd, buffer, 0, length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    fs.closeSync(fd);
  }
}

function matchesSignature(buffer, signature) {
  const { offset, bytes } = signature;
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

function detectKind(buffer) {
  for (const [kind, signatures] of Object.entries(MAGIC)) {
    if (signatures.some((sig) => matchesSignature(buffer, sig))) {
      return kind;
    }
  }
  return null;
}

function validateUploadedFile(file, { allowedMimeTypes, allowedKinds } = {}) {
  if (!file?.path) {
    return { valid: false, error: "No file uploaded." };
  }

  let head;
  try {
    head = readHead(file.path);
  } catch {
    return { valid: false, error: "Unable to read uploaded file." };
  }

  const detected = detectKind(head);
  if (!detected) {
    return { valid: false, error: "File content does not match a supported format." };
  }

  if (allowedKinds?.length && !allowedKinds.includes(detected)) {
    return { valid: false, error: "Unsupported file type." };
  }

  if (allowedMimeTypes?.length) {
    const expectedKind = MIME_TO_KIND[file.mimetype];
    if (!expectedKind || expectedKind !== detected) {
      return { valid: false, error: "File extension or MIME type does not match file content." };
    }
  }

  return { valid: true, detectedKind: detected };
}

module.exports = {
  MAGIC,
  MIME_TO_KIND,
  detectKind,
  validateUploadedFile,
};
