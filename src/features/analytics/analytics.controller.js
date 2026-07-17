const EmployeeDAO = require("../employees/employeeDAO");
const AttendanceDAO = require("../attendance/attendanceDAO");
const { flattenAttendanceRecords } = require("../attendance/attendanceDAO");
const { LeaveDAO } = require("../leaves/leaveDAO");
const PayrollDAO = require("../payroll/payrollDAO");
const RecruitmentDAO = require("../recruitment/recruitmentDAO");
const OnboardingDAO = require("../onboarding/onboardingDAO");
const WorkflowDAO = require("../workflows/workflowDAO");
const DepartmentDAO = require("../org/departmentDAO");
const { ok, fail } = require("../../lib/apiResponse");
const { canAccessDepartment } = require("../rbac/permissions.service");
const { PERMISSIONS } = require("../../constants/permissions");
const AnalyticsViewDAO = require("./analyticsViewDAO");

async function buildDepartmentNameMap(empList) {
  const ids = [
    ...new Set(
      empList
        .map((e) => e.department)
        .filter((id) => id && /^[a-f0-9]{24}$/i.test(String(id)))
        .map(String)
    ),
  ];
  const map = {};
  await Promise.all(
    ids.map(async (id) => {
      try {
        const dept = await DepartmentDAO.getById(id);
        if (dept?.name) map[id] = dept.name;
      } catch {
        /* skip invalid ids */
      }
    })
  );
  return map;
}

function departmentLabel(employee, deptNameMap) {
  if (employee.departmentDetails?.name) return employee.departmentDetails.name;
  const id = employee.department;
  if (id && deptNameMap[String(id)]) return deptNameMap[String(id)];
  if (id && !/^[a-f0-9]{24}$/i.test(String(id))) return String(id);
  return "Unassigned";
}

function asEmployeeList(result) {
  if (result?.error) return [];
  if (Array.isArray(result)) return result;
  return result.items || [];
}

function extractDateString(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(value).toISOString().slice(0, 10);
}

function weekRange(weeksAgo) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() - weeksAgo * 7);
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  return {
    fromDate: start.toISOString().slice(0, 10),
    toDate: end.toISOString().slice(0, 10),
  };
}

function employeeLabel(e) {
  if (!e) return "Unknown";
  return [e.firstName, e.surName || e.lastName].filter(Boolean).join(" ").trim() || "Employee";
}

