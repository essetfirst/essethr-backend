const router = require("express").Router();
const Ctrl = require("./onboarding.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get("/templates", requirePermission(PERMISSIONS.ONBOARDING_READ), Ctrl.listTemplates);
router.post("/templates", requirePermission(PERMISSIONS.ONBOARDING_WRITE), Ctrl.createTemplate);
router.get("/instances", requirePermission([PERMISSIONS.ONBOARDING_READ, PERMISSIONS.ESS_ACCESS], { mode: "any" }), Ctrl.listInstances);
router.post("/instances", requirePermission(PERMISSIONS.ONBOARDING_WRITE), Ctrl.start);
router.post("/instances/:id/tasks/:taskId/complete", requirePermission([PERMISSIONS.ONBOARDING_WRITE, PERMISSIONS.ESS_ACCESS], { mode: "any" }), Ctrl.completeTask);

module.exports = router;
