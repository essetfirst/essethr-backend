const UserDAO = require("../dao/userDAO");
const OrgDAO = require("../dao/orgDAO");
const bcrypt = require("bcryptjs");
const { sign, verify } = require("jsonwebtoken");
const { jwtSecret } = require("../config").auth;
const getSlug = require("../utils/getSlug");


const {
  DEFAULT_ATTENDANCE_POLICY,
  DEFAULT_ETHIOPIAN_HOLIDAYS,
} = require("../constants");
const Joi = require("joi");

class AuthController {
  static async apiSignup(req, res, next) {
    try {
      const { user = {}, org = {} } = req.body;

      const { phone,orgEmail, ...rest } = org;
      const { email, ...other } = user;
        console.log(orgEmail,phone);

      const phoneOrEmailExists = await OrgDAO.checkDuplicateEmailOrPhone(
        orgEmail,
        phone
      );

      console.log(phoneOrEmailExists);
      if (phoneOrEmailExists) {
        return res
          .status(400)
          .json({ success: false, error: "Email or Phone already in use" });
      }
      // Org name already taken
      const orgExists = await OrgDAO.getOrgBySlug(getSlug(org.name));
      // console.log("----", Object.keys(orgExists).length);
      console.log(orgExists);
      if (orgExists) {
        return res
          .status(400)
          .json({ success: false, error: "Organization name already in use" });
      }
      // Org creation
      // console.log(org, user);
      const newOrg = await OrgDAO.createOrg({
        ...org,
        attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
        holidays: DEFAULT_ETHIOPIAN_HOLIDAYS,
        createdBy: email,
      });
      console.log(newOrg);
      // console.log(result);
      if (Object.keys(newOrg).length == 0 ) {
        return res.status(500).json({
          success: false,
          error: "Error Creating Org",
        });
      }
      const orgId = newOrg.insertedId;
      const encodedPassword = await bcrypt.hash(user.password, 10);
      const userInfo = {
        email,
        password: encodedPassword,
        activated: true,
        role: "ADMIN",
        org: orgId,
        ...other,
      };
      console.log(newOrg,userInfo);
      const newUser = await UserDAO.createUser(userInfo);
      console.log(newUser);
      if (!newUser) {
        return res.status(500).json({
          success: true,
          error: "Error Creating User.",
        });
      }
      console.log(newOrg.insertedId);
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
      console.error(error);
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiSignin(req, res, next) {
    try {
      var { email, password } = req.body;
      const result = await UserDAO.getUser({ email });
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
      // console.log(matches);
      if (!matches) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect email or password" });
      }
      // console.log(user);
      const token = sign({ id: user._id }, jwtSecret, {
        expiresIn: "1d",
      });

      await UserDAO.updateUser({ accessToken: token, tokenAction: "push" });
      const { _id, name, phone, activated, role, org } = user;
      return res.json({
        success: true,
        user: { _id, name, phone, email: user.email, activated, role, org },
        token,
        message: "User logged in",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  }

  static async apiSignout(req, res, next) {
    req.user = null;
    req.org = null;
    return res.json({ success: true, message: "User logged out" });
  }

  static async apiRegister(req, res) {
    const { email, password, ...rest } = req.body;
    try {
      const EmailExists = await UserDAO.checkDuplicateEmailOrPhone(email);
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
      const result = await UserDAO.createUser(userInfo);
      if (!result) {
        return res.status(500).json({
          success: true,
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
    // console.log(user);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid verification token" });
    }

    const result = await UserDAO.updateUser({
      id: user.id,
      activated: true,
    });
    // console.log(result);
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
    // Require a login service
    //
  }

  static async apiGetProfile(req, res) {
    let profile, type;
    if (req.user) {
      const user = await UserDAO.getUserById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: true,
          error: "User Not found",
        });
      }
      const { firstName, lastName, email,org,role } = user;
      profile = { firstName, lastName, email,org ,role};
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
