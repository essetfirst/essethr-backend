const { startDb, closeDb, EmployeeDAO } = require("./");

describe("EmployeeDAO test suites", () => {
  beforeAll(async () => {
    await startDb();
  });
  afterAll(async () => await closeDb());

  describe("create employee", () => {
    // beforeEach(async () => await EmployeeDAO.deleteAllEmployees());

    it("creates new employee", async () => {
      const employeeInfo = {
        firstName: "Anteneh",
        surName: "Tesfaye",
        lastName: "Kassu",
        shortName: "Anteneh Tesfaye",
        gender: "Male",
        department: "Engineering",
        position: "Front-end Developer",
        salary: 6500.0,
        allowances: [
          { type: "transport", amount: 2000 },
          { type: "housing", amount: 2000 },
        ],
        pension: 0.07,
        taxCode: "C",
        taxRate: 0.2,
      };

      const result = await EmployeeDAO.createEmployee(employeeInfo);

      expect(result).toBeDefined();
      expect(result.insertedCount).toBeGreaterThan(0);
    });
  });

  describe("fetch employees", () => {
    it("fetchs all employees", async () => {
      const employees = await EmployeeDAO.getEmployees();
      console.log(employees);

      expect(employees).toBeDefined();
      expect(Array.isArray(employees)).toBe(true);
    });
  });
});
