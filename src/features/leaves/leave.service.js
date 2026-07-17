const { LeaveDAO } = require("./leaveDAO");
const { parsePagination, paginated } = require("../../lib/apiResponse");
const logger = require("../../lib/logger");

class LeaveService {
  static async listLeaves({ org, query = {} }) {
    const { page, pageSize, skip, limit } = parsePagination(query);
    const result = await LeaveDAO.getLeaves({
      ...query,
      org,
      page,
      limit,
      skip,
    });

    if (result?.error) {
      logger.warn({ org, error: result.error }, "leave list failed");
      return { error: result.error, server: result.server };
    }

    const leaves = Array.isArray(result) ? result : result.items || result.leaves || [];
    const total = Array.isArray(result) ? result.length : result.total ?? leaves.length;

    return paginated(leaves, { page, pageSize, total });
  }

  static async getLeaveById(id) {
    return LeaveDAO.getLeaveById(id);
  }
}

module.exports = LeaveService;
