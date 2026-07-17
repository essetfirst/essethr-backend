const DepartmentDAO = require("./departmentDAO");
const OrgDAO = require("./orgDAO");
const { buildOrgInfo } = require("../../test/fixtures");
const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

describe("DepartmentDAO", () => {
  let orgId;

  beforeAll(async () => {
    const org = await OrgDAO.createOrg({
      ...buildOrgInfo(),
      attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
      createdBy: "integration@test.local",
    });
    orgId = String(org.insertedId);
  });

  it("create department when test fixtures use org-scoped collections", async () => {
    const result = await DepartmentDAO.create({
      name: `Engineering ${Date.now()}`,
      org: orgId,
      location: "HQ",
    });

    expect(result.error).toBeUndefined();
    expect(result.insertedId).toBeDefined();
  });
});
