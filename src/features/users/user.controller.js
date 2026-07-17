const bcrypt = require("bcryptjs");

const UserService = require("../users/user.service");
const EmployeeDAO = require("../employees/employeeDAO");
const AuditService = require("../audit/audit.service");
const { validatePassword } = require("../../lib/passwordPolicy");
const { resolveUserPermissions, normalizeRoleKey } = require("../rbac/permissions.service");
const {
  revokeTokens,
} = require("../../lib/tokenService");
const AuthService = require("./auth.service");
const logger = require("../../lib/logger");

/**
 * @typedef UserInfo
 * @property {number} employeeId
 * @property {String} phone
 * @property {String} email
 * @property {String} password
 * @property {String} org
 * @property {String} employeeId
 * @property {Boolean} activated
 * @property {String} role
 *
 */

class UserController {
  static async apiRegisterUser(req, res) {
    const { password, role, ...rest } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: "Password is required." });
    }
    const policy = validatePassword(password);
    if (!policy.valid) {
      return res.status(400).json({ success: false, error: policy.errors.join(" ") });
    }
    try {
      const encodedPassword = await bcrypt.hash(password, 10);

      const userInfo = {
        password: encodedPassword,
        role: role === "ADMIN" ? "ADMIN" : "SUPERVISOR",
        activated: role === "ADMIN",
        ...rest,
      };

      const result = await UserService.createUser(userInfo);

      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      }

      return res.status(201).json({
        success: true,
        user: result.insertedId,
        message: "User created!",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiActivateUser(req, res) {
    try {
      // Set org and role
      const updateInfo = {
        _id: req.params.id || req.body.employeeId || req.body.id,
        activated: true,
      };

      const result = await UserService.updateUser(updateInfo);

      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      }

      // Send email
      return res.json({
        success: true,
        message: "User account activated!",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiLoginUser(req, res) {
    try {
      const result = await AuthService.login(req, req.body);
      if (!result.success) {
        return res.status(result.status).json({
          success: false,
          message: result.message || result.error,
          error: result.message || result.error,
        });
      }

      return res.json({
        success: true,
        user: result.user,
        permissions: result.permissions,
        token: result.token,
        refreshToken: result.refreshToken,
        message: "User logged in",
      });
    } catch (error) {
      logger.error("auth.login.error", error);
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiMakeAdminUser(req, res) {
    try {
      const updateInfo = {
        _id: req.body.userId,
        role: "ADMIN",
        activated: true,
      };

      const result = await UserService.updateUser(updateInfo);

      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      }

      return res.json({
        success: true,
        message: "User privilege elevated to ADMIN!",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiLogoutUser(req, res) {
    try {
      if (req.user) {
        await revokeTokens(req.user._id, {
          accessToken: req.token,
          refreshToken: req.body?.refreshToken,
        });

        await AuditService.log(req, {
          action: "auth.logout",
          resource: "user",
          resourceId: String(req.user._id),
          summary: `${req.user.email} signed out`,
        });
      }

      return res.json({ success: true, message: "User logged out" });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiRefreshToken(req, res) {
    try {
      const result = await AuthService.refresh(req.body.refreshToken);
      if (!result.success) {
        return res.status(result.status).json({
          success: false,
          error: result.error,
        });
      }
      return res.json({
        success: true,
        token: result.token,
        refreshToken: result.refreshToken,
        message: "Token refreshed",
      });
    } catch (error) {
      logger.error("auth.refresh.error", error);
      return res.status(401).json({ success: false, error: "Invalid or expired refresh token." });
    }
  }

  static async apiGetUsers(req, res) {
    try {
      const result = await UserService.getUsers();

      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      }

      return res.json({ success: true, users: result });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiGetUserById(req, res) {
    try {
      const result = await UserService.getUserById(req.params.id);

      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      }

      return res.json({ success: true, user: result });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiCreateUser(req, res, next) {
    try {
      if (req.boyd.employeeId) {
        next();
      }

      const result = await UserService.createUser(req.body);

      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      } else {
        const user = await UserService.getUserById(result.insertedId);

        return res.status(201).json({
          success: true,
          user,
          message: "User profile updated",
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiCreateEmployeeUser(req, res) {
    try {
      const { employeeId, password } = req.body;

      if (!employeeId) {
        return res
          .status(400)
          .json({ success: false, error: "Employee id is required" });
      }

      const employee = await EmployeeDAO.getEmployeeById(employeeId);

      if (!employee) {
        return res
          .status(400)
          .json({ success: false, error: "Employee with given id not found" });
      }

      const { firstName, lastName, email, phone, image, org } = employee;

      const userInfo = {
        org,
        firstName,
        lastName,
        image,
        email,
        phone,
        password,
        role: "EMPLOYEE",
        activated: true,
      };
      const result = await UserService.createUser(userInfo);
      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      } else {
        const user = await UserService.getUserById(result.insertedId);

        return res.status(201).json({
          success: true,
          user,
          message: "Employee user profile updated",
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiUpdateUser(req, res) {
    try {
      const { password, ...rest } = req.body;
      var result;
      if (password) {
        result = await UserService.updateUser({
          _id: req.params.id,
          password: await bcrypt.hash(password,8),
          ...rest,
        });
    
      } else {
           result = await UserService.updateUser({
            _id: req.params.id,
            ...rest,
          });

      }

      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      } else {
        const user = await UserService.getUserById(result.upsertedId);
        return res.json({
          success: true,
          user,
          message: "User profile updated",
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiDeleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id);

      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      }

      return res.json({
        success: true,
        user: result.deletedId,
        message: "User deleted",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }
}

module.exports = UserController;
