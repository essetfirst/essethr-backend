const RoleDAO = require("./roleDAO");
const {
  normalizeRoleKey,
  getPermissionsForRole,
  roleHasPermission,
  canAccessDepartment,
} = require("../../constants/systemRoles");

/**
 * Resolve effective permissions for a user.
 * System role permissions + optional org custom role + user permission overrides.
 */
async function resolveUserPermissions(user) {
  if (!user) return [];

  const base = getPermissionsForRole(user.role);
  const extras = Array.isArray(user.permissions) ? user.permissions : [];
  let fromCustomRole = [];

  if (user.customRoleId) {
    const customRole = await RoleDAO.getRoleById(user.customRoleId);
    if (customRole?.permissions?.length) {
      fromCustomRole = customRole.permissions;
    }
  }

  return [...new Set([...base, ...fromCustomRole, ...extras])];
}

function userHasPermission(userPermissions, permission) {
  if (!permission) return true;
  if (!Array.isArray(userPermissions)) return false;
  return userPermissions.includes(permission);
}

function userHasAnyPermission(userPermissions, permissions = []) {
  if (!permissions.length) return true;
  return permissions.some((p) => userHasPermission(userPermissions, p));
}

module.exports = {
  normalizeRoleKey,
  getPermissionsForRole,
  roleHasPermission,
  canAccessDepartment,
  resolveUserPermissions,
  userHasPermission,
  userHasAnyPermission,
};
