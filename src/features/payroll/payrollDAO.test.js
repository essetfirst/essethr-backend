const PayrollService = require("./payroll.service");
const OrgDAO = require("../org/orgDAO");
const { buildOrgInfo } = require("../../test/fixtures");
const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

describe("PayrollDAO", () => {
  let orgId;

  beforeAll(async () => {
    const org = await OrgDAO.createOrg({
      ...buildOrgInfo(),
      attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
      createdBy: "integration@test.local",
    });
    orgId = String(org.insertedId);
  });

  it("find payroll hours of employees with Ethiopian tax fixtures", async () => {
    const deductions = PayrollService.computeDeductions(5250);
    expect(deductions.incomeTax).toBeCloseTo(747.5, 5);

    const payrolls = await PayrollService.listPayrolls(orgId);
    expect(Array.isArray(payrolls)).toBe(true);
  });
});
