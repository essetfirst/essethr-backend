const router = require("express").Router();

const UsersCtrl = require("../controllers/user.controller");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

router
  .route("/")
  .get(authenticate, UsersCtrl.apiGetUsers)
  .post(authenticate, UsersCtrl.apiCreateUser, UsersCtrl.apiCreateEmployeeUser);

router.route("/register").post(UsersCtrl.apiRegisterUser);
router.route("/signup").post(UsersCtrl.apiRegisterUser);
router.route("/login").post(UsersCtrl.apiLoginUser);
router.route("/signin").post(UsersCtrl.apiLoginUser);
router
  .route("/activate")
  .post(authenticate, authorize("ADMIN"), UsersCtrl.apiActivateUser);

router
  .route("/create-employee-user")
  .post(authenticate, UsersCtrl.apiCreateEmployeeUser);

router
  .route("/make-admin")
  .post(authenticate, authorize("ADMIN"), UsersCtrl.apiMakeAdminUser);

router.route("/logout").post(UsersCtrl.apiLogoutUser);
router.route("/signout").post(UsersCtrl.apiLogoutUser);

router
  .route("/:id")
  .get(authenticate, UsersCtrl.apiGetUserById)
  .put(authenticate, UsersCtrl.apiUpdateUser)
  .delete(authenticate, UsersCtrl.apiDeleteUser);

module.exports = router;
