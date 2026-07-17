const UserService = require("../features/users/user.service");
const AuditService = require("../features/audit/audit.service");
const logger = require("./logger");

const MAX_FAILED_ATTEMPTS = Number(process.env.AUTH_MAX_FAILED_ATTEMPTS || 5);
const LOCKOUT_MS = Number(process.env.AUTH_LOCKOUT_MS || 15 * 60 * 1000);
const GENERIC_AUTH_ERROR = "Incorrect email or password";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isLocked(user) {
  if (!user?.lockUntil) return false;
  const until = new Date(user.lockUntil).getTime();
  return Number.isFinite(until) && until > Date.now();
}

function lockoutRemainingMs(user) {
  if (!user?.lockUntil) return 0;
  return Math.max(0, new Date(user.lockUntil).getTime() - Date.now());
}

async function recordFailedLogin(req, { email, userId, reason = "invalid_credentials" }) {
  const ip = getClientIp(req);
  const normalizedEmail = normalizeEmail(email);

  await AuditService.log(req, {
    action: "auth.login.failed",
    resource: "user",
    resourceId: userId ? String(userId) : undefined,
    summary: `Failed login for ${normalizedEmail || "unknown email"}`,
    metadata: { ip, reason, email: normalizedEmail },
  });

  if (!userId) {
    logger.warn("auth.login.failed.unknown_user", { email: normalizedEmail, ip, reason });
    return { locked: false, attempts: 0 };
  }

  const result = await UserService.recordFailedLogin(userId, {
    maxAttempts: MAX_FAILED_ATTEMPTS,
    lockoutMs: LOCKOUT_MS,
    ip,
  });

  if (result.locked) {
    await AuditService.log(req, {
      action: "auth.account.locked",
      resource: "user",
      resourceId: String(userId),
      summary: `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts`,
      metadata: { ip, email: normalizedEmail, lockUntil: result.lockUntil },
    });
    logger.warn("auth.account.locked", { userId: String(userId), ip, email: normalizedEmail });
  }

  return result;
}

async function recordSuccessfulLogin(req, user) {
  const ip = getClientIp(req);
  await UserService.clearLoginFailures(user._id, { ip, at: new Date() });

  await AuditService.log(req, {
    action: "auth.login",
    resource: "user",
    resourceId: String(user._id),
    summary: `${user.email} signed in`,
    metadata: { ip },
  });
}

async function assertLoginAllowed(req, user, email) {
  const ip = getClientIp(req);
  const normalizedEmail = normalizeEmail(email);

  if (user && isLocked(user)) {
    const remainingMs = lockoutRemainingMs(user);
    const minutes = Math.ceil(remainingMs / 60000);

    await AuditService.log(req, {
      action: "auth.login.blocked_locked",
      resource: "user",
      resourceId: String(user._id),
      summary: `Locked account login attempt for ${user.email}`,
      metadata: { ip, lockUntil: user.lockUntil },
    });

    return {
      allowed: false,
      status: 429,
      message: `Account temporarily locked. Try again in ${minutes} minute(s).`,
    };
  }

  if (!user?.activated) {
    return {
      allowed: false,
      status: 401,
      message:
        "Your account is being reviewed for approval. Once approved you will be able to sign in.",
    };
  }

  return { allowed: true };
}

module.exports = {
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_MS,
  GENERIC_AUTH_ERROR,
  getClientIp,
  normalizeEmail,
  isLocked,
  lockoutRemainingMs,
  recordFailedLogin,
  recordSuccessfulLogin,
  assertLoginAllowed,
};