function profileCompletion(employee) {
  const fields = ["firstName", "surName", "email", "phone", "department", "position", "dateOfBirth", "gender"];
  const filled = fields.filter((f) => employee[f] != null && String(employee[f]).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function hasPerm(req, perm) {
  return (req.permissions || []).includes(perm);
}

function headcountAtMonth(employees, year, month) {
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return employees.filter((employee) => {
    if (employee.status === "inactive") return false;
    const hiredOn = employee.createdOn || employee.hireDate || employee.joinDate;
    if (!hiredOn) return true;
    return new Date(hiredOn) <= monthEnd;
  }).length;
}

class AnalyticsController {
  static async dashboard(req, res) {
    try {
      const org = String(req.org);
      const employees = await EmployeeDAO.getEmployees({ org });
      const empList = asEmployeeList(employees);
      const deptNameMap = await buildDepartmentNameMap(empList);
      const active = empList.filter((e) => e.status !== "inactive").length;
      const inactive = empList.length - active;

      const leaves = await LeaveDAO.getLeaves({ org });
      const leaveList = leaves?.error ? [] : leaves;
      const pendingLeaves = leaveList.filter((l) => l.status === "pending" || !l.approved).length;

      const payrolls = await PayrollDAO.getPayrolls({ org });
      const payrollList = payrolls?.error ? [] : payrolls;

      const jobs = await RecruitmentDAO.listJobs(org);
      const openJobs = jobs.filter((j) => j.status === "open").length;

      const byDepartment = {};
      const byGender = {};
      const byAge = { "18-25": 0, "26-34": 0, "35-44": 0, "45-54": 0, "55-64": 0, "65+": 0, Unknown: 0 };
      const genderByDepartment = {};

      const ageFromDob = (dob) => {
        if (!dob) return null;
        const born = new Date(dob);
        if (Number.isNaN(born.getTime())) return null;
        const age = Math.floor((Date.now() - born.getTime()) / (365.25 * 24 * 3600 * 1000));
        if (age <= 25) return "18-25";
        if (age <= 34) return "26-34";
        if (age <= 44) return "35-44";
        if (age <= 54) return "45-54";
        if (age <= 64) return "55-64";
        return "65+";
      };

      empList.forEach((e) => {
        const dept = departmentLabel(e, deptNameMap);
        byDepartment[dept] = (byDepartment[dept] || 0) + 1;
        const g = e.gender || "Unknown";
        byGender[g] = (byGender[g] || 0) + 1;
        const bucket = ageFromDob(e.dateOfBirth || e.dob) || "Unknown";
        byAge[bucket] = (byAge[bucket] || 0) + 1;
        if (!genderByDepartment[dept]) genderByDepartment[dept] = { Male: 0, Female: 0, Unknown: 0 };
        const key = /^m/i.test(g) ? "Male" : /^f/i.test(g) ? "Female" : "Unknown";
        genderByDepartment[dept][key] = (genderByDepartment[dept][key] || 0) + 1;
      });

      const today = new Date().toISOString().slice(0, 10);
      const attendance = await AttendanceDAO.getTodayAttendances({ orgId: org, date: today });

      return ok(res, {
        analytics: {
          workforce: { total: empList.length, active, inactive, byDepartment, byGender, byAge, genderByDepartment },
          leaves: { total: leaveList.length, pending: pendingLeaves },
          payroll: { runs: payrollList.length, latest: payrollList[0] || null },
          recruitment: { openJobs },
          attendance: { todayCount: Array.isArray(attendance) ? attendance.length : 0 },
          turnoverRate: empList.length
            ? Number(((inactive / empList.length) * 100).toFixed(1))
            : 0,
        },
      });
    } catch (e) {
      console.error(e);
      return fail(res, "Analytics failed.", 500);
    }
  }

  static async operations(req, res) {
    try {
      const org = String(req.org);
      const user = req.user;
      const today = new Date().toISOString().slice(0, 10);
      const employees = await EmployeeDAO.getEmployees({ org });
      const empList = asEmployeeList(employees);
      const activeEmployees = empList.filter((e) => e.status !== "inactive");
      const scopedActive = activeEmployees.filter((e) => canAccessDepartment(user, e.department));
      const empMap = Object.fromEntries(empList.map((e) => [String(e._id), e]));

      const alerts = [];
      const widgets = [];

      const attendanceToday = await AttendanceDAO.getTodayAttendances({ orgId: org, date: today });
      const attTodayList = Array.isArray(attendanceToday) ? attendanceToday : [];
      const checkedInIds = new Set(attTodayList.filter((a) => a.checkin).map((a) => String(a.employeeId)));

      const absentToday = scopedActive
        .filter((e) => !checkedInIds.has(String(e._id)))
        .slice(0, 12)
        .map((e) => ({
          employeeId: String(e._id),
          name: employeeLabel(e),
          href: `/app/employees/${e._id}`,
        }));

      if (absentToday.length) {
        alerts.push({
          severity: "warning",
          title: `${absentToday.length} employee(s) not checked in today`,
          message: "Review attendance and follow up with absent staff.",
          href: "/app/attendance",
        });
      }

      widgets.push({
        key: "absent_today",
        title: "Absent Today",
        value: absentToday.length,
        href: "/app/attendance",
        items: absentToday,
      });

      const leaves = await LeaveDAO.getLeaves({ org });
      const leaveList = leaves?.error ? [] : leaves;
      const pendingLeaves = leaveList.filter((l) => l.status === "pending" || !l.approved);
      const onLeaveToday = leaveList.filter((l) => {
        if (l.status !== "approved" && l.approved !== true) return false;
        const start = extractDateString(l.startDate || l.from);
        const end = extractDateString(l.endDate || l.to || l.startDate);
        return start <= today && end >= today;
      });

      if (hasPerm(req, PERMISSIONS.LEAVES_APPROVE) && pendingLeaves.length) {
        alerts.push({
          severity: "info",
          title: `${pendingLeaves.length} leave request(s) awaiting approval`,
          message: "Action required in Leave Management.",
          href: "/app/leaves",
        });
      }

      const activeCount = scopedActive.length || 1;
      const leaveCoveragePct = Math.round((onLeaveToday.length / activeCount) * 100);
      if (leaveCoveragePct >= 20) {
        alerts.push({
          severity: "warning",
          title: "High leave coverage today",
          message: `${leaveCoveragePct}% of active staff are on approved leave.`,
          href: "/app/leaves",
        });
      }

      widgets.push({
        key: "pending_leaves",
        title: "Pending Leaves",
        value: pendingLeaves.length,
        href: "/app/leaves",
        items: pendingLeaves.slice(0, 8).map((l) => ({
          id: String(l._id),
          name: employeeLabel(empMap[String(l.employeeId)]),
          subtitle: `${l.startDate || ""} → ${l.endDate || ""}`,
        })),
      });

      widgets.push({
        key: "on_leave_today",
        title: "On Leave Today",
        value: onLeaveToday.length,
        href: "/app/leaves",
      });

      if (hasPerm(req, PERMISSIONS.WORKFLOWS_APPROVE)) {
        const wfPending = (await WorkflowDAO.listRequests(org, { status: "pending" }) || [])
          .filter((r) => r.status === "pending");
        widgets.push({
          key: "workflow_pending",
          title: "Workflow Approvals",
          value: wfPending.length,
          href: "/app/workflows",
        });
        if (wfPending.length) {
          alerts.push({
            severity: "info",
            title: `${wfPending.length} workflow approval(s) pending`,
            href: "/app/workflows",
          });
        }
      }

      if (hasPerm(req, PERMISSIONS.PAYROLL_READ)) {
        const payrolls = await PayrollDAO.getPayrolls({ org });
        const payrollList = payrolls?.error ? [] : payrolls;
        const draftPayrolls = payrollList.filter((p) => !p.locked && p.status !== "finalized");
        const readyToFinalize = payrollList.filter((p) => p.locked && p.status !== "finalized");

        widgets.push({
          key: "payroll_draft",
          title: "Payroll Drafts",
          value: draftPayrolls.length,
          href: "/app/payroll/list",
        });
        widgets.push({
          key: "payroll_finalize",
          title: "Ready to Finalize",
          value: readyToFinalize.length,
          href: "/app/payroll/list",
        });

        if (readyToFinalize.length && hasPerm(req, PERMISSIONS.PAYROLL_APPROVE)) {
          alerts.push({
            severity: "warning",
            title: `${readyToFinalize.length} payroll run(s) ready to finalize`,
            href: "/app/payroll/list",
          });
        }
      }

      if (hasPerm(req, PERMISSIONS.ONBOARDING_READ)) {
        const instances = await OnboardingDAO.listInstances(org);
        const inProgress = instances.filter((i) => i.status === "in_progress");
        const now = Date.now();
        const delayed = inProgress.filter((i) =>
          (i.tasks || []).some((t) => !t.completed && t.dueDate && new Date(t.dueDate).getTime() < now),
        );

        widgets.push({
          key: "onboarding",
          title: "Onboarding In Progress",
          value: inProgress.length,
          href: "/app/onboarding",
          items: inProgress.slice(0, 6).map((i) => ({
            id: String(i._id),
            name: employeeLabel(empMap[String(i.employeeId)]),
            subtitle: `${i.progress || 0}% complete`,
          })),
        });

        if (delayed.length) {
          alerts.push({
            severity: "warning",
            title: `${delayed.length} onboarding(s) have overdue tasks`,
            href: "/app/onboarding",
          });
        }
      }

      const incompleteProfiles = scopedActive
        .map((e) => ({ employee: e, completion: profileCompletion(e) }))
        .filter(({ completion }) => completion < 80)
        .sort((a, b) => a.completion - b.completion)
        .slice(0, 8);

      if (incompleteProfiles.length && hasPerm(req, PERMISSIONS.EMPLOYEES_READ)) {
        widgets.push({
          key: "incomplete_profiles",
          title: "Incomplete Profiles",
          value: incompleteProfiles.length,
          href: "/app/employees",
          items: incompleteProfiles.map(({ employee, completion }) => ({
            employeeId: String(employee._id),
            name: employeeLabel(employee),
            subtitle: `${completion}% complete`,
            href: `/app/employees/${employee._id}`,
          })),
        });
      }

      if (hasPerm(req, PERMISSIONS.RECRUITMENT_READ)) {
        const jobs = await RecruitmentDAO.listJobs(org);
        const openJobs = jobs.filter((j) => j.status === "open").length;
        widgets.push({
          key: "open_jobs",
          title: "Open Positions",
          value: openJobs,
          href: "/app/recruitment",
        });
      }

      return ok(res, {
        operations: {
          date: today,
          alerts,
          widgets,
          summary: {
            activeEmployees: scopedActive.length,
            checkedInToday: checkedInIds.size,
            pendingLeaves: pendingLeaves.length,
            onLeaveToday: onLeaveToday.length,
            leaveCoveragePct,
          },
        },
      });
    } catch (e) {
      console.error(e);
      return fail(res, "Operations dashboard failed.", 500);
    }
  }

  static async intelligence(req, res) {
    try {
      const org = String(req.org);
      const employees = await EmployeeDAO.getEmployees({ org });
      const empList = asEmployeeList(employees);
      const totalEmployees = empList.length;
      const inactiveEmployees = empList.filter((e) => e.status === "inactive").length;

      const attritionRisk = totalEmployees
        ? Number((inactiveEmployees / totalEmployees).toFixed(4))
        : 0;

      const leaves = await LeaveDAO.getLeaves({ org });
      const leaveList = leaves?.error ? [] : leaves;

      const absenteeismTrend = [];
      for (let weeksAgo = 3; weeksAgo >= 0; weeksAgo -= 1) {
        const range = weekRange(weeksAgo);
        const attendance = await AttendanceDAO.getAttendances({ orgId: org, ...range });
        const attList = flattenAttendanceRecords(attendance);
        const withCheckin = attList.filter((row) => row.checkin);
        const approvedAttendance = withCheckin.filter(
          (row) => row.status === "approved" || row.approved === true,
        );

        const weekLeaves = leaveList.filter((leave) => {
          const start = extractDateString(leave.startDate);
          const end = extractDateString(leave.endDate || leave.startDate);
          return start <= range.toDate && end >= range.fromDate;
        });
        const approvedLeaves = weekLeaves.filter(
          (leave) => leave.status === "approved" || leave.approved === true,
        );

        absenteeismTrend.push({
          weekStart: range.fromDate,
          weekEnd: range.toDate,
          attendanceRecords: withCheckin.length,
          approvedAttendance: approvedAttendance.length,
          approvedLeaves: approvedLeaves.length,
          attendanceToApprovedRatio: approvedAttendance.length
            ? Number((withCheckin.length / approvedAttendance.length).toFixed(2))
            : withCheckin.length,
        });
      }

      const now = new Date();
      const historical = [];
      for (let i = 5; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        historical.push({
          month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          headcount: headcountAtMonth(empList, d.getFullYear(), d.getMonth()),
        });
      }

      const recent = historical.slice(-3);
      const slope =
        recent.length >= 2
          ? (recent[recent.length - 1].headcount - recent[0].headcount) / (recent.length - 1)
          : 0;
      const lastHeadcount = recent[recent.length - 1]?.headcount ?? empList.filter((e) => e.status !== "inactive").length;

      const headcountForecast = [];
      for (let i = 1; i <= 3; i += 1) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        headcountForecast.push({
          month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          projectedHeadcount: Math.max(0, Math.round(lastHeadcount + slope * i)),
        });
      }

      const lookback = weekRange(0);
      lookback.fromDate = extractDateString(new Date(Date.now() - 28 * 24 * 3600 * 1000));
      const recentAttendance = await AttendanceDAO.getAttendances({ orgId: org, ...lookback });
      const recentList = flattenAttendanceRecords(recentAttendance);

      const overtimeByEmployee = {};
      recentList.forEach((row) => {
        if (!row.employeeId) return;
        const overtime =
          Number(row.overtimeHours) ||
          (Number(row.workedHours) > 8 ? Number(row.workedHours) - 8 : 0);
        if (overtime <= 0) return;
        overtimeByEmployee[row.employeeId] = (overtimeByEmployee[row.employeeId] || 0) + overtime;
      });

      const overtimeValues = Object.values(overtimeByEmployee);
      const averageOvertime = overtimeValues.length
        ? overtimeValues.reduce((sum, val) => sum + val, 0) / overtimeValues.length
        : 0;
      const threshold = averageOvertime * 2;

      const overtimeAnomalies = Object.entries(overtimeByEmployee)
        .filter(([, hours]) => hours > threshold && threshold > 0)
        .map(([employeeId, overtimeHours]) => ({
          employeeId,
          overtimeHours: Number(overtimeHours.toFixed(2)),
          averageOvertime: Number(averageOvertime.toFixed(2)),
          multiplier: Number((overtimeHours / averageOvertime).toFixed(2)),
        }))
        .sort((a, b) => b.overtimeHours - a.overtimeHours);

      return ok(res, {
        intelligence: {
          attritionRisk,
          absenteeismTrend,
          headcountForecast,
          overtimeAnomalies,
          summary: {
            totalEmployees,
            inactiveEmployees,
            averageOvertime: Number(averageOvertime.toFixed(2)),
          },
        },
      });
    } catch (e) {
      console.error(e);
      return fail(res, "Intelligence failed.", 500);
    }
  }

  static async listViews(req, res) {
    try {
      const items = await AnalyticsViewDAO.list(req.org, req.user._id);
      return ok(res, {
        views: items.map((v) => ({
          name: v.name,
          filters: v.filters,
          savedAt: v.savedAt,
        })),
      });
    } catch (e) {
      console.error(e);
      return fail(res, "Could not load saved views.", 500);
    }
  }

  static async saveView(req, res) {
    try {
      const { name, filters } = req.body || {};
      if (!name || !String(name).trim()) {
        return fail(res, "View name is required.", 400);
      }
      await AnalyticsViewDAO.upsert(req.org, req.user._id, name, filters);
      const items = await AnalyticsViewDAO.list(req.org, req.user._id);
      return ok(res, {
        views: items.map((v) => ({
          name: v.name,
          filters: v.filters,
          savedAt: v.savedAt,
        })),
      });
    } catch (e) {
      console.error(e);
      return fail(res, "Could not save view.", 500);
    }
  }

  static async deleteView(req, res) {
    try {
      const name = decodeURIComponent(req.params.name || "");
      if (!name) {
        return fail(res, "View name is required.", 400);
      }
      await AnalyticsViewDAO.remove(req.org, req.user._id, name);
      const items = await AnalyticsViewDAO.list(req.org, req.user._id);
      return ok(res, {
        views: items.map((v) => ({
          name: v.name,
          filters: v.filters,
          savedAt: v.savedAt,
        })),
      });
    } catch (e) {
      console.error(e);
      return fail(res, "Could not delete view.", 500);
    }
  }
}

module.exports = AnalyticsController;
