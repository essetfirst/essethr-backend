const router = require("express").Router();
const Ctrl = require("./ess.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get("/me", requirePermission(PERMISSIONS.ESS_ACCESS), Ctrl.getMe);
router.get("/payslips", requirePermission(PERMISSIONS.ESS_ACCESS), Ctrl.getPayslips);
router.get("/attendance", requirePermission(PERMISSIONS.ESS_ACCESS), Ctrl.getAttendance);
router.get("/leaves", requirePermission(PERMISSIONS.ESS_ACCESS), Ctrl.getLeaves);
router.get("/announcements", requirePermission(PERMISSIONS.ESS_ACCESS), Ctrl.getAnnouncements);
router.get("/approvals", requirePermission(PERMISSIONS.ESS_ACCESS), Ctrl.getApprovals);
router.get("/activity", requirePermission(PERMISSIONS.ESS_ACCESS), Ctrl.getActivity);
router.get("/documents", requirePermission(PERMISSIONS.ESS_ACCESS), Ctrl.getDocuments);
router.get("/onboarding", requirePermission(PERMISSIONS.ESS_ACCESS), Ctrl.getOnboarding);

module.exports = router;
