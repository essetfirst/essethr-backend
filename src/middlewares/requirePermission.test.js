jest.mock("../features/rbac/permissions.service", () => ({
  userHasPermission: jest.fn(),
  userHasAnyPermission: jest.fn(),
}));

const {
  userHasPermission,
  userHasAnyPermission,
} = require("../features/rbac/permissions.service");
const requirePermission = require("./requirePermission");

describe("requirePermission middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { permissions: ["employees:read", "employees:write"] };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("returns 401 when user is not authenticated", () => {
    req.user = undefined;
    const middleware = requirePermission("employees:read");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Authentication required.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows access when user has required permission (all mode)", () => {
    req.user = { _id: "user-1" };
    userHasPermission.mockReturnValue(true);
    const middleware = requirePermission("employees:read");

    middleware(req, res, next);

    expect(userHasPermission).toHaveBeenCalledWith(req.permissions, "employees:read");
    expect(next).toHaveBeenCalled();
  });

  it("denies access when user lacks required permission (all mode)", () => {
    req.user = { _id: "user-1" };
    userHasPermission.mockReturnValue(false);
    const middleware = requirePermission("employees:delete");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "You do not have permission to perform this action.",
      required: ["employees:delete"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("requires all permissions when multiple are provided", () => {
    req.user = { _id: "user-1" };
    userHasPermission
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const middleware = requirePermission(["employees:read", "employees:delete"]);

    middleware(req, res, next);

    expect(userHasPermission).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("uses any mode when specified", () => {
    req.user = { _id: "user-1" };
    userHasAnyPermission.mockReturnValue(true);
    const middleware = requirePermission(
      ["employees:read", "employees:delete"],
      { mode: "any" }
    );

    middleware(req, res, next);

    expect(userHasAnyPermission).toHaveBeenCalledWith(req.permissions, [
      "employees:read",
      "employees:delete",
    ]);
    expect(next).toHaveBeenCalled();
  });

  it("denies access in any mode when no permission matches", () => {
    req.user = { _id: "user-1" };
    userHasAnyPermission.mockReturnValue(false);
    const middleware = requirePermission(
      ["payroll:write", "payroll:approve"],
      { mode: "any" }
    );

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
