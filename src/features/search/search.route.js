const router = require("express").Router();
const Ctrl = require("./search.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router.get(
  "/",
  requirePermission(
    [PERMISSIONS.EMPLOYEES_READ, PERMISSIONS.ESS_ACCESS],
    { mode: "any" },
  ),
  Ctrl.global,
);

module.exports = router;
