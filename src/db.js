const { MongoClient } = require("mongodb");
const { mongodbURI, dbName } = require("./config").db;

const { connectMongoose } = require("./lib/mongoose");
const UserDAO = require("./features/users/userDAO");
const OrgDAO = require("./features/org/orgDAO");
const DepartmentDAO = require("./features/org/departmentDAO");
const PositionDAO = require("./features/org/positionDAO");
const LeaveTypeDAO = require("./features/leaves/leaveTypeDAO");
const HolidayDAO = require("./features/leaves/holidayDAO");
const EmployeeDAO = require("./features/employees/employeeDAO");
const AttendanceDAO = require("./features/attendance/attendanceDAO");
const { LeaveDAO, LeaveAllowanceDAO } = require("./features/leaves/leaveDAO");
const PayrollDateDAO = require("./features/payroll/payrollDateDAO");
const PayrollDAO = require("./features/payroll/payrollDAO");
const PayslipDAO = require("./features/payroll/payslipDAO");
const TimesheetDAO = require("./features/attendance/timesheetDAO");
const RoleDAO = require("./features/rbac/roleDAO");
const AuditDAO = require("./features/audit/auditDAO");
const SettingsDAO = require("./features/settings/settingsDAO");
const { DocumentDAO } = require("./features/documents/documentDAO");
const AnnouncementDAO = require("./features/announcements/announcementDAO");
const ShiftDAO = require("./features/shifts/shiftDAO");
const WorkflowDAO = require("./features/workflows/workflowDAO");
const RecruitmentDAO = require("./features/recruitment/recruitmentDAO");
const OnboardingDAO = require("./features/onboarding/onboardingDAO");
const OffboardingDAO = require("./features/offboarding/offboardingDAO");
const ReportScheduleDAO = require("./features/reports/reportScheduleDAO");
const BenefitsDAO = require("./features/benefits/benefitsDAO");
const ExpensesDAO = require("./features/expenses/expensesDAO");
const PerformanceDAO = require("./features/performance/performanceDAO");
const TrainingDAO = require("./features/training/trainingDAO");
const NotificationDAO = require("./features/notifications/notificationDAO");
const AnalyticsViewDAO = require("./features/analytics/analyticsViewDAO");

const ROLES = ["employee", "manager", "admin"];

let client;

async function startDb() {
  client = new MongoClient(
    mongodbURI,
    // process.env.NODE_ENV !== "production" ? devMongodbURI : mongodbURI,
    {
    }
  );

  await client.connect();

  const db = client.db(dbName);

  if (process.env.USE_MONGOOSE_USERS === "true") {
    await connectMongoose();
  }

  await OrgDAO.injectDB(db);
  await DepartmentDAO.injectDB(db);
  await PositionDAO.injectDB(db);
  await LeaveTypeDAO.injectDB(db);
  await HolidayDAO.injectDB(db);
  await EmployeeDAO.injectDB(db);
  await AttendanceDAO.injectDB(db);
  await LeaveDAO.injectDB(db);
  await LeaveAllowanceDAO.injectDB(db);
  await PayrollDateDAO.injectDB(db);
  await PayrollDAO.injectDB(db);

  await PayslipDAO.injectDB(db);
  await TimesheetDAO.injectDB(db);
  await UserDAO.injectDB(db);
  await RoleDAO.injectDB(db);
  await AuditDAO.injectDB(db);
  await SettingsDAO.injectDB(db);
  await DocumentDAO.injectDB(db);
  await AnnouncementDAO.injectDB(db);
  await ShiftDAO.injectDB(db);
  await WorkflowDAO.injectDB(db);
  await RecruitmentDAO.injectDB(db);
  await OnboardingDAO.injectDB(db);
  await OffboardingDAO.injectDB(db);
  await ReportScheduleDAO.injectDB(db);
  await BenefitsDAO.injectDB(db);
  await ExpensesDAO.injectDB(db);
  await PerformanceDAO.injectDB(db);
  await TrainingDAO.injectDB(db);
  await NotificationDAO.injectDB(db);
  await AnalyticsViewDAO.injectDB(db);
}

async function closeDb() {
  await client.close();
}

// const DAOS = {
//   user: UserDAO,
//   org: OrgDAO,
//   department: DepartmentDAO,
//   position: PositionDAO,
//   employee: EmployeeDAO,
//   attendance: AttendanceDAO,
//   leaveAllowance: LeaveAllowanceDAO,
//   leave: LeaveDAO,
//   payrollDate: PayrollDateDAO,
//   payroll: PayrollDAO,
//   timehsheet: TimesheetDAO,
// };

module.exports = {
  startDb,
  closeDb,

  OrgDAO,
  DepartmentDAO,
  PositionDAO,
  LeaveTypeDAO,
  HolidayDAO,
  EmployeeDAO,
  AttendanceDAO,
  TimesheetDAO,
  LeaveAllowanceDAO,
  LeaveDAO,
  PayrollDateDAO,
  PayrollDAO,
  UserDAO,

  // DAOS,
  ROLES,
};
