const router = require("express").Router();
const requirePermission = require("../../middlewares/requirePermission");
const validate = require("../../middlewares/validate");
const { PERMISSIONS } = require("../../constants/permissions");
const LeaveCtrl = require("./leave.controller");
const {
  createLeaveSchema,
  approveLeavesSchema,
  rejectLeavesSchema,
  leaveIdParamSchema,
} = require("./leave.schema");

router
  .route("/")
  .get(requirePermission(PERMISSIONS.LEAVES_READ), LeaveCtrl.apiGetLeaves)
  .post(
    requirePermission(PERMISSIONS.LEAVES_WRITE),
    validate(createLeaveSchema),
    LeaveCtrl.apiAddLeave,
  );

router
  .route("/approve")
  .put(
    requirePermission(PERMISSIONS.LEAVES_APPROVE),
    validate(approveLeavesSchema),
    LeaveCtrl.apiApproveLeaves,
  );

router
  .route("/reject")
  .put(
    requirePermission(PERMISSIONS.LEAVES_APPROVE),
    validate(rejectLeavesSchema),
    LeaveCtrl.apiRejectLeaves,
  );

router
  .route("/allowances")
  .get(requirePermission(PERMISSIONS.LEAVES_READ), LeaveCtrl.apiGetAllowances);

router
  .route("/allowances/allocate")
  .post(requirePermission(PERMISSIONS.LEAVES_WRITE), LeaveCtrl.apiAllocateAllowance);

router
  .route("/allowances/use")
  .post(requirePermission(PERMISSIONS.LEAVES_WRITE), LeaveCtrl.apiUseAllowance);

router
  .route("/report")
  .get(requirePermission(PERMISSIONS.LEAVES_READ), LeaveCtrl.apiGetReport);

router
  .route("/:id")
  .get(
    requirePermission(PERMISSIONS.LEAVES_READ),
    validate(leaveIdParamSchema, { source: "params" }),
    LeaveCtrl.apiGetLeaveById,
  )
  .put(
    requirePermission(PERMISSIONS.LEAVES_WRITE),
    validate(leaveIdParamSchema, { source: "params" }),
    LeaveCtrl.apiUpdateLeave,
  )
  .delete(
    requirePermission(PERMISSIONS.LEAVES_WRITE),
    validate(leaveIdParamSchema, { source: "params" }),
    LeaveCtrl.apiDeleteLeave,
  );

router
  .route("/export/:org")
  .get(requirePermission(PERMISSIONS.LEAVES_READ), LeaveCtrl.apiExportLeaves);

module.exports = router;
