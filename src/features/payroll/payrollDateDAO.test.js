const PayrollDateDAO = require("./payrollDateDAO");
const EmployeeDAO = require("../employees/employeeDAO");
const OrgDAO = require("../org/orgDAO");
const { buildOrgInfo, buildEmployeeInfo, buildPayrollDateInfo } = require("../../test/fixtures");
const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

describe("PayrollDateDAO", () => {
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

  it("computes payroll dates across month boundaries", async () => {
    const dates = [
      buildPayrollDateInfo(employeeId, "2026-01-31"),
      buildPayrollDateInfo(employeeId, "2026-02-01"),
    ];

    const inserted = await PayrollDateDAO.addDates(dates);
    expect(inserted.error).toBeUndefined();

    const found = await PayrollDateDAO.getDates({
      employees: [employeeId],
      fromDate: "2026-01-01",
      toDate: "2026-02-28",
    });

    expect(Array.isArray(found)).toBe(true);
    expect(found.length).toBeGreaterThanOrEqual(2);
  });
});
