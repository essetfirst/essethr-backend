const OffboardingService = require("./offboarding.service");
const { ok, fail } = require("../../lib/apiResponse");
const logger = require("../../lib/logger");

class OffboardingController {
  static async listTemplates(req, res) {
    try {
      const items = await OffboardingService.listTemplates(req.org);
      return ok(res, { templates: items });
    } catch (err) {
      logger.error({ err }, "list offboarding templates failed");
      return fail(res, "Failed to load templates.", 500);
    }
  }

  static async createTemplate(req, res) {
    try {
      const template = await OffboardingService.createTemplate(req.org, req.body);
      return ok(res, { template }, 201);
    } catch (err) {
      logger.error({ err }, "create offboarding template failed");
      return fail(res, "Failed to create template.", 500);
    }
  }

  static async listInstances(req, res) {
    try {
      const instances = await OffboardingService.listInstances(
        req.org,
        req.query.employeeId,
      );
      return ok(res, { instances });
    } catch (err) {
      logger.error({ err }, "list offboarding instances failed");
      return fail(res, "Failed to load offboarding cases.", 500);
    }
  }

  static async start(req, res) {
    try {
      const instance = await OffboardingService.startInstance(req.org, req.body);
      return ok(res, { instance }, 201);
    } catch (err) {
      logger.error({ err }, "start offboarding failed");
      return fail(res, "Failed to start offboarding.", 500);
    }
  }

  static async completeTask(req, res) {
    try {
      const result = await OffboardingService.completeTask(
        req.params.id,
        Number(req.params.taskId),
        req,
      );
      if (!result) return fail(res, "Offboarding case or task not found.", 404);
      return ok(res, { instance: result });
    } catch (err) {
      logger.error({ err }, "complete offboarding task failed");
      return fail(res, "Failed to complete task.", 500);
    }
  }
}

module.exports = OffboardingController;
