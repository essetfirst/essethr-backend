const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const UserDAO = require("../dao/userDAO");
const { jwtSecret } = require("../config").auth;
const { EmployeeDAO } = require("../dao");

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
    console.log(password,role)
    try {
      const encodedPassword = await bcrypt.hash(password, 10);

      const userInfo = {
        password: encodedPassword,
        role: role === "ADMIN" ? "ADMIN" : "SUPERVISOR",
        activated: role === "ADMIN",
        ...rest,
      };

      const result = await UserDAO.createUser(userInfo);

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

      const result = await UserDAO.updateUser(updateInfo);

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
    const { email, password } = req.body;
    /// Validation

    // find user by email
    // if found check for password match
    // if neither true return
    // otherwise return token
    const result = await UserDAO.getUser({ email });

    if (result && result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.server,
      });
    }
    const user = result;

    console.log("[UserCtrl]: Line 105 -> User queried info: ", user);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });
    }

    if (!user.activated) {
      return res.status(401).json({
        success: false,
        message:
          "Your account is being reviewed for approval. Once approved you will be able to sign in.",
      });
    }

    try {
      const matches = await bcrypt.compare(password, user.password);

      if (!matches) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect email or password" });
      }

      const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "10d" });

      await UserDAO.updateUser({ _id: user._id, token, tokenAction: "push" });

      console.log("[UserCtrl]: Line 133 -> User token created: ", token);

      return res.json({
        success: true,
        user: {
          ...user,
          name: user.firstName + " " + user.lastName,
          password: null,
        },
        token,
        message: "User logged in",
      });
    } catch (error) {
      console.error(error);
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

      const result = await UserDAO.updateUser(updateInfo);

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
        await UserDAO.updateUser({
          _id: req.user._id,
          token: req.token,
          tokenAction: "pull",
        });
      }

      return res.json({ success: true, message: "User logged out" });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiGetUsers(req, res) {
    try {
      const result = await UserDAO.getUsers();

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
      const result = await UserDAO.getUserById(req.params.id);

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

      const result = await UserDAO.createUser(req.body);

      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      } else {
        const user = await UserDAO.getUserById(result.insertedId);

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
      const result = await UserDAO.createUser(userInfo);
      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      } else {
        const user = await UserDAO.getUserById(result.insertedId);

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
      console.log(req.params.id)
      if (password) {
        result = await UserDAO.updateUser({
          _id: req.params.id,
          password: await bcrypt.hash(password,8),
          ...rest,
        });
    
      } else {
           result = await UserDAO.updateUser({
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
        const user = await UserDAO.getUserById(result.upsertedId);
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
      const result = await UserDAO.deleteUser(req.params.id);

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
