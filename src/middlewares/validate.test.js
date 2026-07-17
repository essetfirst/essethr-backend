const { loginSchema } = require("../features/users/auth.schema");

describe("auth.schema", () => {
  test("loginSchema normalizes email", () => {
    const result = loginSchema.safeParse({
      email: "  Admin@Example.COM ",
      password: "Secret123",
    });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("admin@example.com");
  });

  test("loginSchema rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });
});
