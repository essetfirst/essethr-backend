/** Lightweight in-memory rate limiter for auth endpoints. */
function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message,
  skip,
  keyGenerator,
} = {}) {
  const hits = new Map();

  return (req, res, next) => {
    if (typeof skip === "function" ? skip(req) : skip) {
      return next();
    }

    const key = keyGenerator
      ? keyGenerator(req)
      : req.ip || req.headers["x-forwarded-for"] || "unknown";
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count += 1;
    hits.set(key, entry);

    res.set("X-RateLimit-Limit", String(max));
    res.set("X-RateLimit-Remaining", String(Math.max(0, max - entry.count)));

    if (entry.count > max) {
      return res.status(429).json({
        success: false,
        error: message || "Too many requests. Please try again later.",
      });
    }

    next();
  };
}

const isDev = process.env.NODE_ENV !== "production";

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 30,
  message: "Too many authentication attempts. Please wait and try again.",
});

const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  message: "Too many login attempts for this account. Please wait and try again.",
  keyGenerator: (req) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    return `login:${ip}:${email || "unknown"}`;
  },
});

/** In local dev the SPA + QA can exceed 300 req/15min quickly — skip unless explicitly enabled. */
const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 300,
  message: "Too many requests. Please try again later.",
  skip: () => isDev && process.env.RATE_LIMIT_DISABLED !== "false",
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  loginRateLimiter,
  globalRateLimiter,
};
