const router = require("express").Router();

const HealthCtrl = require("../controllers/health.controller");
router.route("/up").get(HealthCtrl.up);

module.exports = router;
