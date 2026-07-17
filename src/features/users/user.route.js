const router = require("express").Router();

const UsersCtrl = require("./user.controller");

const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");
const { loginRateLimiter } = require("../../middlewares/rateLimiter");
const validate = require("../../middlewares/validate");
const { loginSchema, refreshTokenSchema } = require("./auth.schema");

router
  .route("/")
  .get(authenticate, requirePermission(PERMISSIONS.USERS_READ), UsersCtrl.apiGetUsers)
  .post(authenticate, UsersCtrl.apiCreateUser, UsersCtrl.apiCreateEmployeeUser);

router.route("/register").post(UsersCtrl.apiRegisterUser);
router.route("/signup").post(UsersCtrl.apiRegisterUser);
router.route("/login").post(loginRateLimiter, validate(loginSchema), UsersCtrl.apiLoginUser);
router.route("/signin").post(loginRateLimiter, validate(loginSchema), UsersCtrl.apiLoginUser);
router.route("/refresh").post(validate(refreshTokenSchema), UsersCtrl.apiRefreshToken);
router
  .route("/activate")
  .post(authenticate, authorize("ADMIN"), UsersCtrl.apiActivateUser);

router
  .route("/create-employee-user")
  .post(authenticate, UsersCtrl.apiCreateEmployeeUser);

router
  .route("/make-admin")
  .post(authenticate, authorize("ADMIN"), UsersCtrl.apiMakeAdminUser);

router.route("/logout").post(authenticate, UsersCtrl.apiLogoutUser);
router.route("/signout").post(authenticate, UsersCtrl.apiLogoutUser);

router
  .route("/:id")
  .get(authenticate, UsersCtrl.apiGetUserById)
  .put(authenticate, UsersCtrl.apiUpdateUser)
  .delete(authenticate, UsersCtrl.apiDeleteUser);

module.exports = router;
