const router = require("express").Router();

const LeaveCtrl = require("../controllers/leave.controller");

router.route("/").get(LeaveCtrl.apiGetLeaves).post(LeaveCtrl.apiAddLeave);
router.route("/approve").put(LeaveCtrl.apiApproveLeaves);

router.route("/allowances").get(LeaveCtrl.apiGetAllowances);
router.route("/allowances/allocate").post(LeaveCtrl.apiAllocateAllowance);
router.route("/allowances/use").post(LeaveCtrl.apiUseAllowance);

router.route("/report").get(LeaveCtrl.apiGetReport);

router
  .route("/:id")
  .get(LeaveCtrl.apiGetLeaveById)
  .put(LeaveCtrl.apiUpdateLeave)
  .delete(LeaveCtrl.apiDeleteLeave);
router.route("/export/:org").get(LeaveCtrl.apiExportLeaves)

module.exports = router;
