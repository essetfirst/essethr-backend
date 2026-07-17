const path = require("path");
const fs = require("fs");
const { DocumentDAO, CATEGORIES } = require("./documentDAO");
const AuditService = require("../audit/audit.service");
const { ok, fail, parsePagination, paginated } = require("../../lib/apiResponse");

class DocumentController {
  static async apiListDocuments(req, res) {
    const { page, pageSize } = parsePagination(req.query, { defaultLimit: 50 });
    const result = await DocumentDAO.list({
      org: req.org,
      employeeId: req.query.employeeId,
      category: req.query.category,
      search: req.query.search,
      page,
      limit: pageSize,
    });
    if (result?.error) return fail(res, result.error, 500);
    const payload = paginated(result.items, {
      page,
      pageSize,
      total: result.total ?? 0,
    });
    return ok(res, {
      documents: payload.data,
      pagination: payload.pagination,
    });
  }

  static async apiUploadDocument(req, res) {
    try {
      if (!req.file) return fail(res, "No file uploaded.", 400);

      const { title, category, employeeId, expiresOn } = req.body;
      if (!title?.trim()) return fail(res, "Document title is required.", 400);
      if (category && !CATEGORIES.includes(category)) {
        return fail(res, "Invalid document category.", 400);
      }

      const org = req.org;
      const latest = await DocumentDAO.getLatestVersion(org, title.trim(), employeeId || null);
      const version = latest ? (latest.version || 1) + 1 : 1;

      const doc = await DocumentDAO.create({
        org,
        employeeId: employeeId || null,
        category: category || "other",
        title: title.trim(),
        filename: req.file.originalname,
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        version,
        previousVersionId: latest?._id || null,
        expiresOn: expiresOn || null,
        uploadedBy: req.user?._id,
      });

      if (doc?.error) return fail(res, doc.error, 500);

      await AuditService.log(req, {
        action: "document.upload",
        resource: "document",
        resourceId: String(doc._id),
        summary: `Uploaded ${doc.title} (v${doc.version})`,
        metadata: { category: doc.category, employeeId: doc.employeeId },
      });

      return ok(res, { document: doc, message: "Document uploaded." }, 201);
    } catch (e) {
      console.error(e);
      return fail(res, "Upload failed.", 500);
    }
  }

  static async apiDownloadDocument(req, res) {
    const doc = await DocumentDAO.getById(req.params.id);
    if (!doc || String(doc.org) !== String(req.org)) {
      return fail(res, "Document not found.", 404);
    }
    if (!fs.existsSync(doc.path)) return fail(res, "File missing on server.", 404);
    return res.download(path.resolve(doc.path), doc.filename);
  }

  static async apiDeleteDocument(req, res) {
    const doc = await DocumentDAO.getById(req.params.id);
    if (!doc || String(doc.org) !== String(req.org)) {
      return fail(res, "Document not found.", 404);
    }

    const deleted = await DocumentDAO.delete(req.params.id);
    if (deleted?.error) return fail(res, deleted.error, 500);

    if (doc.path && fs.existsSync(doc.path)) {
      try {
        fs.unlinkSync(doc.path);
      } catch (e) {
        console.warn("Could not delete file:", e.message);
      }
    }

    await AuditService.log(req, {
      action: "document.delete",
      resource: "document",
      resourceId: String(doc._id),
      summary: `Deleted document ${doc.title}`,
    });

    return ok(res, { message: "Document deleted." });
  }
}

module.exports = DocumentController;
