/**
 * Lightweight CSRF mitigation for SPA + Bearer token API.
 * Requires custom header on mutating requests so simple cross-site forms cannot invoke the API.
 */
function csrfProtection(req, res, next) {
  const method = req.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return next();
  }

  const requestedWith = req.headers["x-requested-with"];
  if (requestedWith !== "XMLHttpRequest") {
    return res.status(403).json({
      success: false,
      error: "Missing required CSRF header.",
    });
  }

  next();
}

module.exports = csrfProtection;
