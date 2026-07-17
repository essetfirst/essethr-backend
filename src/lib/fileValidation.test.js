const fs = require("fs");
const os = require("os");
const path = require("path");
const { detectKind, validateUploadedFile } = require("./fileValidation");

describe("fileValidation", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "essethr-upload-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function writeTemp(name, buffer) {
    const filePath = path.join(tempDir, name);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  test("detectKind identifies PDF magic bytes", () => {
    const buffer = Buffer.from("%PDF-1.4\n", "utf8");
    expect(detectKind(buffer)).toBe("pdf");
  });

  test("validateUploadedFile rejects MIME/content mismatch", () => {
    const filePath = writeTemp("fake.pdf", Buffer.from("not a pdf"));
    const result = validateUploadedFile(
      { path: filePath, mimetype: "application/pdf" },
      { allowedMimeTypes: ["application/pdf"] },
    );
    expect(result.valid).toBe(false);
  });

  test("validateUploadedFile accepts valid PDF", () => {
    const filePath = writeTemp("real.pdf", Buffer.from("%PDF-1.4\n"));
    const result = validateUploadedFile(
      { path: filePath, mimetype: "application/pdf" },
      { allowedMimeTypes: ["application/pdf"] },
    );
    expect(result.valid).toBe(true);
    expect(result.detectedKind).toBe("pdf");
  });
});
