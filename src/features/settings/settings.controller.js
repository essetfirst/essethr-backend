const SettingsDAO = require("./settingsDAO");
const AuditService = require("../audit/audit.service");
const { ok, fail } = require("../../lib/apiResponse");
const { PERMISSIONS } = require("../../constants/permissions");

class SettingsController {
  static async apiGetSettings(req, res) {
    const orgId = req.params.org || req.org;
    const result = await SettingsDAO.getByOrg(orgId);
    if (result?.error) return fail(res, result.error, 500);
    return ok(res, { settings: result });
  }

  static async apiUpdateSettings(req, res) {
    const orgId = req.params.org || req.org;
    const result = await SettingsDAO.upsert(orgId, req.body, req.user?._id);
    if (result?.error) return fail(res, result.error, 500);

    await AuditService.log(req, {
      action: "settings.update",
      resource: "settings",
      resourceId: String(orgId),
      summary: "Organization settings updated",
      changes: { after: result },
    });

    return ok(res, { settings: result, message: "Settings saved." });
  }
}

module.exports = SettingsController;
