const { LeaveDAO } = require("../leaves/leaveDAO");
const WorkflowDAO = require("../workflows/workflowDAO");
const EmployeeDAO = require("../employees/employeeDAO");
const AttendanceDAO = require("../attendance/attendanceDAO");
const { flattenAttendanceRecords } = require("../attendance/attendanceDAO");
const OnboardingDAO = require("../onboarding/onboardingDAO");
const PayrollDAO = require("../payroll/payrollDAO");
const { ok, fail } = require("../../lib/apiResponse");
const { canAccessDepartment } = require("../rbac/permissions.service");
const { PERMISSIONS } = require("../../constants/permissions");

function asEmployeeList(result) {
  if (result?.error) return [];
  if (Array.isArray(result)) return result;
  return result.items || [];
}

function employeeLabel(e) {
  if (!e) return "Unknown";
  return [e.firstName, e.surName || e.lastName].filter(Boolean).join(" ").trim() || "Employee";
}

function hasPerm(req, perm) {
  return (req.permissions || []).includes(perm);
}

class InboxController {
  static async workQueue(req, res) {
    try {
      const org = String(req.org);
      const user = req.user;
      const role = String(user?.role || "").toUpperCase();
      const items = [];

      const employees = asEmployeeList(await EmployeeDAO.getEmployees({ org }));
      const empMap = Object.fromEntries(employees.map((e) => [String(e._id), e]));
      const scopedEmpIds = new Set(
        employees
          .filter((e) => canAccessDepartment(user, e.department))
          .map((e) => String(e._id)),
      );

      if (hasPerm(req, PERMISSIONS.LEAVES_APPROVE)) {
        const leaves = await LeaveDAO.getLeaves({ org });
        const leaveList = leaves?.error ? [] : leaves;
        leaveList
          .filter(
            (l) =>
              (l.status === "pending" || !l.approved) &&
              scopedEmpIds.has(String(l.employeeId)),
          )
          .slice(0, 25)
          .forEach((l) => {
            const emp = empMap[String(l.employeeId)];
            items.push({
              id: `leave-${l._id}`,
              kind: "leave_approval",
              priority: "high",
              title: `Leave request — ${employeeLabel(emp)}`,
              subtitle: `${l.leaveType || "Leave"} · ${l.startDate || ""} → ${l.endDate || ""}`,
              resourceId: String(l._id),
              href: "/app/leaves",
              actions: [{ label: "Review", action: "navigate", href: "/app/leaves" }],
              createdOn: l.createdOn || new Date(),
            });
          });
      }

      if (hasPerm(req, PERMISSIONS.WORKFLOWS_APPROVE)) {
        const requests = await WorkflowDAO.listRequests(org, { status: "pending" });
        (requests || [])
          .filter((r) => r.status === "pending")
          .slice(0, 25)
          .forEach((r) => {
            const requester = empMap[String(r.requesterId)] || {};
            items.push({
              id: `wf-${r._id}`,
              kind: "workflow_approval",
              priority: "medium",
              title: `${r.type || "Request"} approval`,
              subtitle: `From ${employeeLabel(requester) || r.requesterId}`,
              resourceId: String(r._id),
              href: "/app/workflows",
              actions: [
                { label: "Approve", action: "approve_workflow", id: String(r._id) },
                { label: "Review", action: "navigate", href: "/app/workflows" },
              ],
              createdOn: r.createdOn || new Date(),
            });
          });
      }

      if (hasPerm(req, PERMISSIONS.ATTENDANCE_APPROVE)) {
        const today = new Date().toISOString().slice(0, 10);
        const attendance = await AttendanceDAO.getAttendances({
          orgId: org,
          fromDate: today,
          toDate: today,
        });
        const attList = flattenAttendanceRecords(attendance);
        attList
          .filter(
            (a) =>
              scopedEmpIds.has(String(a.employeeId)) &&
              (a.status === "pending" || a.approved === false),
          )
          .slice(0, 15)
          .forEach((a) => {
            const emp = empMap[String(a.employeeId)];
            items.push({
              id: `att-${a._id}`,
              kind: "attendance_approval",
              priority: "medium",
              title: `Attendance review — ${employeeLabel(emp)}`,
              subtitle: `${a.date || today} · ${a.remark || "Needs approval"}`,
              resourceId: String(a._id),
              href: "/app/attendance",
              createdOn: a.createdOn || new Date(),
            });
          });
      }

      if (hasPerm(req, PERMISSIONS.PAYROLL_APPROVE)) {
        const payrolls = await PayrollDAO.getPayrolls({ org });
        const payrollList = payrolls?.error ? [] : payrolls;
        payrollList
          .filter((p) => p.locked && p.status !== "finalized")
          .slice(0, 10)
          .forEach((p) => {
            items.push({
              id: `payroll-${p._id}`,
              kind: "payroll_finalize",
              priority: "high",
              title: `Finalize payroll — ${p.title || p.period || "Run"}`,
              subtitle: `Locked · ready for finalization`,
              resourceId: String(p._id),
              href: `/app/payroll/${p._id}`,
              createdOn: p.lastModifiedOn || p.createdOn || new Date(),
            });
          });
      }

      if (hasPerm(req, PERMISSIONS.ONBOARDING_READ) && ["ADMIN", "HR_MANAGER"].includes(role)) {
        const instances = await OnboardingDAO.listInstances(org);
        const now = Date.now();
        instances
          .filter((i) => i.status === "in_progress")
          .forEach((i) => {
            const overdueTasks = (i.tasks || []).filter(
              (t) => !t.completed && t.dueDate && new Date(t.dueDate).getTime() < now,
            );
            if (overdueTasks.length === 0) return;
            const emp = empMap[String(i.employeeId)];
            items.push({
              id: `onb-${i._id}`,
              kind: "onboarding_overdue",
              priority: "medium",
              title: `Onboarding overdue — ${employeeLabel(emp)}`,
              subtitle: `${overdueTasks.length} task(s) past due`,
              resourceId: String(i._id),
              href: "/app/onboarding",
              createdOn: i.updatedOn || i.createdOn || new Date(),
            });
          });
      }

      items.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

      return ok(res, {
        items,
        counts: {
          total: items.length,
          leaveApprovals: items.filter((i) => i.kind === "leave_approval").length,
          workflowApprovals: items.filter((i) => i.kind === "workflow_approval").length,
          attendanceApprovals: items.filter((i) => i.kind === "attendance_approval").length,
          payrollFinalize: items.filter((i) => i.kind === "payroll_finalize").length,
          onboardingOverdue: items.filter((i) => i.kind === "onboarding_overdue").length,
        },
      });
    } catch (e) {
      console.error(e);
      return fail(res, "Could not load work queue.", 500);
    }
  }
}

module.exports = InboxController;
