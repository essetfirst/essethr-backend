const TimesheetDAO = require("./timesheetDAO");
const EmployeeDAO = require("../employees/employeeDAO");
const OrgDAO = require("../org/orgDAO");
const { buildOrgInfo, buildEmployeeInfo } = require("../../test/fixtures");
const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

describe("TimesheetDAO", () => {
  let employeeId;

  beforeAll(async () => {
    const org = await OrgDAO.createOrg({
      ...buildOrgInfo(),
      attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
      createdBy: "integration@test.local",
    });
    const employee = await EmployeeDAO.createEmployee(
      buildEmployeeInfo(String(org.insertedId)),
    );
    employeeId = String(employee.insertedId);
  });

  it("creates employee timesheet when schema validation is aligned", async () => {
    const result = await TimesheetDAO.createTimesheet({
      employeeId,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      status: "DRAFT",
    });

    expect(result?.error).toBeUndefined();
    expect(result?.insertedId || result?._id).toBeDefined();
  });
});
