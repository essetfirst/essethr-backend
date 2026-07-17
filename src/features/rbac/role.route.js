const router = require("express").Router({ mergeParams: true });
const RoleController = require("./role.controller");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router
  .route("/")
  .get(requirePermission(PERMISSIONS.ORG_READ), RoleController.apiGetRoles)
  .post(requirePermission(PERMISSIONS.ORG_ADMIN), RoleController.apiCreateRole);

router
  .route("/:roleId")
  .put(requirePermission(PERMISSIONS.ORG_ADMIN), RoleController.apiUpdateRole)
  .delete(requirePermission(PERMISSIONS.ORG_ADMIN), RoleController.apiDeleteRole);

router
  .route("/:roleId/assign-user")
  .post(requirePermission(PERMISSIONS.ORG_ADMIN), RoleController.apiAssignUser);

module.exports = router;
