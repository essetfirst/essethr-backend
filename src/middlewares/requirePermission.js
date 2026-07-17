const {
  userHasPermission,
  userHasAnyPermission,
} = require("../features/rbac/permissions.service");

/**
 * Require one permission or any from a list.
 * Usage: requirePermission('employees:read') or requirePermission(['a','b'], { mode: 'any' })
 */
function requirePermission(permissionOrList, options = {}) {
  const permissions = Array.isArray(permissionOrList)
    ? permissionOrList
    : [permissionOrList];
  const mode = options.mode || "all";

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Authentication required." });
    }

    const userPerms = req.permissions || [];
    const allowed =
      mode === "any"
        ? userHasAnyPermission(userPerms, permissions)
        : permissions.every((p) => userHasPermission(userPerms, p));

    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to perform this action.",
        required: permissions,
      });
    }

    next();
  };
}

module.exports = requirePermission;
