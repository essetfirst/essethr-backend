const { MongoClient } = require("mongodb");
const OrgDAO = require("./orgDAO");

describe("OrgDAO test suites", () => {
  const uri = "mongodb://localhost";
  let client;
  beforeAll(async () => {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = await client.db("payrollex");
    await OrgDAO.injectDB(db);
  });
  afterAll(() => client.close());

  describe("create org", () => {
    it("registers new org", async () => {
      const orgInfo = {};
      const result = await OrgDAO.createOrg(orgInfo);

      expect(result).toBeDefined();
      expect(result.n).not.toBe(0);
    });
  });

  describe("update org", () => {
    it("updates org info", async () => {
      const orgInfo = {};
      const result = await OrgDAO.updateOrg(orgInfo);

      expect(result).toBeDefined();
      expect(result.nModified).not.toBe(0);
    });
  });
});
