const { Router } = require("express");

const AttendanceCtrl = require("../controllers/attendance.controller");
const { importAttendance } = require("../middlewares/fileUpload")
const router = Router();

router.route("/").get(AttendanceCtrl.apiGetAttendances);
router.route("/all").get(AttendanceCtrl.apiGetAllAttendances);

router.route("/today").get(AttendanceCtrl.apiGetTodayAttendance);

router.route("/swipe").post(AttendanceCtrl.apiSwipe);
router.route("/checkin").post(AttendanceCtrl.apiCheckin);
router.route("/checkout").post(AttendanceCtrl.apiCheckout);
router.route("/approve-attendance").put(AttendanceCtrl.apiApproveAttendance);
router.route("/update-attendance").put(AttendanceCtrl.apiUpdateAttendance);
router.route("/report").get(AttendanceCtrl.apiGetReport);
router.route("/daily-report").get(AttendanceCtrl.apiGetDailyReport);

router.route("/").delete(AttendanceCtrl.apiDeleteAttendance);
router.route("/:id").delete(AttendanceCtrl.apiDeleteAttendance);
router.route("/import").get(importAttendance,AttendanceCtrl.apiImportAttendace);
router.route("/export").get(AttendanceCtrl.apiExportAttendace);
module.exports = router;
