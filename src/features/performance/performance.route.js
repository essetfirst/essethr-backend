const router = require("express").Router();
const Ctrl = require("./performance.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get(
  "/goals",
  requirePermission([PERMISSIONS.PERFORMANCE_READ, PERMISSIONS.ESS_ACCESS], { mode: "any" }),
  Ctrl.listGoals,
);
router.post("/goals", requirePermission(PERMISSIONS.PERFORMANCE_WRITE), Ctrl.createGoal);
router.put("/goals/:id", requirePermission(PERMISSIONS.PERFORMANCE_WRITE), Ctrl.updateGoal);

router.get(
  "/reviews",
  requirePermission([PERMISSIONS.PERFORMANCE_READ, PERMISSIONS.ESS_ACCESS], { mode: "any" }),
  Ctrl.listReviews,
);
router.post(
  "/reviews",
  requirePermission([PERMISSIONS.PERFORMANCE_WRITE, PERMISSIONS.ESS_ACCESS], { mode: "any" }),
  Ctrl.createReview,
);
router.put(
  "/reviews/:id",
  requirePermission([PERMISSIONS.PERFORMANCE_WRITE, PERMISSIONS.ESS_ACCESS], { mode: "any" }),
  Ctrl.updateReview,
);
router.post(
  "/reviews/:id/submit",
  requirePermission([PERMISSIONS.PERFORMANCE_WRITE, PERMISSIONS.ESS_ACCESS], { mode: "any" }),
  Ctrl.submitReview,
);
router.post(
  "/reviews/:id/complete",
  requirePermission(PERMISSIONS.PERFORMANCE_WRITE),
  Ctrl.completeReview,
);

module.exports = router;
