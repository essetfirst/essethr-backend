const { Router } = require("express");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");
const AttendanceCtrl = require("./attendance.controller");
const { importAttendance } = require("../../middlewares/fileUpload");
const { assertUploadedFile } = require("../../lib/uploadValidation");

const router = Router();

router
  .route("/")
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), AttendanceCtrl.apiGetAttendances)
  .delete(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), AttendanceCtrl.apiDeleteAttendance);

router
  .route("/all")
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), AttendanceCtrl.apiGetAllAttendances);

router
  .route("/today")
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), AttendanceCtrl.apiGetTodayAttendance);

router
  .route("/swipe")
  .post(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), AttendanceCtrl.apiSwipe);

router
  .route("/checkin")
  .post(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), AttendanceCtrl.apiCheckin);

router
  .route("/checkout")
  .post(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), AttendanceCtrl.apiCheckout);

router
  .route("/approve-attendance")
  .put(requirePermission(PERMISSIONS.ATTENDANCE_APPROVE), AttendanceCtrl.apiApproveAttendance);

router
  .route("/update-attendance")
  .put(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), AttendanceCtrl.apiUpdateAttendance);

router
  .route("/report")
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), AttendanceCtrl.apiGetReport);

router
  .route("/daily-report")
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), AttendanceCtrl.apiGetDailyReport);

router
  .route("/import")
  .post(
    requirePermission(PERMISSIONS.ATTENDANCE_WRITE),
    importAttendance,
    assertUploadedFile({ allowedKinds: ["xlsx", "zip"] }),
    AttendanceCtrl.apiImportAttendace,
  );

router
  .route("/export")
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), AttendanceCtrl.apiExportAttendace);

router
  .route("/:id")
  .delete(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), AttendanceCtrl.apiDeleteAttendance);

module.exports = router;
