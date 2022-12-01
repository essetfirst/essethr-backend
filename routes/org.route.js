const router = require("express").Router();

const OrgCtrl = require("../controllers/org.controller");
const DepartmentCtrl = require("../controllers/department.controller");
const PositionCtrl = require("../controllers/position.controller");
const LeaveTypeCtrl = require("../controllers/leaveType.controller");
const HolidayCtrl = require("../controllers/holiday.controller");

router.route("/").get(OrgCtrl.apiGetOrgs).post(OrgCtrl.apiCreateOrg);

router
  .route("/:id")
  .get(OrgCtrl.apiGetOrgById)
  .put(OrgCtrl.apiUpdateOrg)
  .delete(OrgCtrl.apiDeleteOrg);

// router
//   .route("/:id/leave-types")
//   .get(OrgCtrl.apiGetLeaveTypes)
//   .post(OrgCtrl.apiAddLeaveType)
//   .patch(OrgCtrl.apiUpdateLeaveType);

router
  .route("/:id/attendance-policy")
  .get(OrgCtrl.apiGetAttendancePolicy)
  .put(OrgCtrl.apiUpdateAttendancePolicy);

router
  .route("/:id/reset-attendance-policy")
  .post(OrgCtrl.apiResetAttendancePolicy);

router
  .route("/:org/departments")
  .get(DepartmentCtrl.apiGetDepartments)
  .post(DepartmentCtrl.apiCreateDepartment);
router
  .route("/:org/departments/:id")
  .get(DepartmentCtrl.apiGetDepartmentById)
  .put(DepartmentCtrl.apiUpdateDepartment)
  .delete(DepartmentCtrl.apiDeleteDepartment);

router
  .route("/:org/positions")
  .get(PositionCtrl.apiGetPositions)
  .post(PositionCtrl.apiCreatePosition);
router
  .route("/:org/positions/:id")
  .get(PositionCtrl.apiGetPositionById)
  .put(PositionCtrl.apiUpdatePosition)
  .delete(PositionCtrl.apiDeletePosition);

router
  .route("/:org/leave-types")
  .get(LeaveTypeCtrl.apiGetLeaveTypes)
  .post(LeaveTypeCtrl.apiAddLeaveType);

router
  .route("/:org/leave-types/:id")
  .get(LeaveTypeCtrl.apiGetLeaveTypeById)
  .put(LeaveTypeCtrl.apiUpdateLeaveType)
  .delete(LeaveTypeCtrl.apiDeleteLeaveType);


router
.route("/:org/holidays")
.get(HolidayCtrl.apiGetHolidays)
.post(HolidayCtrl.apiAddHoliday);

router
.route("/:org/leave-types/:id")
.get(HolidayCtrl.apiGetHolidayById)
.put(HolidayCtrl.apiUpdateHoliday)
.delete(HolidayCtrl.apiDeleteHoliday)

module.exports = router;
