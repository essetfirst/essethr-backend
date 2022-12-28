const { Router } = require("express");

const PayrollCtrl = require("../controllers/payroll.controller");

const router = Router();

router
  .route("/")
  .get(PayrollCtrl.apiGetPayrolls)
  .post(PayrollCtrl.apiAddPayroll);

router.route("/generate").post(PayrollCtrl.apiGeneratePayroll);
router.route("/import").post(PayrollCtrl.apiImportPayrolls);
router.route("/get-payroll-hours").get(PayrollCtrl.apiGetPayrollHours);
router.route("/report").get(PayrollCtrl.apiGetReport);

router
  .route("/:id")
  .get(PayrollCtrl.apiGetPayrollById)
  .put(PayrollCtrl.apiUpdatePayroll)
  .delete(PayrollCtrl.apiDeletePayroll);

module.exports = router;
