const router = require("express").Router();
const Ctrl = require("./reportSchedule.controller");
const requirePermission = require("../../middlewares/requirePermission");
const validate = require("../../middlewares/validate");
const { PERMISSIONS } = require("../../constants/permissions");
const { scheduleReportSchema } = require("./report.schema");
const { idParamSchema } = require("@essethr/shared/schemas/common");

router.get(
  "/schedules",
  requirePermission(PERMISSIONS.REPORTS_SCHEDULE),
  Ctrl.list,
);
router.post(
  "/schedules",
  requirePermission(PERMISSIONS.REPORTS_SCHEDULE),
  validate(scheduleReportSchema),
  Ctrl.create,
);
router.patch(
  "/schedules/:id",
  requirePermission(PERMISSIONS.REPORTS_SCHEDULE),
  validate(idParamSchema, { source: "params" }),
  Ctrl.toggle,
);
router.delete(
  "/schedules/:id",
  requirePermission(PERMISSIONS.REPORTS_SCHEDULE),
  validate(idParamSchema, { source: "params" }),
  Ctrl.remove,
);

module.exports = router;
