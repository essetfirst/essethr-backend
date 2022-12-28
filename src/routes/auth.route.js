const router = require("express").Router();

const AuthCtrl = require("../controllers/auth.controller");
const authenticate = require("../middlewares/authenticate");

router.route("/signup").post(AuthCtrl.apiSignup);
router.route("/signin").post(AuthCtrl.apiSignin);
router.route("/signout").post(authenticate,AuthCtrl.apiSignout);

router.route("/register").post(AuthCtrl.apiRegister);
router.route("/activate/:token").post(AuthCtrl.apiActivate);
router.route("/login").post(AuthCtrl.apiLogin);
router.route("/me").get(authenticate,AuthCtrl.apiGetProfile);
router.route("/logout").post(authenticate,AuthCtrl.apiLogout);

module.exports = router;
