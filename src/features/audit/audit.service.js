const AuditDAO = require("./auditDAO");
const { parsePagination, paginated } = require("../../lib/apiResponse");
const logger = require("../../lib/logger");

class AuditService {
  static async log(req, entry) {
    try {
      return AuditDAO.insertLog({
        org: req.org || entry.org,
        actorId: req.user?._id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        ...entry,
      });
    } catch (err) {
      logger.warn({ err }, "audit log write failed");
      return null;
    }
  }

  static async queryLogs({ org, query = {} }) {
    const { page, pageSize } = parsePagination(query, { defaultLimit: 50 });
    const result = await AuditDAO.queryLogs({
      org,
      action: query.action,
      resource: query.resource,
      search: query.search,
      actorId: query.actorId,
      page,
      limit: pageSize,
    });

    if (result?.error) {
      return { error: result.error };
    }

    return paginated(result.items || [], {
      page,
      pageSize,
      total: result.total ?? 0,
    });
  }
}

module.exports = AuditService;
