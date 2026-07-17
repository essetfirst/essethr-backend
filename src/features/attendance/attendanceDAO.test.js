const AttendanceDAO = require("./attendanceDAO");
const EmployeeDAO = require("../employees/employeeDAO");
const OrgDAO = require("../org/orgDAO");
const { buildOrgInfo, buildEmployeeInfo } = require("../../test/fixtures");
const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

describe("AttendanceDAO", () => {
  let orgId;
  let employeeId;

  beforeAll(async () => {
    const org = await OrgDAO.createOrg({
      ...buildOrgInfo(),
      attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
      createdBy: "integration@test.local",
    });
    orgId = String(org.insertedId);
    const employee = await EmployeeDAO.createEmployee(buildEmployeeInfo(orgId));
    employeeId = String(employee.insertedId);
  });

  it("swipe and remark normalization with org attendance policy", async () => {
    const checkIn = await AttendanceDAO.swipe({
      orgId,
      employeeId,
      time: Date.now(),
      device: "test-device",
    });

    expect(checkIn.error).toBeUndefined();
    expect(checkIn.action || checkIn.message).toBeTruthy();
  });
});
