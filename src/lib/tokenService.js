const jwt = require("jsonwebtoken");
const UserService = require("../features/users/user.service");
const { jwtSecret } = require("../config").auth;
const { blacklistAccessToken } = require("./tokenBlacklist");

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

function issueAccessToken(userId) {
  return jwt.sign({ id: String(userId) }, jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

async function issueRefreshToken(userId) {
  const token = jwt.sign(
    { id: String(userId), type: "refresh" },
    jwtSecret,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );

  await UserService.updateUser({
    _id: userId,
    refreshToken: token,
    refreshTokenAction: "push",
  });

  return token;
}

function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, jwtSecret);
  if (decoded.type !== "refresh") {
    throw new Error("Invalid refresh token type.");
  }
  return decoded;
}

async function revokeRefreshToken(userId, token) {
  await UserService.updateUser({
    _id: userId,
    refreshToken: token,
    refreshTokenAction: "pull",
  });
}

async function persistAccessToken(userId, accessToken) {
  await UserService.updateUser({
    _id: userId,
    token: accessToken,
    tokenAction: "push",
  });
}

async function revokeTokens(userId, { accessToken, refreshToken } = {}) {
  if (accessToken) {
    await blacklistAccessToken(accessToken, jwtSecret);
    await UserService.updateUser({
      _id: userId,
      token: accessToken,
      tokenAction: "pull",
    });
  }
  if (refreshToken) {
    await revokeRefreshToken(userId, refreshToken);
  }
}

module.exports = {
  issueAccessToken,
  issueRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  persistAccessToken,
  revokeTokens,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
