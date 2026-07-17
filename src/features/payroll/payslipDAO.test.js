const PayslipDAO = require("./payslipDAO");
const PayrollService = require("./payroll.service");
const EmployeeDAO = require("../employees/employeeDAO");
const OrgDAO = require("../org/orgDAO");
const { buildOrgInfo, buildEmployeeInfo } = require("../../test/fixtures");
const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

describe("PayslipDAO", () => {
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

  it("creates payslip with pension and tax deductions", async () => {
    const gross = 8000;
    const { incomeTax, pension, netSalary } = PayrollService.computeDeductions(gross);

    const result = await PayslipDAO.createPayslip({
      employeeId,
      payrollId: "test-payroll",
      fromDate: "2026-01-01",
      toDate: "2026-01-31",
      payDate: "2026-02-05",
      frequency: "Monthly",
      earnings: [{ description: "Base", amount: gross }],
      deductions: [
        { description: "Income Tax", amount: incomeTax },
        { description: "Pension", amount: pension },
      ],
      earningsTotal: gross,
      deductionsTotal: incomeTax + pension,
      netPay: netSalary,
    });

    expect(result.error).toBeUndefined();
    expect(result.insertedId).toBeDefined();
  });
});
