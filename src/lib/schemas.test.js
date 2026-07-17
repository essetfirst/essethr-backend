const { loginSchema, refreshTokenSchema } = require("@essethr/shared/schemas/auth");
const { paginationQuerySchema } = require("@essethr/shared/schemas/common");
const { createEmployeeSchema, transferEmployeeSchema } = require("@essethr/shared/schemas/employee");

describe("shared auth schemas", () => {
  it("validates login payload", () => {
    const result = loginSchema.safeParse({ email: "Admin@Example.com", password: "secret" });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("admin@example.com");
  });

  it("rejects invalid refresh token", () => {
    const result = refreshTokenSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("pagination query schema", () => {
  it("coerces page and limit", () => {
    const result = paginationQuerySchema.safeParse({ page: "2", limit: "25" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ page: 2, limit: 25 });
  });
});

describe("employee schemas", () => {
  it("accepts firstName/surName create payload", () => {
    const result = createEmployeeSchema.safeParse({
      firstName: "Jane",
      surName: "Doe",
      email: "jane@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts branch transfer payload", () => {
    const result = transferEmployeeSchema.safeParse({
      org: "507f1f77bcf86cd799439011",
      department: "507f1f77bcf86cd799439012",
      position: "507f1f77bcf86cd799439013",
    });
    expect(result.success).toBe(true);
  });
});
