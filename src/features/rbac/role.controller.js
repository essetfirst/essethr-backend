const RoleDAO = require("./roleDAO");
const UserService = require("../users/user.service");
const { SYSTEM_ROLES } = require("../../constants/systemRoles");
const AuditService = require("../audit/audit.service");
const { PERMISSIONS } = require("../../constants/permissions");

class RoleController {
  static async apiGetRoles(req, res) {
    try {
      const orgId = req.params.org || req.org;
      await RoleDAO.ensureSystemRolesForOrg(orgId);
      const roles = await RoleDAO.getRolesByOrg(orgId);
      if (roles?.error) {
        return res.status(500).json({ success: false, error: "Failed to load roles." });
      }
      return res.json({ success: true, roles, systemRoles: SYSTEM_ROLES });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiCreateRole(req, res) {
    try {
      const orgId = req.params.org || req.org;
      const { name, slug, permissions, inheritsFrom } = req.body;
      if (!name?.trim() || !slug?.trim()) {
        return res.status(400).json({ success: false, error: "Name and slug are required." });
      }
      const role = await RoleDAO.createRole({
        org: orgId,
        name: name.trim(),
        slug: slug.trim().toUpperCase(),
        permissions: permissions || [],
        inheritsFrom,
      });
      if (role?.error) {
        return res.status(role.server ? 500 : 400).json({ success: false, error: role.error });
      }
      await AuditService.log(req, {
        action: "role.create",
        resource: "role",
        resourceId: String(role._id),
        metadata: { name: role.name, slug: role.slug },
      });
      return res.status(201).json({ success: true, role });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiUpdateRole(req, res) {
    try {
      const { permissions, name, description, inheritsFrom } = req.body;
      const role = await RoleDAO.updateRole(req.params.roleId, {
        ...(permissions !== undefined && { permissions }),
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(inheritsFrom !== undefined && { inheritsFrom }),
      });
      if (role?.error) {
        return res.status(role.server ? 500 : 400).json({ success: false, error: role.error });
      }
      await AuditService.log(req, {
        action: "role.update",
        resource: "role",
        resourceId: String(req.params.roleId),
        metadata: { permissions },
      });
      return res.json({ success: true, role });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiDeleteRole(req, res) {
    try {
      const result = await RoleDAO.deleteRole(req.params.roleId);
      if (result?.error) {
        return res.status(400).json({ success: false, error: result.error });
      }
      await AuditService.log(req, {
        action: "role.delete",
        resource: "role",
        resourceId: String(req.params.roleId),
      });
      return res.json({ success: true, message: "Role deleted." });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiAssignUser(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, error: "userId is required." });
      }

      const role = await RoleDAO.getRoleById(req.params.roleId);
      if (!role) {
        return res.status(404).json({ success: false, error: "Role not found." });
      }

      const orgId = req.params.org || req.org;
      if (String(role.org) !== String(orgId)) {
        return res.status(403).json({ success: false, error: "Role does not belong to this organization." });
      }

      const user = await UserService.updateUser({
        _id: userId,
        role: role.slug,
        org: String(orgId),
      });
      if (user?.error) {
        return res.status(user.server ? 500 : 400).json({ success: false, error: user.error });
      }

      await AuditService.log(req, {
        action: "role.assign",
        resource: "role",
        resourceId: String(req.params.roleId),
        summary: `Assigned role ${role.name} to user ${userId}`,
        metadata: { userId, roleSlug: role.slug },
      });

      return res.json({ success: true, user, message: "User assigned to role." });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Something went wrong." });
    }
  }
}

module.exports = RoleController;
