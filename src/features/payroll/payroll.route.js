const { Router } = require("express");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");
const PayrollCtrl = require("./payroll.controller");

const router = Router();

router
  .route("/")
  .get(requirePermission(PERMISSIONS.PAYROLL_READ), PayrollCtrl.apiGetPayrolls)
  .post(requirePermission(PERMISSIONS.PAYROLL_WRITE), PayrollCtrl.apiAddPayroll);

router
  .route("/generate")
  .post(requirePermission(PERMISSIONS.PAYROLL_GENERATE), PayrollCtrl.apiGeneratePayroll);

router
  .route("/import")
  .post(requirePermission(PERMISSIONS.PAYROLL_WRITE), PayrollCtrl.apiImportPayrolls);

router
  .route("/get-payroll-hours")
  .get(requirePermission(PERMISSIONS.PAYROLL_READ), PayrollCtrl.apiGetPayrollHours);

router
  .route("/report")
  .get(requirePermission(PERMISSIONS.PAYROLL_READ), PayrollCtrl.apiGetReport);

router
  .route("/:id/validate")
  .get(requirePermission(PERMISSIONS.PAYROLL_READ), PayrollCtrl.apiValidatePayroll);

router
  .route("/:id/comparison")
  .get(requirePermission(PERMISSIONS.PAYROLL_READ), PayrollCtrl.apiComparePayroll);

router
  .route("/:id/lock")
  .post(requirePermission(PERMISSIONS.PAYROLL_APPROVE), PayrollCtrl.apiLockPayroll);

router
  .route("/:id/finalize")
  .post(requirePermission(PERMISSIONS.PAYROLL_APPROVE), PayrollCtrl.apiFinalizePayroll);

router
  .route("/:id/adjustments")
  .post(requirePermission(PERMISSIONS.PAYROLL_WRITE), PayrollCtrl.apiAddAdjustment);

router
  .route("/:id")
  .get(requirePermission(PERMISSIONS.PAYROLL_READ), PayrollCtrl.apiGetPayrollById)
  .put(requirePermission(PERMISSIONS.PAYROLL_WRITE), PayrollCtrl.apiUpdatePayroll)
  .delete(requirePermission(PERMISSIONS.PAYROLL_WRITE), PayrollCtrl.apiDeletePayroll);

module.exports = router;
