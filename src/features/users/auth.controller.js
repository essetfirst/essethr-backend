const UserService = require("../users/user.service");
const OrgDAO = require("../org/orgDAO");
const bcrypt = require("bcryptjs");
const { sign, verify } = require("jsonwebtoken");
const { jwtSecret } = require("../../config").auth;
const getSlug = require("../../utils/getSlug");
const { validatePassword } = require("../../lib/passwordPolicy");
const logger = require("../../lib/logger");

const {
  DEFAULT_ATTENDANCE_POLICY,
  DEFAULT_ETHIOPIAN_HOLIDAYS,
} = require("../../constants");

class AuthController {
  static async apiSignup(req, res) {
    try {
      const { user = {}, org = {} } = req.body;
      const { phone, orgEmail } = org;
      const { email, password, ...other } = user;

      if (!password) {
        return res.status(400).json({ success: false, error: "Password is required." });
      }
      const policy = validatePassword(password);
      if (!policy.valid) {
        return res.status(400).json({ success: false, error: policy.errors.join(" ") });
      }

      const phoneOrEmailExists = await OrgDAO.checkDuplicateEmailOrPhone(orgEmail, phone);
      if (phoneOrEmailExists) {
        return res
          .status(400)
          .json({ success: false, error: "Email or Phone already in use" });
      }

      const orgExists = await OrgDAO.getOrgBySlug(getSlug(org.name));
      if (orgExists) {
        return res
          .status(400)
          .json({ success: false, error: "Organization name already in use" });
      }

      const newOrg = await OrgDAO.createOrg({
        ...org,
        branch: org.branch || "Main",
        attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
        holidays: DEFAULT_ETHIOPIAN_HOLIDAYS,
        createdBy: email,
      });

      if (Object.keys(newOrg).length === 0) {
        return res.status(500).json({
          success: false,
          error: "Error Creating Org",
        });
      }

      const orgId = newOrg.insertedId;
      const encodedPassword = await bcrypt.hash(password, 10);
      const userInfo = {
        email,
        password: encodedPassword,
        activated: true,
        role: "ADMIN",
        org: orgId,
        ...other,
      };

      const newUser = await UserService.createUser(userInfo);
      if (!newUser) {
        return res.status(500).json({
          success: false,
          error: "Error Creating User.",
        });
      }

      const verifyToken = sign({ id: newUser.insertedId }, jwtSecret, {
        expiresIn: "1d",
      });

      return res.status(201).json({
        success: true,
        user: newUser.insertedId,
        verifyToken,
        message: "New account created!",
      });
    } catch (error) {
      logger.error("auth.signup.error", error);
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiSignin(req, res) {
    try {
      const { email, password } = req.body;
      const result = await UserService.getUser({ email });
      if (!result) {
        return res.status(404).json({
          success: false,
          error: "User Not found. Try Signin",
        });
      }
      const user = result;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect email or password" });
      }
      const matches = await bcrypt.compare(password, user.password);
      if (!matches) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect email or password" });
      }
      const token = sign({ id: user._id }, jwtSecret, {
        expiresIn: "1d",
      });

      await UserService.updateUser({ accessToken: token, tokenAction: "push" });
      const { _id, name, phone, activated, role, org } = user;
      return res.json({
        success: true,
        user: { _id, name, phone, email: user.email, activated, role, org },
        token,
        message: "User logged in",
      });
    } catch (error) {
      logger.error("auth.signin.error", error);
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiSignout(req, res) {
    req.user = null;
    req.org = null;
    return res.json({ success: true, message: "User logged out" });
  }

  static async apiRegister(req, res) {
    const { email, password, ...rest } = req.body;
    try {
      const EmailExists = await UserService.checkDuplicateEmailOrPhone(email);
      if (EmailExists) {
        return res
          .status(400)
          .json({ success: false, error: "Email already in use" });
      }
      const encodedPassword = await bcrypt.hash(password, 10);

      const userInfo = {
        password: encodedPassword,
        email,
        role: "User",
        activated: false,
        ...rest,
      };
      const result = await UserService.createUser(userInfo);
      if (!result) {
        return res.status(500).json({
          success: false,
          error: "Unable to create user.",
        });
      }

      const verifyToken = sign({ id: result.insertedId }, jwtSecret, {
        expiresIn: "1d",
      });

      return res.status(201).json({
        success: true,
        user: result.insertedId,
        verifyToken,
        message: "User Registered Successfully!",
      });
    } catch (error) {
      logger.error("auth.register.error", error);
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiActivate(req, res) {
    const verifyToken = req.params.token;
    if (!verifyToken) {
      return res
        .status(400)
        .json({ success: false, error: "Verification token not provided" });
    }

    const user = verify(verifyToken, jwtSecret);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid verification token" });
    }

    const result = await UserService.updateUser({
      id: user.id,
      activated: true,
    });
    if (!result) {
      return res.status(400).json({
        success: false,
        error: "Something went wrong.",
      });
    }
    return res.json({
      success: true,
      user: result,
      message: "User account verified.",
    });
  }

  static async apiLogin(req, res) {
    //
  }

  static async apiGetProfile(req, res) {
    let profile;
    if (req.user) {
      const user = await UserService.getUserById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User Not found",
        });
      }
      const { firstName, lastName, email, org, role } = user;
      profile = { firstName, lastName, email, org, role };
    } else {
      profile = req.org;
    }
    return res.json({ success: true, profile });
  }

  static async apiLogout(req, res) {
    req.user = null;
    req.org = null;
    return res.json({ success: true, message: "User logged out" });
  }
}

module.exports = AuthController;
