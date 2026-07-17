const OnboardingDAO = require("./onboardingDAO");
const AuditService = require("../audit/audit.service");
const { ok, fail } = require("../../lib/apiResponse");

class OnboardingController {
  static async listTemplates(req, res) {
    return ok(res, { templates: await OnboardingDAO.listTemplates(req.org) });
  }

  static async createTemplate(req, res) {
    const { name, tasks } = req.body;
    if (!name?.trim()) return fail(res, "Name required.", 400);
    const t = await OnboardingDAO.createTemplate({ org: req.org, name, tasks });
    await AuditService.log(req, {
      action: "onboarding.template.create",
      resource: "onboarding",
      resourceId: String(t._id),
      summary: `Created onboarding template: ${name}`,
    });
    return ok(res, { template: t }, 201);
  }

  static async listInstances(req, res) {
    return ok(res, { instances: await OnboardingDAO.listInstances(req.org, req.query.employeeId) });
  }

  static async start(req, res) {
    const { employeeId, templateId, probationEnd } = req.body;
    if (!employeeId) return fail(res, "Employee required.", 400);
    const inst = await OnboardingDAO.startInstance({ org: req.org, employeeId, templateId, probationEnd });
    await AuditService.log(req, { action: "onboarding.start", resource: "onboarding", resourceId: String(inst._id) });
    return ok(res, { instance: inst }, 201);
  }

  static async completeTask(req, res) {
    const updated = await OnboardingDAO.completeTask(req.params.id, Number(req.params.taskId));
    if (!updated) return fail(res, "Not found.", 404);
    await AuditService.log(req, {
      action: "onboarding.task.complete",
      resource: "onboarding",
      resourceId: String(req.params.id),
      summary: `Completed onboarding task ${req.params.taskId}`,
    });
    return ok(res, { instance: updated });
  }
}

module.exports = OnboardingController;
