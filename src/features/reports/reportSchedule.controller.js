const ReportScheduleService = require("./reportSchedule.service");
const { ok, fail } = require("../../lib/apiResponse");
const logger = require("../../lib/logger");

class ReportScheduleController {
  static async list(req, res) {
    try {
      const schedules = await ReportScheduleService.list(req.org);
      return ok(res, { schedules });
    } catch (err) {
      logger.error({ err }, "list report schedules failed");
      return fail(res, "Failed to load schedules.", 500);
    }
  }

  static async create(req, res) {
    try {
      const schedule = await ReportScheduleService.create(req.org, req.body);
      return ok(res, { schedule }, 201);
    } catch (err) {
      logger.error({ err }, "create report schedule failed");
      return fail(res, "Failed to create schedule.", 500);
    }
  }

  static async toggle(req, res) {
    try {
      const schedule = await ReportScheduleService.toggle(
        req.org,
        req.params.id,
        req.body.active !== false,
      );
      if (!schedule) return fail(res, "Schedule not found.", 404);
      return ok(res, { schedule });
    } catch (err) {
      logger.error({ err }, "toggle report schedule failed");
      return fail(res, "Failed to update schedule.", 500);
    }
  }

  static async remove(req, res) {
    try {
      const result = await ReportScheduleService.remove(req.org, req.params.id);
      if (!result?.deletedCount) return fail(res, "Schedule not found.", 404);
      return ok(res, { message: "Schedule removed." });
    } catch (err) {
      logger.error({ err }, "remove report schedule failed");
      return fail(res, "Failed to remove schedule.", 500);
    }
  }
}

module.exports = ReportScheduleController;
