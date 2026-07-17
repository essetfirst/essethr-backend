const { normalizeRoleKey } = require("../constants/systemRoles");

/**
 * Legacy role guard — prefer requirePermission for new code.
 */
const authorize = (role) => (req, res, next) => {
  const roles = Array.isArray(role) ? role : [role];
  const userRole = normalizeRoleKey(req.user?.role);

  if (!req.user) {
    return res.status(401).json({ success: false, error: "Authentication required." });
  }

  const normalizedAllowed = roles.map((r) => normalizeRoleKey(r));
  if (!normalizedAllowed.includes(userRole)) {
    return res.status(403).json({
      success: false,
      error: "You do not have the required privilege.",
    });
  }

  next();
};

module.exports = authorize;
