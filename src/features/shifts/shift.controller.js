const ShiftDAO = require("./shiftDAO");
const AuditService = require("../audit/audit.service");
const { ok, fail } = require("../../lib/apiResponse");

class ShiftController {
  static async listTemplates(req, res) {
    return ok(res, { templates: await ShiftDAO.listTemplates(req.org) });
  }

  static async createTemplate(req, res) {
    const { name, startTime, endTime, breakMinutes, isOvernight } = req.body;
    if (!name?.trim() || !startTime || !endTime) return fail(res, "Name and times required.", 400);
    const t = await ShiftDAO.createTemplate({ org: req.org, name, startTime, endTime, breakMinutes, isOvernight });
    await AuditService.log(req, { action: "shift.template.create", resource: "shift", resourceId: String(t._id), summary: name });
    return ok(res, { template: t }, 201);
  }

  static async listAssignments(req, res) {
    const items = await ShiftDAO.listAssignments(req.org, req.query);
    return ok(res, { assignments: items });
  }

  static async assign(req, res) {
    const { employeeId, templateId, date, startTime, endTime, notes } = req.body;
    if (!employeeId || !date) return fail(res, "Employee and date required.", 400);
    const a = await ShiftDAO.assign({ org: req.org, employeeId, templateId, date, startTime, endTime, notes });
    await AuditService.log(req, { action: "shift.assign", resource: "shift", resourceId: String(a._id) });
    return ok(res, { assignment: a }, 201);
  }

  static async removeAssignment(req, res) {
    await ShiftDAO.removeAssignment(req.params.id);
    await AuditService.log(req, { action: "shift.unassign", resource: "shift", resourceId: req.params.id });
    return ok(res, { message: "Removed." });
  }
}

module.exports = ShiftController;
