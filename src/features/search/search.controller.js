const EmployeeDAO = require("../employees/employeeDAO");
const { LeaveDAO } = require("../leaves/leaveDAO");
const RecruitmentDAO = require("../recruitment/recruitmentDAO");
const OnboardingDAO = require("../onboarding/onboardingDAO");
const { ok, fail } = require("../../lib/apiResponse");
const { canAccessDepartment } = require("../rbac/permissions.service");

function asEmployeeList(result) {
  if (result?.error) return [];
  if (Array.isArray(result)) return result;
  return result.items || [];
}

function employeeLabel(e) {
  return [e.firstName, e.surName || e.lastName].filter(Boolean).join(" ").trim() || e.email || "Employee";
}

class SearchController {
  static async global(req, res) {
    try {
      const org = String(req.org);
      const q = String(req.query.q || "").trim();
      const limit = Math.min(Number(req.query.limit) || 8, 20);

      if (q.length < 2) {
        return ok(res, { results: [], query: q });
      }

      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const results = [];

      const employees = asEmployeeList(await EmployeeDAO.getEmployees({ org }));
      const scopedEmployees = employees.filter(
        (e) => canAccessDepartment(req.user, e.department),
      );

      scopedEmployees
        .filter((e) =>
          regex.test(employeeLabel(e)) ||
          regex.test(String(e.email || "")) ||
          regex.test(String(e.employeeId || e.staffId || "")),
        )
        .slice(0, limit)
        .forEach((e) => {
          results.push({
            type: "employee",
            id: String(e._id),
            title: employeeLabel(e),
            subtitle: e.email || e.departmentDetails?.name || "Employee",
            href: `/app/employees/${e._id}`,
          });
        });

      const leaves = await LeaveDAO.getLeaves({ org });
      const leaveList = leaves?.error ? [] : leaves;
      const empMap = Object.fromEntries(scopedEmployees.map((e) => [String(e._id), e]));

      leaveList
        .filter((l) => {
          const emp = empMap[String(l.employeeId)];
          if (!emp) return false;
          return regex.test(employeeLabel(emp)) || regex.test(String(l.leaveType || ""));
        })
        .slice(0, limit)
        .forEach((l) => {
          const emp = empMap[String(l.employeeId)];
          results.push({
            type: "leave",
            id: String(l._id),
            title: `${employeeLabel(emp)} — ${l.leaveType || "Leave"}`,
            subtitle: `${l.startDate || ""} → ${l.endDate || ""} · ${l.status || "pending"}`,
            href: "/app/leaves",
          });
        });

      if (req.permissions?.includes("recruitment:read")) {
        const jobs = await RecruitmentDAO.listJobs(org);
        jobs
          .filter((j) => regex.test(j.title || "") || regex.test(j.department || ""))
          .slice(0, limit)
          .forEach((j) => {
            results.push({
              type: "job",
              id: String(j._id),
              title: j.title,
              subtitle: `${j.department || "—"} · ${j.status || "open"}`,
              href: "/app/recruitment",
            });
          });

        const candidates = await RecruitmentDAO.listCandidates(org);
        candidates
          .filter((c) => regex.test(c.name || "") || regex.test(c.email || ""))
          .slice(0, limit)
          .forEach((c) => {
            results.push({
              type: "candidate",
              id: String(c._id),
              title: c.name || c.email,
              subtitle: `Stage: ${c.stage || "applied"}`,
              href: "/app/recruitment",
            });
          });
      }

      if (req.permissions?.includes("onboarding:read")) {
        const instances = await OnboardingDAO.listInstances(org);
        instances
          .filter((i) => {
            const emp = empMap[String(i.employeeId)];
            return emp && regex.test(employeeLabel(emp));
          })
          .slice(0, limit)
          .forEach((i) => {
            const emp = empMap[String(i.employeeId)];
            results.push({
              type: "onboarding",
              id: String(i._id),
              title: `Onboarding — ${employeeLabel(emp)}`,
              subtitle: `${i.progress || 0}% complete`,
              href: "/app/onboarding",
            });
          });
      }

      return ok(res, { results: results.slice(0, limit * 2), query: q });
    } catch (e) {
      console.error(e);
      return fail(res, "Search failed.", 500);
    }
  }
}

module.exports = SearchController;
