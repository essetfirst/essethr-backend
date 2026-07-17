const router = require("express").Router();
const Ctrl = require("./recruitment.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get("/jobs", requirePermission(PERMISSIONS.RECRUITMENT_READ), Ctrl.listJobs);
router.post("/jobs", requirePermission(PERMISSIONS.RECRUITMENT_WRITE), Ctrl.createJob);
router.get("/candidates", requirePermission(PERMISSIONS.RECRUITMENT_READ), Ctrl.listCandidates);
router.post("/candidates", requirePermission(PERMISSIONS.RECRUITMENT_WRITE), Ctrl.createCandidate);
router.put("/candidates/:id/stage", requirePermission(PERMISSIONS.RECRUITMENT_WRITE), Ctrl.updateStage);
router.post("/candidates/:id/hire", requirePermission(PERMISSIONS.RECRUITMENT_WRITE), Ctrl.hireCandidate);
router.put("/candidates/:id", requirePermission(PERMISSIONS.RECRUITMENT_WRITE), Ctrl.updateCandidate);

module.exports = router;
