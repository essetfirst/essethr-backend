const jwt = require("jsonwebtoken");
const UserService = require("../features/users/user.service");
const { jwtSecret } = require("../config").auth;
const { isAccessTokenBlacklisted } = require("../lib/tokenBlacklist");
const {
  resolveUserPermissions,
  normalizeRoleKey,
} = require("../features/rbac/permissions.service");

const authenticate = async (req, res, next) => {
  try {
    let token =
      (req.headers["authorization"] &&
        req.headers["authorization"].slice("Bearer ".length)) ||
      req.headers["x-access-token"];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Access token not provided." });
    }

    if (await isAccessTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: "Session has been revoked. Please sign in again.",
      });
    }

    let decoded;
    decoded = jwt.verify(token, jwtSecret);
    const id = decoded.id;
    const user = await UserService.getUserById(id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized access attempt." });
    }

    if (Array.isArray(user.tokens) && user.tokens.length > 0) {
      if (!user.tokens.includes(token)) {
        return res.status(401).json({
          success: false,
          error: "Session has been revoked. Please sign in again.",
        });
      }
    }

    req.user = user;
    req.token = token;
    req.org = user.org;
    req.user.role = normalizeRoleKey(user.role);
    req.permissions = await resolveUserPermissions(user);

    next();
  } catch (e) {
    console.error(`Error verifying token`);
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized access attempt." });
  }
};

module.exports = authenticate;
