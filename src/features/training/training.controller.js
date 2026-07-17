const TrainingDAO = require("./trainingDAO");
const AuditService = require("../audit/audit.service");
const { ok, fail } = require("../../lib/apiResponse");

class TrainingController {
  static async listCourses(req, res) {
    return ok(res, { courses: await TrainingDAO.listCourses(req.org) });
  }

  static async createCourse(req, res) {
    const { title, description, durationHours, category } = req.body;
    if (!title?.trim()) return fail(res, "Title required.", 400);
    const c = await TrainingDAO.createCourse({ org: req.org, title, description, durationHours, category });
    await AuditService.log(req, {
      action: "training.course.create",
      resource: "training",
      resourceId: String(c._id),
      summary: `Created course: ${title}`,
    });
    return ok(res, { course: c }, 201);
  }

  static async listRecords(req, res) {
    const employeeId = req.query.employeeId || (req.user?.employeeId ? String(req.user.employeeId) : null);
    return ok(res, { records: await TrainingDAO.listRecords(req.org, employeeId) });
  }

  static async assign(req, res) {
    const { employeeId, courseId, certificationExpiry } = req.body;
    if (!employeeId || !courseId) return fail(res, "Employee and course required.", 400);
    const r = await TrainingDAO.assign({ org: req.org, employeeId, courseId, certificationExpiry });
    await AuditService.log(req, {
      action: "training.assign",
      resource: "training",
      resourceId: String(r._id),
      summary: `Assigned course ${courseId} to employee ${employeeId}`,
    });
    return ok(res, { record: r }, 201);
  }

  static async updateProgress(req, res) {
    const updated = await TrainingDAO.updateProgress(req.params.id, req.body.progress, req.body.status);
    if (!updated) return fail(res, "Not found.", 404);
    await AuditService.log(req, {
      action: "training.progress.update",
      resource: "training",
      resourceId: String(req.params.id),
      summary: "Updated training progress",
      metadata: { progress: req.body.progress, status: req.body.status },
    });
    return ok(res, { record: updated });
  }
}

module.exports = TrainingController;
