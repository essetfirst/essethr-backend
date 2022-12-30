const { MongoClient } = require("mongodb");
const AttendanceDAO = require("./attendanceDAO");
const { prodMongodbURI } = require("../config").db;
const { computePayableHours } = require("../lib/computePayableHours");

describe("AttendanceDAO test suites", () => {
  let client;
  beforeAll(async () => {
    client = new MongoClient(prodMongodbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("payrollex");
    await AttendanceDAO.injectDB(db);
  });
  afterAll(() => client && client.close());

  describe("Swipe in", () => {
    beforeAll(async () => await AttendanceDAO.deleteAllAttendance());
    // test("employee ID swipe", async () => {
    //   const result = await AttendanceDAO.swipe({
    //     employeeId: 1,
    //     time: Date.now(),
    //   });

    //   console.dir(result);

    //   expect(result).toBeDefined();
    //   expect(result.error).toBeDefined();
    // });
    test("workedHours and overtime compute", async () => {
      const result = await AttendanceDAO.getAttendances({
        from: "2021-10-11",
        to: "2021-10-17",
      });

      console.dir(result);

      // Object.values(result).forEach(
      //   ({ checkin, checkout, breakin, breakout }) => {
      //     const cph = computePayableHours(
      //       { checkin, checkout, breakin, breakout },
      //       DEFAULT_ATTENDANCE_POLICY["wednesday"].workHours
      //     );
      //     console.log(cph);
      //   }
      // );

      expect(result).toBeDefined();
      expect(result.error).not().toBeDefined();
    });
  });

  // describe("Check in", () => {
  //   beforeAll(async () => await AttendanceDAO.deleteAllAttendance());
  //   it("employee checks in", async () => {
  //     const result = await AttendanceDAO.checkin({
  //       employeeId: 1,
  //       time: Date.now(),
  //     });

  //     expect(result).toBeDefined();
  //     expect(result.message).toBeDefined();
  //   });
  // });

  // describe("Check out", () => {
  //   it("employee checks out", async () => {
  //     const result = await AttendanceDAO.checkout({
  //       employeeId: 1,
  //       time: Date.now() + 4.5 * 360000,
  //     });

  //     expect(result).toBeDefined();
  //     expect(result.message).toBeDefined();
  //   });
  // });

  // describe("Get attendances", () => {
  //   it("fetches all attendance", async () => {
  //     const result = await AttendanceDAO.getAttendances({
  //       employees: [1],
  //     });

  //     console.log(result);

  //     expect(result).toBeDefined();
  //     expect(Array.isArray(result)).toBe(true);
  //   });
  // });

  // describe("Get attendance report", () => {
  //   it("generates fine report", async () => {
  //     const result = await AttendanceDAO.getReport({
  //       from: "01-01-2021",
  //       to: "10-10-2021",
  //     });

  //     console.dir(result);

  //     expect(result).toBeDefined();
  //     expect(typeof result).toBe("object");
  //   });
  // });
});
