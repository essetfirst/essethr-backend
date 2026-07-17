const PayrollService = require("./payroll.service");

describe("PayrollController integration", () => {
  it("add controller integration tests when payroll service layer is extracted", async () => {
    const result = PayrollService.computeDeductions(10900);
    expect(result.incomeTax).toBeCloseTo(2315, 5);
    expect(result.pension).toBeCloseTo(7630, 0);
  });
});
