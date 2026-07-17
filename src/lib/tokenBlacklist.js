const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const redis = require("./redis");

const PREFIX = "token:blacklist:";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function remainingTtlSeconds(token, jwtSecret) {
  try {
    const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true });
    if (!decoded?.exp) return 900;
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    return Math.max(ttl, 1);
  } catch {
    return 900;
  }
}

async function blacklistAccessToken(token, jwtSecret) {
  if (!token) return;
  const key = `${PREFIX}${hashToken(token)}`;
  const ttl = remainingTtlSeconds(token, jwtSecret);
  await redis.setWithExpiry(key, "1", ttl);
}

async function isAccessTokenBlacklisted(token) {
  if (!token) return false;
  const key = `${PREFIX}${hashToken(token)}`;
  const value = await redis.get(key);
  return value === "1";
}

module.exports = {
  blacklistAccessToken,
  isAccessTokenBlacklisted,
};
