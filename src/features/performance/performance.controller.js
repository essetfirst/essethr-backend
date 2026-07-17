const PerformanceDAO = require("./performanceDAO");
const AuditService = require("../audit/audit.service");
const { ok, fail } = require("../../lib/apiResponse");
const { PERMISSIONS } = require("../../constants/permissions");

function userPermissions(req) {
  return req.user?.permissions || [];
}

function hasPermission(req, permission) {
  return userPermissions(req).includes(permission);
}

function resolveEmployeeFilter(req) {
  if (req.query.employeeId) return String(req.query.employeeId);
  if (hasPermission(req, PERMISSIONS.PERFORMANCE_READ)) return null;
  if (req.user?.employeeId) return String(req.user.employeeId);
  return null;
}

function isOwnEmployeeRecord(req, employeeId) {
  return req.user?.employeeId && String(req.user.employeeId) === String(employeeId);
}

function unwrapDoc(result) {
  if (!result) return null;
  return result.value != null ? result.value : result;
}

class PerformanceController {
  static async listGoals(req, res) {
    const employeeId = resolveEmployeeFilter(req);
    const items = await PerformanceDAO.listGoals(req.org, employeeId);
    return ok(res, { goals: items });
  }

  static async createGoal(req, res) {
    const { employeeId, title, description, target, dueDate } = req.body;
    if (!employeeId || !title?.trim()) return fail(res, "Employee and title required.", 400);
    const g = await PerformanceDAO.createGoal({
      org: req.org,
      employeeId,
      title,
      description,
      target,
      dueDate,
    });
    await AuditService.log(req, {
      action: "performance.goal.create",
      resource: "performance",
      resourceId: String(g._id),
      summary: `Created goal: ${title}`,
    });
    return ok(res, { goal: g }, 201);
  }

  static async updateGoal(req, res) {
    const existing = await PerformanceDAO.getGoalById(req.params.id, req.org);
    if (!existing) return fail(res, "Goal not found.", 404);
    if (!hasPermission(req, PERMISSIONS.PERFORMANCE_WRITE)) {
      return fail(res, "Not allowed to update goals.", 403);
    }

    const updated = unwrapDoc(
      await PerformanceDAO.updateGoal(req.params.id, req.org, req.body),
    );
    if (!updated) return fail(res, "Goal not found.", 404);

    await AuditService.log(req, {
      action: "performance.goal.update",
      resource: "performance",
      resourceId: String(req.params.id),
      summary: `Updated goal: ${updated.title}`,
    });
    return ok(res, { goal: updated });
  }

  static async listReviews(req, res) {
    const employeeId = resolveEmployeeFilter(req);
    const items = await PerformanceDAO.listReviews(req.org, employeeId);
    return ok(res, { reviews: items });
  }

  static async createReview(req, res) {
    const { employeeId, period, selfReview, managerReview, score } = req.body;
    if (!employeeId || !period) return fail(res, "Employee and period required.", 400);

    const canManage = hasPermission(req, PERMISSIONS.PERFORMANCE_WRITE);
    if (!canManage && !isOwnEmployeeRecord(req, employeeId)) {
      return fail(res, "Not allowed to create review for this employee.", 403);
    }

    const r = await PerformanceDAO.createReview({
      org: req.org,
      employeeId,
      period,
      selfReview: selfReview || "",
      managerReview: canManage ? managerReview || "" : "",
      score: canManage && score != null ? score : null,
      reviewerId: req.user._id,
      status: "draft",
    });
    await AuditService.log(req, {
      action: "performance.review.create",
      resource: "performance",
      resourceId: String(r._id),
      summary: `Created review for employee ${employeeId}`,
    });
    return ok(res, { review: r }, 201);
  }

  static async updateReview(req, res) {
    const existing = await PerformanceDAO.getReviewById(req.params.id, req.org);
    if (!existing) return fail(res, "Review not found.", 404);

    const canManage = hasPermission(req, PERMISSIONS.PERFORMANCE_WRITE);
    const isOwn = isOwnEmployeeRecord(req, existing.employeeId);

    if (!canManage && !isOwn) return fail(res, "Not allowed.", 403);
    if (existing.status === "completed" && !canManage) {
      return fail(res, "Completed reviews cannot be edited.", 400);
    }

    const updates = {};
    if (canManage) {
      if (req.body.period != null) updates.period = req.body.period;
      if (req.body.selfReview != null) updates.selfReview = req.body.selfReview;
      if (req.body.managerReview != null) updates.managerReview = req.body.managerReview;
      if (req.body.score !== undefined) updates.score = req.body.score;
      if (req.body.status != null) updates.status = req.body.status;
    } else if (isOwn && existing.status === "draft") {
      if (req.body.selfReview != null) updates.selfReview = req.body.selfReview;
    } else {
      return fail(res, "You can only edit your self-review while the review is in draft.", 400);
    }

    const updated = unwrapDoc(
      await PerformanceDAO.updateReview(req.params.id, req.org, updates),
    );
    if (!updated) return fail(res, "Review not found.", 404);

    await AuditService.log(req, {
      action: "performance.review.update",
      resource: "performance",
      resourceId: String(req.params.id),
      summary: "Updated performance review",
    });
    return ok(res, { review: updated });
  }

  static async submitReview(req, res) {
    const existing = await PerformanceDAO.getReviewById(req.params.id, req.org);
    if (!existing) return fail(res, "Review not found.", 404);

    const canManage = hasPermission(req, PERMISSIONS.PERFORMANCE_WRITE);
    const isOwn = isOwnEmployeeRecord(req, existing.employeeId);
    if (!canManage && !isOwn) return fail(res, "Not allowed.", 403);
    if (existing.status !== "draft") {
      return fail(res, "Only draft reviews can be submitted.", 400);
    }

    const selfReview =
      req.body.selfReview != null ? req.body.selfReview : existing.selfReview || "";
    if (!String(selfReview).trim()) {
      return fail(res, "Self-review notes are required before submitting.", 400);
    }

    const updated = unwrapDoc(
      await PerformanceDAO.updateReview(req.params.id, req.org, {
        selfReview,
        status: "submitted",
      }),
    );
    if (!updated) return fail(res, "Review not found.", 404);

    await AuditService.log(req, {
      action: "performance.review.submit",
      resource: "performance",
      resourceId: String(req.params.id),
      summary: "Submitted performance review",
    });
    return ok(res, { review: updated, message: "Review submitted." });
  }

  static async completeReview(req, res) {
    const existing = await PerformanceDAO.getReviewById(req.params.id, req.org);
    if (!existing) return fail(res, "Review not found.", 404);
    if (!hasPermission(req, PERMISSIONS.PERFORMANCE_WRITE)) {
      return fail(res, "Not allowed to complete reviews.", 403);
    }
    if (existing.status !== "submitted") {
      return fail(res, "Only submitted reviews can be completed.", 400);
    }

    const updated = unwrapDoc(
      await PerformanceDAO.updateReview(req.params.id, req.org, {
        managerReview:
          req.body.managerReview != null
            ? req.body.managerReview
            : existing.managerReview || "",
        score: req.body.score !== undefined ? req.body.score : existing.score,
        status: "completed",
      }),
    );
    if (!updated) return fail(res, "Review not found.", 404);

    await AuditService.log(req, {
      action: "performance.review.complete",
      resource: "performance",
      resourceId: String(req.params.id),
      summary: "Completed performance review",
    });
    return ok(res, { review: updated, message: "Review completed." });
  }
}

module.exports = PerformanceController;
