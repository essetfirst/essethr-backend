const { startDb, PayrollDAO, closeDb } = require(".");

describe("PayrollDAO", () => {
  beforeAll(async () => await startDb());
  afterAll(async () => await closeDb());

  // describe("fetching payroll data", () => {
  //   it("is successful", async () => {
  //     const payrolls = await PayrollDAO.getPayrolls();

  //     expect(payrolls).toBeDefined();
  //     expect(Array.isArray(payrolls)).toBe(true);
  //   });

  //   it("fails", async () => {
  //     const payrolls = await PayrollDAO.getPayrolls();

  //     expect(payrolls).toBeDefined();
  //     expect(payrolls.error).toBeDefined();
  //   });
  // });

  describe("get payroll hours", () => {
    it("find payroll hours of employees", async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const fromDate = new Date(year, month, 1);
      const toDate = new Date(year, month, 3);

      const payrollHoursQuery = {
        org: "607df8fbcc06b33500eaec9c",
        fromDate,
        toDate,
      };

      const result = await PayrollDAO.getPayrollHours(payrollHoursQuery);

      console.log(result);

      expect(result).toBeDefined();
    });
  });

  describe("process payroll", () => {
    it("process payroll of employees", async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const fromDate = new Date(year, month, 1);
      const toDate = new Date(year, month, 3);

      const payrollQuery = {
        employees: [],
        title: "3 day salary",
        fromDate,
        toDate,
        commissionEnabled: true,
        salesData: [
          { date: `${year}-${month}-1`, count: 254 },
          { date: `${year}-${month}-2`, count: 456 },
          { date: `${year}-${month}-3`, count: 340 },
        ],
      };
      const result = await PayrollDAO.processPayroll(payrollQuery);

      console.log(result);

      expect(result).toBeDefined();
    });
  });

  // describe("generate payroll", () => {
  //   it("generates payroll batch", async () => {
  //     const payrollQuery = {};
  //     const result = await PayrollDAO.generatePayroll(payrollQuery);

  //     console.log(result);

  //     expect(result).toBeDefined();
  //   });
  // });

  // describe("generate payroll report", () => {
  //   it("generates nice payroll report", async () => {
  //     const payrollQuery = { from: "01-01-2020", to: "01-01-2022" };
  //     const result = await PayrollDAO.getReport(payrollQuery);

  //     console.log(result);

  //     expect(result).toBeDefined();
  //   });
  // });
});
