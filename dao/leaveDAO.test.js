const { MongoClient } = require("mongodb");
const { LeaveDAO } = require("./leaveDAO");

describe("LeaveDAO test suites", () => {
  let client;
  beforeAll(async () => {
    client = new MongoClient("mongodb://localhost/payrollex", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("payrollex");
    await LeaveDAO.injectDB(db);
  });
  afterAll(() => client && client.close());

  describe("", () => {
    it("generates nice report", async () => {
      const report = await LeaveDAO.getReport({
        from: "01-01-2020",
        to: "01-01-2022",
      });

      console.dir(report);

      expect(report).toBeDefined();
      expect(typeof report).toBe("object");
    });
  });
});
