/** Re-export shared auth schemas — single source of truth with frontend. */
const {
  loginSchema,
  refreshTokenSchema,
  registerUserSchema,
} = require("@essethr/shared/schemas/auth");

module.exports = {
  loginSchema,
  refreshTokenSchema,
  registerUserSchema,
};
