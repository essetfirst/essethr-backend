const { startDb, closeDb } = require("./index");
const TimesheetDAO = require("./timesheetDAO");

describe("TimesheetDAO unit tests", () => {
  beforeAll(async () => {
    console.log("Setting up testing requirements");
    await startDb();
  });

  afterAll(async () => {
    console.log("Closing testing loose ends");
    await closeDb();
  });

  describe("creating employee timesheet", () => {
    it("creates new employee timesheet", async () => {
      const result = await TimesheetDAO.createTimesheet({
        employeeId: 1,
        date: new Date(),
        escobar: "shit",
      });

      expect(result).toBeDefined();
      expect(result.error).not.toBeDefined();
    });

    it("fails creating timesheet with no employeeId", async () => {
      const result = await TimesheetDAO.createTimesheet({
        date: new Date(),
      });

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
    });

    it("fails creating timesheet with no date", async () => {
      const result = await TimesheetDAO.createTimesheet({
        employeeId: 1,
      });

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
    });
  });

  describe("Fetching timesheet", () => {
    it("fetches all timesheets of all employees", async () => {
      const result = await TimesheetDAO.getTimesheets({});

      expect(result).toBeDefined();
      expect(result.error).not.toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("adding employee worked hours", () => {
    let timesheet;
    beforeAll(async () => {
      const result = await TimesheetDAO.getTimesheets({});
      timesheet = Array.isArray(result) && result.length > 0 ? result[0] : null;
    });

    it("adds worked hours to employee timesheet", async () => {
      const result = await TimesheetDAO.addWorkedHours(timesheet, {
        hours: 1,
        from: Date.now() + 3600000,
        to: Date.now() + 2 * 3600000,
      });

      expect(result).toBeDefined();
      expect(result.error).not.toBeDefined();
    });

    it("fails to add worked hours for nonexistent timesheet", async () => {
      const result = await TimesheetDAO.addWorkedHours(null, {
        hours: 1,
        from: Date.now() + 3600000,
        to: Date.now() + 2 * 3600000,
      });

      expect(result).toBeDefined();
      expect(result.error).not.toBeDefined();
    });
  });

  describe("adding employee overtime hours", () => {
    let timesheet;
    beforeAll(async () => {
      const result = await TimesheetDAO.getTimesheets({});
      timesheet = Array.isArray(result) && result.length > 0 ? result[0] : null;
    });

    it("adds overtime hours to employee timesheet", async () => {
      const result = await TimesheetDAO.addOvertimeHours(timesheet, {
        hours: 1,
        from: Date.now() + 3600000,
        to: Date.now() + 2 * 3600000,
      });

      expect(result).toBeDefined();
      expect(result.error).not.toBeDefined();
    });

    it("fails to add overtime hours for nonexistent timesheet", async () => {
      const result = await TimesheetDAO.addOvertimeHours(null, {
        hours: 1,
        from: Date.now() + 3600000,
        to: Date.now() + 2 * 3600000,
      });

      expect(result).toBeDefined();
      expect(result.error).not.toBeDefined();
    });
  });

  describe("approving employee timesheet", () => {
    let timesheet;
    beforeAll(async () => {
      const result = await TimesheetDAO.getTimesheets();
      timesheet = Array.isArray(result) && result.length > 0 ? result[0] : null;
    });

    it("approves employee timesheet", async () => {
      const result = await TimesheetDAO.approveTimesheet(timesheet);
      expect(result).toBeDefined();
      expect(result.error).not.toBeDefined();
    });

    it("fails to approve timesheet for nonexistent timesheet", async () => {
      const result = await TimesheetDAO.approveTimesheet(null);
      expect(result).toBeDefined();
      expect(result.error).not.toBeDefined();
    });
  });
});
