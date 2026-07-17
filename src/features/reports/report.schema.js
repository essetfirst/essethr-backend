const { z } = require("zod");

const scheduleReportSchema = z.object({
  name: z.string().trim().min(1, "Schedule name is required."),
  reportType: z.enum(["attendance", "payroll", "leaves", "employees"]),
  cron: z.string().trim().min(1, "Cron expression is required."),
  recipients: z.array(z.string().email()).min(1, "At least one recipient is required."),
  format: z.enum(["pdf", "csv", "xlsx"]).default("pdf"),
  active: z.boolean().optional().default(true),
});

module.exports = { scheduleReportSchema };
