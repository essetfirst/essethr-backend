const RecruitmentDAO = require("./recruitmentDAO");
const EmployeeDAO = require("../employees/employeeDAO");
const OnboardingDAO = require("../onboarding/onboardingDAO");
const UserService = require("../users/user.service");
const AuditService = require("../audit/audit.service");
const NotificationController = require("../notifications/notification.controller");
const { ok, fail } = require("../../lib/apiResponse");
const { ObjectId } = require("mongodb");

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] || "New", surName: "Hire" };
  return { firstName: parts[0], surName: parts.slice(1).join(" ") };
}

class RecruitmentController {
  static async listJobs(req, res) {
    return ok(res, { jobs: await RecruitmentDAO.listJobs(req.org) });
  }

  static async createJob(req, res) {
    const { title, department, description, location } = req.body;
    if (!title?.trim()) return fail(res, "Title required.", 400);
    const job = await RecruitmentDAO.createJob({ org: req.org, title, department, description, location });
    await AuditService.log(req, { action: "recruitment.job.create", resource: "job", resourceId: String(job._id), summary: title });
    return ok(res, { job }, 201);
  }

  static async listCandidates(req, res) {
    return ok(res, { candidates: await RecruitmentDAO.listCandidates(req.org, req.query.jobId) });
  }

  static async createCandidate(req, res) {
    const { jobId, name, email, phone, stage, notes } = req.body;
    if (!jobId || !name?.trim() || !email?.trim()) return fail(res, "Job, name, email required.", 400);
    const c = await RecruitmentDAO.createCandidate({
      org: req.org, jobId, name, email, phone, stage, notes, createdBy: req.user?._id,
    });
    if (c?.error === "duplicate") {
      return fail(res, "A candidate with this email already exists.", 409);
    }
    await AuditService.log(req, { action: "recruitment.candidate.create", resource: "candidate", resourceId: String(c._id), summary: name });
    return ok(res, { candidate: c }, 201);
  }

  static async updateStage(req, res) {
    const stage = req.body.stage;
    if (stage === "hired") {
      return RecruitmentController.hireCandidate(req, res);
    }
    const updated = await RecruitmentDAO.updateCandidateStage(
      req.params.id,
      stage,
      req.body.score,
      req.body.rating,
      { by: req.user?._id, note: req.body.note, notes: req.body.notes },
    );
    if (!updated) return fail(res, "Not found.", 404);
    await AuditService.log(req, {
      action: "recruitment.candidate.stage",
      resource: "candidate",
      resourceId: req.params.id,
      metadata: { stage },
    });
    return ok(res, { candidate: updated.value || updated });
  }

  static async hireCandidate(req, res) {
    try {
      const candidateId = req.params.id;
      const { templateId, department, position } = req.body;
      const candidates = await RecruitmentDAO.listCandidates(req.org);
      const candidate = candidates.find((c) => String(c._id) === String(candidateId));
      if (!candidate) return fail(res, "Candidate not found.", 404);
      if (candidate.employeeId) {
        return fail(res, "Candidate already hired.", 409);
      }

      const { firstName, surName } = splitName(candidate.name);
      const empResult = await EmployeeDAO.createEmployee({
        org: String(req.org),
        firstName,
        surName,
        email: candidate.email,
        phone: candidate.phone || "",
        department: department || candidate.department || "",
        position: position || "",
        status: "active",
        hireDate: new Date(),
        cv: candidate.resumePath || "",
        image: "",
        isAttendanceRequired: true,
        deductCostShare: false,
      });

      if (empResult?.error) return fail(res, "Could not create employee.", 500);

      const employeeId = String(empResult.insertedId);
      await RecruitmentDAO.updateCandidateStage(
        candidateId,
        "hired",
        null,
        null,
        { by: req.user?._id, note: "Auto-hire" },
      );
      await RecruitmentDAO.updateCandidate(candidateId, {
        employeeId,
        hiredOn: new Date(),
      });

      let onboardingInstance = null;
      let tplId = templateId;
      if (!tplId) {
        const templates = await OnboardingDAO.listTemplates(req.org);
        tplId = templates[0]?._id;
      }
      if (tplId) {
        onboardingInstance = await OnboardingDAO.startInstance({
          org: req.org,
          employeeId,
          templateId: String(tplId),
        });
      }

      const user = await UserService.getUser({ email: candidate.email });
      if (user?._id) {
        await UserService.updateUser({
          _id: user._id,
          employeeId: new ObjectId(employeeId),
          org: String(req.org),
        });
        await NotificationController.notifyUser({
          org: req.org,
          userId: user._id,
          type: "onboarding",
          title: "Welcome aboard!",
          message: "Your onboarding checklist is ready in My Portal.",
          href: "/app/portal",
          resourceType: "onboarding",
          resourceId: onboardingInstance?._id,
        });
      }

      await AuditService.log(req, {
        action: "recruitment.candidate.hire",
        resource: "candidate",
        resourceId: candidateId,
        summary: `Hired ${candidate.name} → employee ${employeeId}`,
        metadata: { employeeId, onboardingId: onboardingInstance?._id },
      });

      return ok(res, {
        candidate: { ...candidate, stage: "hired", employeeId },
        employeeId,
        onboarding: onboardingInstance,
        message: "Candidate hired, employee created, onboarding started.",
      });
    } catch (e) {
      console.error(e);
      return fail(res, "Hire process failed.", 500);
    }
  }

  static async updateCandidate(req, res) {
    const updated = await RecruitmentDAO.updateCandidate(req.params.id, req.body);
    if (!updated) return fail(res, "Not found.", 404);
    await AuditService.log(req, {
      action: "recruitment.candidate.update",
      resource: "candidate",
      resourceId: req.params.id,
    });
    return ok(res, { candidate: updated.value || updated });
  }
}

module.exports = RecruitmentController;
