const PayrollService = require("./payroll.service");

describe("PayrollService", () => {
  describe("computeDeductions", () => {
    it("computes Ethiopian tax and pension for gross salary", () => {
      const result = PayrollService.computeDeductions(10000);
      expect(result.grossSalary).toBe(10000);
      expect(result.incomeTax).toBeCloseTo(2045, 5);
      expect(result.pension).toBe(7000);
      expect(result.netSalary).toBeCloseTo(955, 5);
    });

    it("handles zero salary", () => {
      const result = PayrollService.computeDeductions(0);
      expect(result.netSalary).toBe(0);
    });
  });
});
