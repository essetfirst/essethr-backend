const OffboardingDAO = require("./offboardingDAO");
const AuditService = require("../audit/audit.service");

class OffboardingService {
  static async listTemplates(org) {
    return OffboardingDAO.listTemplates(org);
  }

  static async createTemplate(org, body) {
    return OffboardingDAO.createTemplate({ ...body, org });
  }

  static async listInstances(org, employeeId) {
    return OffboardingDAO.listInstances(org, employeeId);
  }

  static async startInstance(org, body) {
    return OffboardingDAO.startInstance({ ...body, org });
  }

  static async completeTask(instanceId, taskId, req) {
    const result = await OffboardingDAO.completeTask(instanceId, taskId);
    if (result && req) {
      await AuditService.log(req, {
        action: "offboarding.task.complete",
        resource: "offboarding",
        resourceId: String(instanceId),
        metadata: { taskId },
      });
    }
    return result;
  }
}

module.exports = OffboardingService;
