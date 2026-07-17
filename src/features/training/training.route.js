const router = require("express").Router();
const Ctrl = require("./training.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get("/courses", requirePermission([PERMISSIONS.TRAINING_READ, PERMISSIONS.ESS_ACCESS], { mode: "any" }), Ctrl.listCourses);
router.post("/courses", requirePermission(PERMISSIONS.TRAINING_WRITE), Ctrl.createCourse);
router.get("/records", requirePermission([PERMISSIONS.TRAINING_READ, PERMISSIONS.ESS_ACCESS], { mode: "any" }), Ctrl.listRecords);
router.post("/records", requirePermission(PERMISSIONS.TRAINING_WRITE), Ctrl.assign);
router.put("/records/:id/progress", requirePermission([PERMISSIONS.TRAINING_WRITE, PERMISSIONS.ESS_ACCESS], { mode: "any" }), Ctrl.updateProgress);

module.exports = router;
