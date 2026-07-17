const {
  isLocked,
  lockoutRemainingMs,
  normalizeEmail,
  GENERIC_AUTH_ERROR,
} = require("./authSecurity.service");

describe("authSecurity.service", () => {
  test("normalizeEmail lowercases and trims", () => {
    expect(normalizeEmail("  Admin@Example.COM ")).toBe("admin@example.com");
  });

  test("isLocked returns true when lockUntil is in the future", () => {
    expect(isLocked({ lockUntil: new Date(Date.now() + 60000) })).toBe(true);
  });

  test("isLocked returns false when lockUntil is past", () => {
    expect(isLocked({ lockUntil: new Date(Date.now() - 1000) })).toBe(false);
  });

  test("lockoutRemainingMs is zero when not locked", () => {
    expect(lockoutRemainingMs({})).toBe(0);
  });

  test("generic auth error does not reveal account existence", () => {
    expect(GENERIC_AUTH_ERROR.toLowerCase()).toContain("incorrect");
  });
});
