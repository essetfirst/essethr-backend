const { Router } = require("express");

const AttendanceCtrl = require("../controllers/attendance.controller");

const router = Router();

router.route("/").get(AttendanceCtrl.apiGetAttendances);

router.route("/swipe").post(AttendanceCtrl.apiSwipe);
router.route("/checkin").post(AttendanceCtrl.apiCheckin);
router.route("/checkout").post(AttendanceCtrl.apiCheckout);
router.route("/approve-attendance").put(AttendanceCtrl.apiApproveAttendance);
router.route("/update-attendance").put(AttendanceCtrl.apiUpdateAttendance);
router.route("/report").get(AttendanceCtrl.apiGetReport);

router.route("/").delete(AttendanceCtrl.apiDeleteAttendance);
router.route("/:id").delete(AttendanceCtrl.apiDeleteAttendance);

module.exports = router;
