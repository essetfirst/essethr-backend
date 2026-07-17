jest.mock("jsonwebtoken");
jest.mock("../features/users/user.service");
jest.mock("../features/rbac/permissions.service");

const jwt = require("jsonwebtoken");
const UserService = require("../features/users/user.service");
const {
  resolveUserPermissions,
  normalizeRoleKey,
} = require("../features/rbac/permissions.service");
const authenticate = require("./authenticate");

describe("authenticate middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    normalizeRoleKey.mockImplementation((role) => role || "EMPLOYEE");
    resolveUserPermissions.mockResolvedValue(["employees:read"]);
  });

  it("returns 401 when no token is provided", async () => {
    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Access token not provided.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts token from Authorization Bearer header", async () => {
    const token = "valid-token";
    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue({ id: "user-id" });
    UserService.getUserById.mockResolvedValue({
      _id: "user-id",
      role: "ADMIN",
      org: "org-1",
      tokens: [token],
    });

    await authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
    expect(req.token).toBe(token);
    expect(req.permissions).toEqual(["employees:read"]);
    expect(next).toHaveBeenCalled();
  });

  it("accepts token from x-access-token header", async () => {
    const token = "header-token";
    req.headers["x-access-token"] = token;
    jwt.verify.mockReturnValue({ id: "user-id" });
    UserService.getUserById.mockResolvedValue({
      _id: "user-id",
      role: "EMPLOYEE",
      org: "org-1",
    });

    await authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
    expect(next).toHaveBeenCalled();
  });

  it("returns 401 when user is not found", async () => {
    req.headers.authorization = "Bearer missing-user";
    jwt.verify.mockReturnValue({ id: "missing" });
    UserService.getUserById.mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized access attempt.",
    });
  });

  it("returns 401 when token has been revoked", async () => {
    const token = "revoked-token";
    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue({ id: "user-id" });
    UserService.getUserById.mockResolvedValue({
      _id: "user-id",
      role: "EMPLOYEE",
      org: "org-1",
      tokens: ["other-token"],
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Session has been revoked. Please sign in again.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows token when user has no tokens array (legacy sessions)", async () => {
    const token = "legacy-token";
    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue({ id: "user-id" });
    UserService.getUserById.mockResolvedValue({
      _id: "user-id",
      role: "EMPLOYEE",
      org: "org-1",
    });

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("returns 401 when jwt verification fails", async () => {
    req.headers.authorization = "Bearer bad-token";
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized access attempt.",
    });
  });
});
