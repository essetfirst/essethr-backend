const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const MIN_JWT_SECRET_LENGTH = 32;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function isBlank(value) {
  return !value || !String(value).trim();
}

/**
 * Validate environment at startup. Fails fast in production on unsafe config.
 */
function validateEnv() {
  const errors = [];
  const warnings = [];

  if (isBlank(process.env.MONGODB_URI)) {
    errors.push("MONGODB_URI is required.");
  }

  if (isProduction()) {
    if (isBlank(process.env.JWT_SECRET)) {
      errors.push("JWT_SECRET is required in production.");
    } else if (String(process.env.JWT_SECRET).length < MIN_JWT_SECRET_LENGTH) {
      errors.push(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters in production.`);
    }

    if (isBlank(process.env.CORS_ORIGINS)) {
      errors.push("CORS_ORIGINS is required in production (comma-separated SPA origins).");
    }

    const cloudVars = ["CLOUD_NAME", "API_KEY", "API_SECRET"];
    const cloudConfigured = cloudVars.filter((key) => !isBlank(process.env[key])).length;
    if (cloudConfigured > 0 && cloudConfigured < cloudVars.length) {
      errors.push("Cloudinary is partially configured. Set CLOUD_NAME, API_KEY, and API_SECRET together.");
    }
  } else {
    if (isBlank(process.env.JWT_SECRET)) {
      warnings.push("JWT_SECRET is not set — dev fallback will be used. Set it in backend/.env.");
    }
    if (isBlank(process.env.CORS_ORIGINS)) {
      warnings.push("CORS_ORIGINS is not set — all origins allowed in development.");
    }
  }

  if (errors.length) {
    throw new Error(
      `Environment validation failed:\n- ${errors.join("\n- ")}`
    );
  }

  warnings.forEach((message) => {
    console.warn(`[env] ${message}`);
  });
}

function getCorsOrigins() {
  const raw = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "").trim();
  if (!raw) return null;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

module.exports = {
  validateEnv,
  getCorsOrigins,
  isProduction,
  MIN_JWT_SECRET_LENGTH,
};
