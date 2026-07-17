const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

/** Database name used for `client.db(dbName)` */
const dbName = process.env.MONGODB_DB_NAME || "payrollex";

/**
 * Connection URI. Prefer `MONGODB_URI` in `.env`:
 * - Local: mongodb://127.0.0.1:27017
 * - Atlas: mongodb+srv://USER:PASSWORD@cluster.../OPTIONS
 */
function resolveMongoUri() {
  const explicit = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();
  if (explicit) {
    return explicit;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "MONGODB_URI must be set when NODE_ENV=production. Add it to your environment or backend/.env"
    );
  }
  return "mongodb://127.0.0.1:27017";
}

function resolveJwtSecret() {
  if (process.env.JWT_SECRET?.trim()) {
    return process.env.JWT_SECRET.trim();
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET must be set when NODE_ENV=production. Add it to your environment or backend/.env"
    );
  }
  return "dev-only-change-me-not-for-production";
}

module.exports = {
  db: {
    /** Resolved at startup — load dotenv before requiring this module */
    mongodbURI: resolveMongoUri(),
    dbName,
  },
  auth: {
    jwtSecret: resolveJwtSecret(),
  },
};
