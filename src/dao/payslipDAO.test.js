const { startDb, closeDb, PayslipDAO } = require("./index");

describe("PayslipDAO test suites", () => {
  beforeAll(async () => {
    startDb();
  });
  afterAll(async () => await closeDb());

  describe("create payslip", () => {
    beforeEach(async () => await PayslipDAO.deleteAllPayslips());

    it("creates new payslip", async () => {
      const payslipInfo = {
        employeeId: 1,
        payrollId: 2,
        fromDate: new Date("2020-11-04").toISOString(),
        toDate: new Date("2020-12-03").toISOString(),
        payDate: new Date("2020-12-30").toISOString(),
        frequency: "Monthly",
        monthlySalary: 5000,
        dailyRate: 5000 / 30,
        hourlyRate: 5000 / (24 * 30),
        earnings: [
          {
            description: "Standard",
            units: 25,
            ratePerUnit: 5000 / 30,
            amount: (25 * 5000) / 30,
          },
          {
            description: "(Paid) Leave",
            units: 4,
            ratePerUnit: 5000 / 30,
            amount: 2000 / 3,
          },
          { description: "Housing allowance", amount: 2000 },
          { description: "Transport allowance", amount: 1000 },
        ],
        deductions: [
          {
            description: "Tax",
            rate: 0.2,
            amount: 5000 * 0.2,
          },
          {
            description: "Pension",
            rate: 0.07,
            amount: 5000 * 0.07,
          },
        ],
        totalDeductions: 5000 * 0.27,
        totalEarnings: 5000 + 3000,
        netPayment: 8000 - 5000 * 0.27,
      };

      const result = await PayslipDAO.createPayslip(payslipInfo);

      expect(result).toBeDefined();
      expect(result.insertedCount).toBeGreaterThan(0);
    });
  });

  describe("fetch payslips", () => {
    it("gets payslips without filters", async () => {
      const payslips = await PayslipDAO.getPayslips();

      expect(payslips).toBeDefined();
      expect(Array.isArray(payslips)).toBe(true);
    });

    it("gets payslips with employee id filter", async () => {
      const payslips = await PayslipDAO.getPayslips({ employees: [1, 2] });

      expect(payslips).toBeDefined();
      expect(Array.isArray(payslips)).toBe(true);
    });

    it("gets payslips with date range filters", async () => {
      const payslips = await PayslipDAO.getPayslips({
        from: "2020-11-02",
        to: "2020-12-11",
      });

      expect(payslips).toBeDefined();
      expect(Array.isArray(payslips)).toBe(true);
    });

    it("gets payslips with employee id and date range filters", async () => {
      const payslips = await PayslipDAO.getPayslips({
        employees: [1, 2],
        from: "2020-11-02",
        to: "2020-12-11",
      });

      expect(payslips).toBeDefined();
      expect(Array.isArray(payslips)).toBe(true);
    });
  });

  describe("fetch payroll batch payslips", () => {
    it("gets payslips associated with a payroll", async () => {
      const payslips = await PayslipDAO.getPayrollPayslips(1);

      expect(payslips).toBeDefined();
      expect(Array.isArray(payslips)).toBe(true);
    });
  });
});
