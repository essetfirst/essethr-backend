const WorkflowDAO = require("./workflowDAO");
const AuditService = require("../audit/audit.service");
const { ok, fail } = require("../../lib/apiResponse");

class WorkflowController {
  static async listTemplates(req, res) {
    return ok(res, { templates: await WorkflowDAO.listTemplates(req.org) });
  }

  static async createTemplate(req, res) {
    const { name, type, steps } = req.body;
    if (!name?.trim() || !type) return fail(res, "Name and type required.", 400);
    const t = await WorkflowDAO.createTemplate({ org: req.org, name, type, steps });
    return ok(res, { template: t }, 201);
  }

  static async listRequests(req, res) {
    const items = await WorkflowDAO.listRequests(req.org, req.query);
    return ok(res, { requests: items });
  }

  static async submit(req, res) {
    const { type, resourceType, resourceId, steps } = req.body;
    if (!type) return fail(res, "Type required.", 400);
    const r = await WorkflowDAO.createRequest({
      org: req.org, type, resourceType, resourceId, steps,
      requesterId: req.user._id,
    });
    await AuditService.log(req, { action: "workflow.submit", resource: "workflow", resourceId: String(r._id), summary: type });
    return ok(res, { request: r }, 201);
  }

  static async approve(req, res) {
    const updated = await WorkflowDAO.approve(req.params.id, req.user._id, req.body.comment);
    if (!updated) return fail(res, "Not found.", 404);
    await AuditService.log(req, { action: "workflow.approve", resource: "workflow", resourceId: req.params.id });
    return ok(res, { request: updated });
  }

  static async reject(req, res) {
    const updated = await WorkflowDAO.reject(req.params.id, req.user._id, req.body.comment);
    if (!updated) return fail(res, "Not found.", 404);
    await AuditService.log(req, { action: "workflow.reject", resource: "workflow", resourceId: req.params.id });
    return ok(res, { request: updated });
  }
}

module.exports = WorkflowController;
