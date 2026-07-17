const AnnouncementDAO = require("./announcementDAO");
const AuditService = require("../audit/audit.service");
const { ok, fail } = require("../../lib/apiResponse");

class AnnouncementController {
  static async list(req, res) {
    const items = await AnnouncementDAO.list(req.org, { activeOnly: req.query.all !== "true" });
    return ok(res, { announcements: items });
  }

  static async create(req, res) {
    const { title, body, expiresOn } = req.body;
    if (!title?.trim() || !body?.trim()) return fail(res, "Title and body required.", 400);
    const item = await AnnouncementDAO.create({
      org: req.org, title: title.trim(), body: body.trim(),
      authorId: req.user._id, expiresOn,
    });
    await AuditService.log(req, { action: "announcement.create", resource: "announcement", resourceId: String(item._id), summary: title });
    return ok(res, { announcement: item }, 201);
  }

  static async update(req, res) {
    const item = await AnnouncementDAO.update(req.params.id, req.body);
    if (!item) return fail(res, "Not found.", 404);
    await AuditService.log(req, { action: "announcement.update", resource: "announcement", resourceId: req.params.id });
    return ok(res, { announcement: item });
  }

  static async remove(req, res) {
    await AnnouncementDAO.remove(req.params.id);
    await AuditService.log(req, { action: "announcement.delete", resource: "announcement", resourceId: req.params.id });
    return ok(res, { message: "Deleted." });
  }
}

module.exports = AnnouncementController;
