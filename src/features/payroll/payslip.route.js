const router = require("express").Router();
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");
const PayslipCtrl = require("./payslip.controller");

router
  .route("/:id")
  .get(requirePermission(PERMISSIONS.PAYROLL_READ), PayslipCtrl.apiGetPayslipById);

module.exports = router;
