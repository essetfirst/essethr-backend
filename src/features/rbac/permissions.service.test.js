jest.mock("./roleDAO");
jest.mock("../../constants/systemRoles", () => ({
  normalizeRoleKey: jest.fn((role) => role || "EMPLOYEE"),
  getPermissionsForRole: jest.fn(),
  roleHasPermission: jest.fn(),
}));

const RoleDAO = require("./roleDAO");
const { getPermissionsForRole } = require("../../constants/systemRoles");
const {
  resolveUserPermissions,
  userHasPermission,
  userHasAnyPermission,
} = require("./permissions.service");

describe("permissions.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("resolveUserPermissions", () => {
    it("returns empty array when user is null", async () => {
      await expect(resolveUserPermissions(null)).resolves.toEqual([]);
    });

    it("returns base role permissions", async () => {
      getPermissionsForRole.mockReturnValue(["employees:read", "employees:write"]);

      const result = await resolveUserPermissions({ role: "HR_MANAGER" });

      expect(getPermissionsForRole).toHaveBeenCalledWith("HR_MANAGER");
      expect(result).toEqual(["employees:read", "employees:write"]);
    });

    it("merges custom role and user override permissions", async () => {
      getPermissionsForRole.mockReturnValue(["employees:read"]);
      RoleDAO.getRoleById.mockResolvedValue({
        permissions: ["reports:read"],
      });

      const result = await resolveUserPermissions({
        role: "EMPLOYEE",
        customRoleId: "role-1",
        permissions: ["audit:read"],
      });

      expect(RoleDAO.getRoleById).toHaveBeenCalledWith("role-1");
      expect(result).toEqual(["employees:read", "reports:read", "audit:read"]);
    });

    it("deduplicates permissions", async () => {
      getPermissionsForRole.mockReturnValue(["employees:read", "reports:read"]);
      RoleDAO.getRoleById.mockResolvedValue({
        permissions: ["reports:read"],
      });

      const result = await resolveUserPermissions({
        role: "SUPERVISOR",
        customRoleId: "role-2",
        permissions: ["employees:read"],
      });

      expect(result).toEqual(["employees:read", "reports:read"]);
    });
  });

  describe("userHasPermission", () => {
    it("returns true when permission is falsy", () => {
      expect(userHasPermission([], null)).toBe(true);
    });

    it("returns false when userPermissions is not an array", () => {
      expect(userHasPermission(null, "employees:read")).toBe(false);
    });

    it("returns true when permission is included", () => {
      expect(userHasPermission(["employees:read"], "employees:read")).toBe(true);
    });

    it("returns false when permission is missing", () => {
      expect(userHasPermission(["employees:read"], "employees:delete")).toBe(false);
    });
  });

  describe("userHasAnyPermission", () => {
    it("returns true when permissions list is empty", () => {
      expect(userHasAnyPermission(["employees:read"], [])).toBe(true);
    });

    it("returns true when user has at least one permission", () => {
      expect(
        userHasAnyPermission(
          ["employees:read", "leaves:read"],
          ["payroll:write", "leaves:read"]
        )
      ).toBe(true);
    });

    it("returns false when user has none of the permissions", () => {
      expect(
        userHasAnyPermission(["employees:read"], ["payroll:write", "audit:read"])
      ).toBe(false);
    });
  });
});
