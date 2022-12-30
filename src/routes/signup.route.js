const router = require("express").Router();

const SignupCtrl = require("../controllers/signup.controller");
router.route("/signup").post(SignupCtrl.signup);
router.route("/verify/:token").post(SignupCtrl.verify);

module.exports = router;
