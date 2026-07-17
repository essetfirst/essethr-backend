const router = require("express").Router();
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");
const NotificationCtrl = require("./notification.controller");

router.get("/inbox", NotificationCtrl.inbox);
router.post("/read-all", NotificationCtrl.markAllRead);
router.post(
  "/test-email",
  requirePermission(PERMISSIONS.SETTINGS_WRITE),
  NotificationCtrl.testEmail,
);
router.patch("/:id/read", NotificationCtrl.markRead);

module.exports = router;
