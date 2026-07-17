/** Strip MongoDB operator keys from request bodies and query objects. */
function sanitizeValue(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }
  if (typeof value === "string") return value.trim();
  return value;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === "object") req.body = sanitizeValue(req.body);
  if (req.query && typeof req.query === "object") req.query = sanitizeValue(req.query);
  next();
}

module.exports = sanitizeInput;
