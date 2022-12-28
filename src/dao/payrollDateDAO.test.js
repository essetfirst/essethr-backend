const { MongoClient } = require("mongodb");
const EmployeeDAO = require("./employeeDAO");
const PayrollDateDAO = require("./payrollDateDAO");

function* dateRange(from, to) {
  let i = from;

  while (i <= to) {
    yield i;
    i = new Date(i.getTime() + 24 * 3600000);
  }
}

describe("PayrollDateDAO test cases", () => {
  const uri = `mongodb://localhost/payrollex`;
  let client;
  beforeAll(async () => {
    client = new MongoClient(uri, {
      //   poolSize: 5,
      //   wtimeout: 100,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db("payrollex");

    await PayrollDateDAO.injectDB(db);
    await EmployeeDAO.injectDB(db);
  });
  afterAll(async () => client.close());

  describe("adding employee date", () => {
    let employees = [];
    beforeAll(async () => (employees = await EmployeeDAO.getEmployees()));

    it("attendance hours", async () => {
      await PayrollDateDAO.deleteAllDates();
      const dateInfo = {
        employeeId: employees[0]._id,
        date: new Date(),
        attendanceHours: 8,
        leaveHours: 0,
        holidayHours: 0,
        overtimeHours: 2,
      };
      const result = await PayrollDateDAO.addDate(dateInfo);

      expect(result).toBeDefined();
      expect(result.error).not.toBeDefined();
    });

    it("leave hours", async () => {
      const from = new Date("2020-11-05");
      const to = new Date("2020-11-12");

      let dates = [];
      const range = dateRange(from, to);
      for (let date of range) {
        dates.push(date);
      }

      //   console.log(dates);

      let results = [];
      dates.map(async (date) => {
        let dateInfo = {
          employeeId: employees[0]._id,
          date,
          attendanceHours: 0,
          leaveHours: 8,
          holidayHours: 0,
          overtimeHours: 0,
        };

        const result = await PayrollDateDAO.addDate(dateInfo);

        // console.log(result);
        expect(result).toBeDefined();
        expect(result.error).not.toBeDefined();
      });
    });
  });

  describe("fetching employee dates", () => {
    it("without filters", async () => {
      const dates = await PayrollDateDAO.getDates({});

      expect(dates).toBeDefined();
      expect(Array.isArray(dates)).toBe(true);
    });

    it("with employee id filter", async () => {
      const dates = await PayrollDateDAO.getDates({ employeeId: 1 });

      //   console.log(dates);

      expect(dates).toBeDefined();
      expect(Array.isArray(dates)).toBe(true);
    });

    it("with date filters", async () => {
      const dates = await PayrollDateDAO.getDates({
        from: new Date("2020-11-01").toISOString(),
        to: new Date("2020-11-11").toISOString(),
      });

      expect(dates).toBeDefined();
      expect(Array.isArray(dates)).toBe(true);
    });

    it("with employee id and date filters", async () => {
      const dates = await PayrollDateDAO.getDates({
        employeeId: 1,
        from: new Date("2020-11-01").toISOString(),
        to: new Date("2020-11-11").toISOString(),
      });

      expect(dates).toBeDefined();
      expect(Array.isArray(dates)).toBe(true);
    });
  });

  describe("aggregating dates summary", () => {
    it("without date filters is successful", async () => {
      let summary = await PayrollDateDAO.generateSummary();
      summary = summary.map(
        ({
          totalWorkedHours,
          totalLeaveHours,
          totalHolidayHours,
          ...rest
        }) => ({
          totalPaidDays:
            (totalWorkedHours + totalLeaveHours + totalHolidayHours) / 8,
          totalWorkedHours,
          totalLeaveHours,
          ...rest,
        })
      );
      console.log(summary);
      expect(summary).toBeDefined();
      expect(Array.isArray(summary)).toBe(true);
    });
  });
});
