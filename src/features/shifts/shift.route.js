const router = require("express").Router();
const Ctrl = require("./shift.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get("/templates", requirePermission(PERMISSIONS.SHIFTS_READ), Ctrl.listTemplates);
router.post("/templates", requirePermission(PERMISSIONS.SHIFTS_WRITE), Ctrl.createTemplate);
router.get("/assignments", requirePermission(PERMISSIONS.SHIFTS_READ), Ctrl.listAssignments);
router.post("/assignments", requirePermission(PERMISSIONS.SHIFTS_WRITE), Ctrl.assign);
router.delete("/assignments/:id", requirePermission(PERMISSIONS.SHIFTS_WRITE), Ctrl.removeAssignment);

module.exports = router;
