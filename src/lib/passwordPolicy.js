const DEFAULT_MIN_LENGTH = 8;

function validatePassword(password, options = {}) {
  const minLength = options.minLength || DEFAULT_MIN_LENGTH;
  const errors = [];

  if (!password || typeof password !== "string") {
    return { valid: false, errors: ["Password is required."] };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters.`);
  }
  if (!/[a-z]/.test(password)) errors.push("Password must include a lowercase letter.");
  if (!/[A-Z]/.test(password)) errors.push("Password must include an uppercase letter.");
  if (!/[0-9]/.test(password)) errors.push("Password must include a number.");

  return { valid: errors.length === 0, errors };
}

module.exports = { validatePassword, DEFAULT_MIN_LENGTH };
