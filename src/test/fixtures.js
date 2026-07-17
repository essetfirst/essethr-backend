const { ObjectId } = require("mongodb");

const TEST_ORG_ID = new ObjectId().toString();

function buildOrgInfo(overrides = {}) {
  return {
    name: `Test Org ${Date.now()}`,
    phone: "0911000000",
    address: "Addis Ababa",
    slug: `test-org-${Date.now()}`,
    ...overrides,
  };
}

function buildEmployeeInfo(orgId, overrides = {}) {
  return {
    org: orgId,
    orgId,
    firstName: "Test",
    lastName: "Employee",
    email: `employee-${Date.now()}@test.local`,
    phone: "0911223344",
    status: "ACTIVE",
    ...overrides,
  };
}

function buildPayrollDateInfo(employeeId, date, overrides = {}) {
  return {
    employeeId,
    date,
    attendanceHours: 8,
    leaveHours: 0,
    holidayHours: 0,
    overtimeHours: 0,
    orgId: TEST_ORG_ID,
    ...overrides,
  };
}

module.exports = {
  TEST_ORG_ID,
  buildOrgInfo,
  buildEmployeeInfo,
  buildPayrollDateInfo,
};
