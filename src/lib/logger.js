let pinoLogger;

try {
  // eslint-disable-next-line global-require
  pinoLogger = require("pino")({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    redact: {
      paths: [
        "password",
        "token",
        "refreshToken",
        "accessToken",
        "authorization",
        "api_secret",
        "apiSecret",
        "secret",
      ],
      censor: "[REDACTED]",
    },
  });
} catch {
  pinoLogger = null;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "encodedPassword",
  "token",
  "accessToken",
  "refreshToken",
  "verifyToken",
  "api_secret",
  "apiSecret",
  "secret",
  "authorization",
]);

function redact(value, depth = 0) {
  if (depth > 6) return "[Truncated]";
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length > 500) return `${value.slice(0, 500)}…`;
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }
  if (typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        out[key] = "[REDACTED]";
      } else {
        out[key] = redact(val, depth + 1);
      }
    }
    return out;
  }
  return value;
}

function log(level, message, meta) {
  const payload = meta !== undefined ? redact(meta) : undefined;
  if (pinoLogger) {
    if (payload !== undefined) {
      pinoLogger[level](payload, message);
    } else {
      pinoLogger[level](message);
    }
    return;
  }

  const ts = new Date().toISOString();
  const suffix = payload !== undefined ? ` ${JSON.stringify(payload)}` : "";
  const line = `[${ts}] [${level.toUpperCase()}] ${message}${suffix}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

module.exports = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", meta instanceof Error ? meta.message : meta),
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== "production" || process.env.LOG_LEVEL === "debug") {
      log("debug", message, meta);
    }
  },
  redact,
};
