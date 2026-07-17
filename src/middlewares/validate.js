/**
 * Validates request body/query/params against a Zod schema.
 * Parsed output replaces the target on success.
 */
function validate(schema, { source = "body" } = {}) {
  return (req, res, next) => {
    const input = req[source];
    const result = schema.safeParse(input);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0];
      return res.status(400).json({
        success: false,
        error: firstError || "Validation failed.",
        details: fieldErrors,
      });
    }

    req[source] = result.data;
    return next();
  };
}

module.exports = validate;
