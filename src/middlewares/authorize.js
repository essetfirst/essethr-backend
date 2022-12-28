// const { UserDAO } = require("../dao");

const authorize = (role) => async (req, res, next) => {
  let roles = Array.isArray(role) ? role : [role];
  // if (!req.user) {
  //   const result = await UserDAO.getUserById(req.userId || req.user._id);
  //   if (result.error) {
  //     return res.status(result.server ? 500 : 400).json({
  //       success: false,
  //       error: result.server ? "Something went wrong" : result.error,
  //     });
  //   }
  // }

  const isAuthorized = roles.includes(user.role);

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: "You dont have the required previledge!",
    });
  }
  next();
};

module.exports = authorize;
