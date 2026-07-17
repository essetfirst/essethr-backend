const AuditService = require("./audit.service");
const { fail } = require("../../lib/apiResponse");
const logger = require("../../lib/logger");

class AuditController {
  static async apiGetAuditLogs(req, res) {
    try {
      const result = await AuditService.queryLogs({ org: req.org, query: req.query });

      if (result?.error) {
        return fail(res, "Failed to load audit logs.", 500);
      }

      return res.json({
        ...result,
        logs: result.data,
        total: result.pagination?.total ?? 0,
      });
    } catch (err) {
      logger.error({ err }, "audit logs fetch failed");
      return fail(res, "Something went wrong.", 500);
    }
  }
}

module.exports = AuditController;
