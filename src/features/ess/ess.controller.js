const EmployeeDAO = require("../employees/employeeDAO");
const PayslipDAO = require("../payroll/payslipDAO");
const AttendanceDAO = require("../attendance/attendanceDAO");
const { flattenAttendanceRecords } = require("../attendance/attendanceDAO");
const { LeaveDAO } = require("../leaves/leaveDAO");
const AnnouncementDAO = require("../announcements/announcementDAO");
const WorkflowDAO = require("../workflows/workflowDAO");
const OnboardingDAO = require("../onboarding/onboardingDAO");
const { DocumentDAO } = require("../documents/documentDAO");
const AuditDAO = require("../audit/auditDAO");
const { ok, fail } = require("../../lib/apiResponse");

class EssController {
  static async getMe(req, res) {
    const user = req.user;
    let employee = null;
    if (user.employeeId) {
      employee = await EmployeeDAO.getEmployeeById({ id: user.employeeId });
    }
    return ok(res, {
      user: {
        _id: user._id, email: user.email, role: user.role,
        firstName: user.firstName, lastName: user.lastName,
        employeeId: user.employeeId, permissions: req.permissions,
      },
      employee,
    });
  }

  static async getPayslips(req, res) {
    if (!req.user.employeeId) return ok(res, { payslips: [] });
    const payslips = await PayslipDAO.getPayslips({
      employeeId: String(req.user.employeeId),
      org: req.org,
    });
    const list = payslips?.error ? [] : payslips;
    return ok(res, { payslips: list });
  }

  static async getAttendance(req, res) {
    if (!req.user.employeeId) return ok(res, { attendance: [] });
    const result = await AttendanceDAO.getAttendances({
      orgId: req.org,
      employees: [String(req.user.employeeId)],
      fromDate: req.query.from,
      toDate: req.query.to,
    });
    const list = flattenAttendanceRecords(result).filter(
      (row) => String(row.employeeId) === String(req.user.employeeId),
    );
    return ok(res, { attendance: list });
  }

  static async getLeaves(req, res) {
    const employeeId = req.user.employeeId;
    const result = await LeaveDAO.getLeaves({
      org: req.org, employeeId: employeeId ? String(employeeId) : undefined,
    });
    return ok(res, { leaves: result?.error ? [] : result });
  }

  static async getAnnouncements(req, res) {
    const items = await AnnouncementDAO.list(req.org);
    return ok(res, { announcements: items });
  }

  static async getApprovals(req, res) {
    const requests = await WorkflowDAO.listRequests(req.org, {
      requesterId: String(req.user._id),
    });
    return ok(res, { requests });
  }

  static async getActivity(req, res) {
    if (!req.user.employeeId) return ok(res, { activity: [] });
    const result = await AuditDAO.queryByResource({
      org: req.org,
      resourceId: String(req.user.employeeId),
      resource: "employee",
      limit: Number(req.query.limit) || 30,
    });
    return ok(res, { activity: result?.items || [] });
  }

  static async getDocuments(req, res) {
    if (!req.user.employeeId) return ok(res, { documents: [] });
    const result = await DocumentDAO.list({
      org: req.org,
      employeeId: String(req.user.employeeId),
    });
    return ok(res, { documents: result?.error ? [] : result.items || [] });
  }

  static async getOnboarding(req, res) {
    if (!req.user.employeeId) return ok(res, { instances: [] });
    const instances = await OnboardingDAO.listInstances(req.org, String(req.user.employeeId));
    return ok(res, { instances: instances || [] });
  }
}

module.exports = EssController;
