const jwt = require("jsonwebtoken");
const OrgDAO = require("../dao/orgDAO");
const UserDAO = require("../dao/userDAO");
const { jwtSecret } = require("../config").auth;

const authenticate = async (req, res, next) => {
  try {
    let token =
      (req.headers["authorization"] &&
        req.headers["authorization"].slice("Bearer ".length)) ||
      req.headers["x-access-token"];
    if (!token) {
      return res
        .status(403)
        .json({ success: false, error: "Access token not provided!" });
    }

    let decoded;
    decoded = jwt.verify(token, jwtSecret);
    // console.log(decoded)
    const id = decoded.id;
    const user = await UserDAO.getUserById(id);
    const org = await OrgDAO.getOrgById(id)
    if (!(user || org)) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized access attempt!" });
    }

    const {_id,name,address,phone} = org
    req.user = user;
    req.org = org ? { _id,name,phone,address } : req.user.org;
    next();
  } catch (e) {
    console.error(`Error verifying token`);
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized access attempt!" });
  }
};

module.exports = authenticate;
