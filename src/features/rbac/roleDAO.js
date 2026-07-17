const { ObjectId } = require("mongodb");
const { SYSTEM_ROLES } = require("../../constants/systemRoles");

let roles;

class RoleDAO {
  static async injectDB(conn) {
    if (!roles) {
      roles = conn.collection("roles");
      await roles.createIndex({ org: 1, slug: 1 }, { unique: true });
      await roles.createIndex({ org: 1, name: 1 });
    }
  }

  static async ensureSystemRolesForOrg(orgId) {
    const org = String(orgId);
    const ops = Object.values(SYSTEM_ROLES).map((role) =>
      roles.updateOne(
        { org, slug: role.key, isSystem: true },
        {
          $setOnInsert: {
            org,
            slug: role.key,
            name: role.name,
            description: role.description,
            permissions: role.permissions,
            isSystem: true,
            inheritsFrom: null,
            createdOn: new Date(),
          },
          $set: { updatedOn: new Date() },
        },
        { upsert: true },
      ),
    );
    await Promise.all(ops);
  }

  static async getRolesByOrg(orgId) {
    try {
      return await roles.find({ org: String(orgId) }).sort({ name: 1 }).toArray();
    } catch (e) {
      console.error(e);
      return { error: e, server: true };
    }
  }

  static async getRoleById(id) {
    try {
      return await roles.findOne({ _id: new ObjectId(String(id)) });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async createRole({ org, name, slug, permissions = [], inheritsFrom = null }) {
    try {
      const doc = {
        org: String(org),
        name,
        slug,
        permissions,
        inheritsFrom,
        isSystem: false,
        createdOn: new Date(),
        updatedOn: new Date(),
      };
      const result = await roles.insertOne(doc);
      return { ...doc, _id: result.insertedId };
    } catch (e) {
      if (e.code === 11000) return { error: "Role slug already exists for this organization." };
      console.error(e);
      return { error: e.message, server: true };
    }
  }

  static async updateRole(id, updates) {
    try {
      const result = await roles.findOneAndUpdate(
        { _id: new ObjectId(String(id)), isSystem: { $ne: true } },
        { $set: { ...updates, updatedOn: new Date() } },
        { returnDocument: "after" },
      );
      if (!result) return { error: "Role not found or is a system role." };
      return result;
    } catch (e) {
      console.error(e);
      return { error: e.message, server: true };
    }
  }

  static async deleteRole(id) {
    try {
      const result = await roles.deleteOne({
        _id: new ObjectId(String(id)),
        isSystem: { $ne: true },
      });
      if (!result.deletedCount) {
        return { error: "Role not found or is a system role." };
      }
      return { success: true, deletedId: id };
    } catch (e) {
      console.error(e);
      return { error: e.message, server: true };
    }
  }
}

module.exports = RoleDAO;
