const router = require("express").Router();
const Ctrl = require("./analytics.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get("/dashboard", requirePermission([PERMISSIONS.ANALYTICS_READ, PERMISSIONS.REPORTS_READ], { mode: "any" }), Ctrl.dashboard);
router.get("/operations", requirePermission([PERMISSIONS.REPORTS_READ, PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ESS_ACCESS], { mode: "any" }), Ctrl.operations);
router.get("/intelligence", requirePermission(PERMISSIONS.ANALYTICS_READ), Ctrl.intelligence);
router.get("/views", requirePermission(PERMISSIONS.ANALYTICS_READ), Ctrl.listViews);
router.post("/views", requirePermission(PERMISSIONS.ANALYTICS_READ), Ctrl.saveView);
router.delete("/views/:name", requirePermission(PERMISSIONS.ANALYTICS_READ), Ctrl.deleteView);

module.exports = router;
