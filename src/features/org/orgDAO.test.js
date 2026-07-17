const OrgDAO = require("./orgDAO");
const { buildOrgInfo } = require("../../test/fixtures");
const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

describe("OrgDAO", () => {
  it("registers new org with required fields", async () => {
    const orgInfo = buildOrgInfo();
    const result = await OrgDAO.createOrg({
      ...orgInfo,
      attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
      createdBy: "integration@test.local",
    });

    expect(result.error).toBeUndefined();
    expect(result.insertedId).toBeDefined();
    expect(result.org?.name).toBe(orgInfo.name);
  });
});
