const router = require("express").Router();
const Ctrl = require("./offboarding.controller");
const requirePermission = require("../../middlewares/requirePermission");
const validate = require("../../middlewares/validate");
const { PERMISSIONS } = require("../../constants/permissions");
const {
  createOffboardingTemplateSchema,
  startOffboardingSchema,
  completeTaskParamsSchema,
} = require("./offboarding.schema");

router.get(
  "/templates",
  requirePermission(PERMISSIONS.OFFBOARDING_READ),
  Ctrl.listTemplates,
);
router.post(
  "/templates",
  requirePermission(PERMISSIONS.OFFBOARDING_WRITE),
  validate(createOffboardingTemplateSchema),
  Ctrl.createTemplate,
);
router.get(
  "/instances",
  requirePermission([PERMISSIONS.OFFBOARDING_READ, PERMISSIONS.ESS_ACCESS], { mode: "any" }),
  Ctrl.listInstances,
);
router.post(
  "/instances",
  requirePermission(PERMISSIONS.OFFBOARDING_WRITE),
  validate(startOffboardingSchema),
  Ctrl.start,
);
router.post(
  "/instances/:id/tasks/:taskId/complete",
  requirePermission([PERMISSIONS.OFFBOARDING_WRITE, PERMISSIONS.ESS_ACCESS], { mode: "any" }),
  validate(completeTaskParamsSchema, { source: "params" }),
  Ctrl.completeTask,
);

module.exports = router;
