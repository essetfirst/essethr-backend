const { LeaveDAO } = require("./leaveDAO");
const OrgDAO = require("../org/orgDAO");
const { buildOrgInfo } = require("../../test/fixtures");
const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

describe("LeaveDAO", () => {
  let orgId;

  beforeAll(async () => {
    const org = await OrgDAO.createOrg({
      ...buildOrgInfo(),
      attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
      createdBy: "integration@test.local",
    });
    orgId = String(org.insertedId);
  });

  it("generates leave report with seeded fixtures", async () => {
    const report = await LeaveDAO.getReport({ org: orgId });
    expect(report?.error).toBeUndefined();
    expect(report).toBeDefined();
  });
});
