const ReportScheduleDAO = require("./reportScheduleDAO");
const logger = require("../../lib/logger");

class ReportScheduleService {
  static async list(org) {
    return ReportScheduleDAO.list(org);
  }

  static async create(org, body) {
    return ReportScheduleDAO.create({ ...body, org });
  }

  static async toggle(org, id, active) {
    return ReportScheduleDAO.update(org, id, { active });
  }

  static async remove(org, id) {
    return ReportScheduleDAO.remove(org, id);
  }

  /** Placeholder job runner — logs due schedules; wire email/export in a later phase. */
  static async processDueSchedules() {
    const due = await ReportScheduleDAO.listDue();
    for (const schedule of due) {
      logger.info(
        { scheduleId: String(schedule._id), reportType: schedule.reportType },
        "report schedule due (email delivery not yet wired)",
      );
    }
    return due.length;
  }
}

module.exports = ReportScheduleService;
