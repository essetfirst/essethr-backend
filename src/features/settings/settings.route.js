const router = require("express").Router({ mergeParams: true });
const SettingsController = require("./settings.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router
  .route("/")
  .get(requirePermission(PERMISSIONS.SETTINGS_READ), SettingsController.apiGetSettings)
  .put(requirePermission(PERMISSIONS.SETTINGS_WRITE), SettingsController.apiUpdateSettings);

module.exports = router;
