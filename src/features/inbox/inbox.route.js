const router = require("express").Router();
const Ctrl = require("./inbox.controller");

router.get("/work-queue", Ctrl.workQueue);

module.exports = router;
