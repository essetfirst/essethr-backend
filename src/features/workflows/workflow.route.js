const router = require("express").Router();
const Ctrl = require("./workflow.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get("/templates", requirePermission(PERMISSIONS.WORKFLOWS_READ), Ctrl.listTemplates);
router.post("/templates", requirePermission(PERMISSIONS.WORKFLOWS_WRITE), Ctrl.createTemplate);
router.get("/requests", requirePermission([PERMISSIONS.WORKFLOWS_READ, PERMISSIONS.ESS_ACCESS], { mode: "any" }), Ctrl.listRequests);
router.post("/requests", requirePermission([PERMISSIONS.WORKFLOWS_WRITE, PERMISSIONS.ESS_ACCESS], { mode: "any" }), Ctrl.submit);
router.post("/requests/:id/approve", requirePermission(PERMISSIONS.WORKFLOWS_APPROVE), Ctrl.approve);
router.post("/requests/:id/reject", requirePermission(PERMISSIONS.WORKFLOWS_APPROVE), Ctrl.reject);

module.exports = router;
