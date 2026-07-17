const EmployeeDAO = require("./employeeDAO");
const OrgDAO = require("../org/orgDAO");
const { buildOrgInfo, buildEmployeeInfo } = require("../../test/fixtures");
const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

describe("EmployeeDAO", () => {
  let orgId;

  beforeAll(async () => {
    const org = await OrgDAO.createOrg({
      ...buildOrgInfo(),
      attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
      createdBy: "integration@test.local",
    });
    orgId = String(org.insertedId);
  });

  it("creates employee with valid org fixture", async () => {
    const result = await EmployeeDAO.createEmployee(buildEmployeeInfo(orgId));
    expect(result.error).toBeUndefined();
    expect(result.insertedId).toBeDefined();

    const listed = await EmployeeDAO.getEmployees({ org: orgId, page: 1, limit: 10 });
    expect(listed.items?.length).toBeGreaterThan(0);
    expect(listed.total).toBeGreaterThan(0);
  });
});
