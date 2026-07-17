const router = require("express").Router();
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

const OrgCtrl = require("./org.controller");
const DepartmentCtrl = require("./department.controller");
const PositionCtrl = require("./position.controller");
const LeaveTypeCtrl = require("../leaves/leaveType.controller");
const HolidayCtrl = require("../leaves/holiday.controller");
const roleRoutes = require("../rbac/role.route");
const settingsRoutes = require("../settings/settings.route");

router
  .route("/branches")
  .get(requirePermission(PERMISSIONS.ORG_READ), OrgCtrl.apiGetBranches);

router
  .route("/")
  .get(requirePermission(PERMISSIONS.ORG_READ), OrgCtrl.apiGetOrgs)
  .post(requirePermission(PERMISSIONS.ORG_ADMIN), OrgCtrl.apiCreateOrg);

router
  .route("/:org/departments")
  .get(requirePermission(PERMISSIONS.ORG_READ), DepartmentCtrl.apiGetDepartments)
  .post(requirePermission(PERMISSIONS.ORG_WRITE), DepartmentCtrl.apiCreateDepartment);

router
  .route("/:org/departments/:id")
  .get(requirePermission(PERMISSIONS.ORG_READ), DepartmentCtrl.apiGetDepartmentById)
  .put(requirePermission(PERMISSIONS.ORG_WRITE), DepartmentCtrl.apiUpdateDepartment)
  .delete(requirePermission(PERMISSIONS.ORG_WRITE), DepartmentCtrl.apiDeleteDepartment);

router
  .route("/:org/positions")
  .get(requirePermission(PERMISSIONS.ORG_READ), PositionCtrl.apiGetPositions)
  .post(requirePermission(PERMISSIONS.ORG_WRITE), PositionCtrl.apiCreatePosition);

router
  .route("/:org/positions/:id")
  .get(requirePermission(PERMISSIONS.ORG_READ), PositionCtrl.apiGetPositionById)
  .put(requirePermission(PERMISSIONS.ORG_WRITE), PositionCtrl.apiUpdatePosition)
  .delete(requirePermission(PERMISSIONS.ORG_WRITE), PositionCtrl.apiDeletePosition);

router
  .route("/:org/leave-types")
  .get(requirePermission(PERMISSIONS.ORG_READ), LeaveTypeCtrl.apiGetLeaveTypes)
  .post(requirePermission(PERMISSIONS.ORG_WRITE), LeaveTypeCtrl.apiAddLeaveType);

router
  .route("/:org/leave-types/:id")
  .get(requirePermission(PERMISSIONS.ORG_READ), LeaveTypeCtrl.apiGetLeaveTypeById)
  .put(requirePermission(PERMISSIONS.ORG_WRITE), LeaveTypeCtrl.apiUpdateLeaveType)
  .delete(requirePermission(PERMISSIONS.ORG_WRITE), LeaveTypeCtrl.apiDeleteLeaveType);

router
  .route("/:org/holidays")
  .get(requirePermission(PERMISSIONS.ORG_READ), HolidayCtrl.apiGetHolidays)
  .post(requirePermission(PERMISSIONS.ORG_WRITE), HolidayCtrl.apiAddHoliday);

router
  .route("/:org/holidays/:id")
  .get(requirePermission(PERMISSIONS.ORG_READ), HolidayCtrl.apiGetHolidayById)
  .put(requirePermission(PERMISSIONS.ORG_WRITE), HolidayCtrl.apiUpdateHoliday)
  .delete(requirePermission(PERMISSIONS.ORG_WRITE), HolidayCtrl.apiDeleteHoliday);

router.use("/:org/roles", roleRoutes);
router.use("/:org/settings", settingsRoutes);

router
  .route("/:id/attendance-policy")
  .get(requirePermission(PERMISSIONS.ORG_READ), OrgCtrl.apiGetAttendancePolicy)
  .put(requirePermission(PERMISSIONS.ORG_WRITE), OrgCtrl.apiUpdateAttendancePolicy);

router
  .route("/:id/reset-attendance-policy")
  .post(requirePermission(PERMISSIONS.ORG_ADMIN), OrgCtrl.apiResetAttendancePolicy);

router
  .route("/:id")
  .get(requirePermission(PERMISSIONS.ORG_READ), OrgCtrl.apiGetOrgById)
  .put(requirePermission(PERMISSIONS.ORG_WRITE), OrgCtrl.apiUpdateOrg)
  .delete(requirePermission(PERMISSIONS.ORG_ADMIN), OrgCtrl.apiDeleteOrg);

module.exports = router;
