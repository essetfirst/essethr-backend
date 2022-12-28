const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtSecret } = require("../config").auth;
const OrgDAO = require("../dao/orgDAO");
const UserDAO = require("../dao/userDAO");

// JWT_SECRET = console.log(require('crypto').randomBytes(64).toString('hex'))

class SignupController {
  static async signup(req, res, next) {
    const { user = {}, org = {} } = req.body;

    // Org creation
    const result = await OrgDAO.createOrg(org);
    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }
    console.log(result);
    const orgId = result.insertedId;

    // User creation
    const { email, phone, password, ...rest } = req.body;
    const phoneExists = UserDAO.checkDuplicateEmailOrPhone(email, phone);
    if (phoneExists) {
      return res
        .status(400)
        .json({ success: false, error: "Email already in use" });
    }
    try {
      const encodedPassword = await bcrypt.hash(password, 10);

      const userInfo = {
        password: encodedPassword,
        activated: true,
        verified: false,
        role: "ADMIN",
        org: orgId,
        ...rest,
      };
      const result = await UserDAO.createUser(userInfo);
      if (result.error) {
        return res.status(result.server ? 500 : 400).json({
          success: true,
          error: result.server ? "Something went wrong." : result.error,
        });
      }

      const verifyToken = await jwt.sign({ id: result.insertedId }, jwtSecret, {
        expiresIn: "1d",
      });

      return res.status(201).json({
        success: true,
        user: result.insertedId,
        verifyToken,
        message: "New account created!",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong." });
    }
  }

  static async verify(req, res, next) {}
}

module.exports = SignupController;
