const ReportScheduleService = require("./reportSchedule.service");
const logger = require("../../lib/logger");

let timer;

function startReportScheduleRunner() {
  if (timer) return;
  const intervalMs = Number(process.env.REPORT_SCHEDULE_INTERVAL_MS) || 3600000;
  timer = setInterval(async () => {
    try {
      const count = await ReportScheduleService.processDueSchedules();
      if (count > 0) {
        logger.info({ count }, "processed due report schedules");
      }
    } catch (err) {
      logger.error({ err }, "report schedule runner failed");
    }
  }, intervalMs);
  if (typeof timer.unref === "function") timer.unref();
}

module.exports = { startReportScheduleRunner };
