const router = require("express").Router();
const AuditController = require("./audit.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router
  .route("/")
  .get(requirePermission(PERMISSIONS.AUDIT_READ), AuditController.apiGetAuditLogs);

module.exports = router;
