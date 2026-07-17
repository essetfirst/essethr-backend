const router = require("express").Router();
const Ctrl = require("./announcement.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get("/", requirePermission([PERMISSIONS.ANNOUNCEMENTS_READ, PERMISSIONS.ESS_ACCESS], { mode: "any" }), Ctrl.list);
router.post("/", requirePermission(PERMISSIONS.ANNOUNCEMENTS_WRITE), Ctrl.create);
router.put("/:id", requirePermission(PERMISSIONS.ANNOUNCEMENTS_WRITE), Ctrl.update);
router.delete("/:id", requirePermission(PERMISSIONS.ANNOUNCEMENTS_WRITE), Ctrl.remove);

module.exports = router;
