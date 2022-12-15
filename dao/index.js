const { MongoClient } = require("mongodb");
const { devMongodbURI, prodMongodbURI, dbName } = require("../config").db;

const UserDAO = require("./userDAO");
const OrgDAO = require("./orgDAO");
const DepartmentDAO = require("./departmentDAO");
const PositionDAO = require("./positionDAO");
const LeaveTypeDAO = require("./leaveTypeDAO");
const HolidayDAO = require("./holidayDAO");
const EmployeeDAO = require("./employeeDAO");
const AttendanceDAO = require("./attendanceDAO");
const { LeaveDAO, LeaveAllowanceDAO } = require("./leaveDAO");
const PayrollDateDAO = require("./payrollDateDAO");
const PayrollDAO = require("./payrollDAO");
const PayslipDAO = require("./payslipDAO");
const TimesheetDAO = require("./timesheetDAO");

const ROLES = ["employee", "manager", "admin"];

let client;

async function startDb() {
  client = new MongoClient(
    devMongodbURI,
    // process.env.NODE_ENV !== "production" ? devMongodbURI : prodMongodbURI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  await client.connect();

  const db = client.db(dbName);

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
