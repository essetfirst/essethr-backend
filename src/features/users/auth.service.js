const bcrypt = require("bcryptjs");
const UserService = require("./user.service");
const { resolveUserPermissions, normalizeRoleKey } = require("../rbac/permissions.service");
const {
  issueAccessToken,
  issueRefreshToken,
  persistAccessToken,
} = require("../../lib/tokenService");
const {
  GENERIC_AUTH_ERROR,
  assertLoginAllowed,
  recordFailedLogin,
  recordSuccessfulLogin,
} = require("../../lib/authSecurity.service");
const logger = require("../../lib/logger");

class AuthService {
  /**
   * Authenticate user credentials and issue tokens.
   * @returns {Promise<{ success: true, user, permissions, token, refreshToken } | { success: false, status: number, message: string }>}
   */
  static async login(req, { email, password }) {
    const result = await UserService.getUser({ email });

    if (result && result.error) {
      const detail =
        result.server === true
          ? "Something went wrong"
          : String(result.error?.message || result.error || "Request failed");
      return { success: false, status: result.server ? 500 : 400, message: detail };
    }

    const user = result;
    if (!user) {
      await recordFailedLogin(req, { email, reason: "unknown_user" });
      return { success: false, status: 401, message: GENERIC_AUTH_ERROR };
    }

    const gate = await assertLoginAllowed(req, user, email);
    if (!gate.allowed) {
      return { success: false, status: gate.status, message: gate.message };
    }

    if (!user.password) {
      await recordFailedLogin(req, { email, userId: user._id, reason: "missing_password" });
      return { success: false, status: 401, message: GENERIC_AUTH_ERROR };
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      const attempt = await recordFailedLogin(req, {
        email,
        userId: user._id,
        reason: "invalid_credentials",
      });
      if (attempt.locked) {
        return {
          success: false,
          status: 429,
          message: "Account temporarily locked due to repeated failed attempts. Try again later.",
        };
      }
      return { success: false, status: 401, message: GENERIC_AUTH_ERROR };
    }

    const accessToken = issueAccessToken(user._id);
    const refreshToken = await issueRefreshToken(user._id);
    await persistAccessToken(user._id, accessToken);

    const role = normalizeRoleKey(user.role);
    const permissions = await resolveUserPermissions({ ...user, role });
    await recordSuccessfulLogin(req, user);

    return {
      success: true,
      user: {
        ...user,
        role,
        permissions,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        password: null,
      },
      permissions,
      token: accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken) {
    try {
      const {
        verifyRefreshToken,
        revokeRefreshToken,
        issueAccessToken: issueAccess,
        issueRefreshToken: issueRefresh,
        persistAccessToken: persistAccess,
      } = require("../../lib/tokenService");
      const decoded = verifyRefreshToken(refreshToken);
      const user = await UserService.getUserById(decoded.id);
      if (!user) {
        return { success: false, status: 401, error: "Invalid refresh token." };
      }

      const stored = user.refreshTokens || [];
      if (!stored.includes(refreshToken)) {
        return { success: false, status: 401, error: "Refresh token revoked." };
      }

      await revokeRefreshToken(user._id, refreshToken);
      const accessToken = issueAccess(user._id);
      const newRefreshToken = await issueRefresh(user._id);
      await persistAccess(user._id, accessToken);

      return {
        success: true,
        token: accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error("auth.refresh.error", error);
      return { success: false, status: 401, error: "Invalid or expired refresh token." };
    }
  }
}

module.exports = AuthService;
