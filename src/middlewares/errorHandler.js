function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  console.error("[API Error]", err);

  const status = err.status || err.statusCode || 500;
  const message =
    status >= 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong."
      : err.message || "Something went wrong.";

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== "production" && err.stack
      ? { stack: err.stack.split("\n").slice(0, 5) }
      : {}),
  });
}

module.exports = errorHandler;
