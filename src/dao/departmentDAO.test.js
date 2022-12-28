const { MongoClient } = require("mongodb");
const DepartmentDAO = require("./departmentDAO");

describe("DepartmentDAO test suites", () => {
  let client;
  const uri = "mongodb://localhost";
  beforeAll(async () => {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = await client.db("payrollex");
    await DepartmentDAO.injectDB(db);
  });
  afterAll(() => client.close());

  describe("create department", () => {
    beforeEach(async () => await DepartmentDAO.deleteAll());

    it("creates new department", async () => {
      const departmentInfo = {
        slug: "engineering",
        name: "Engineering",
        parent: null,
        location: "Addis Ababa",
      };
      const result = await DepartmentDAO.create(departmentInfo);

      expect(result).toBeDefined();
      expect(result.insertedCount).toBeGreaterThan(0);
    });

    it("creates another department with valid parent", async () => {
      const anotherDeptInfo = {
        slug: "product-design",
        name: "Product Design",
        parent: "engineering",
        location: "Addis Ababa",
      };

      const result = await DepartmentDAO.create(anotherDeptInfo);

      expect(result).toBeDefined();
      expect(result.insertedCount).toBeGreaterThan(0);
    });
  });
});
