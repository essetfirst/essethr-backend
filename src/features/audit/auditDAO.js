const { ObjectId } = require("mongodb");

let auditLogs;

class AuditDAO {
  static async injectDB(conn) {
    if (!auditLogs) {
      auditLogs = conn.collection("audit_logs");
      await auditLogs.createIndex({ org: 1, createdOn: -1 });
      await auditLogs.createIndex({ actorId: 1, createdOn: -1 });
      await auditLogs.createIndex({ action: 1, createdOn: -1 });
      await auditLogs.createIndex({ resource: 1, resourceId: 1 });
    }
  }

  static async insertLog(entry) {
    try {
      const doc = {
        org: entry.org ? String(entry.org) : null,
        actorId: entry.actorId ? String(entry.actorId) : null,
        actorEmail: entry.actorEmail || null,
        actorRole: entry.actorRole || null,
        action: entry.action,
        resource: entry.resource || null,
        resourceId: entry.resourceId ? String(entry.resourceId) : null,
        summary: entry.summary || null,
        changes: entry.changes || null,
        metadata: entry.metadata || {},
        createdOn: new Date(),
      };
      const result = await auditLogs.insertOne(doc);
      return { ...doc, _id: result.insertedId };
    } catch (e) {
      console.error("[AuditDAO] insert failed:", e);
      return { error: e.message, server: true };
    }
  }

  static async queryLogs({ org, actorId, action, resource, search, page = 1, limit = 50 }) {
    try {
      const filter = {};
      if (org) filter.org = String(org);
      if (actorId) filter.actorId = String(actorId);
      if (action) filter.action = action;
      if (resource) filter.resource = resource;
      if (search?.trim()) {
        filter.$or = [
          { actorEmail: { $regex: search.trim(), $options: "i" } },
          { summary: { $regex: search.trim(), $options: "i" } },
          { action: { $regex: search.trim(), $options: "i" } },
        ];
      }

      const skip = (Math.max(1, page) - 1) * limit;
      const [items, total] = await Promise.all([
        auditLogs.find(filter).sort({ createdOn: -1 }).skip(skip).limit(limit).toArray(),
        auditLogs.countDocuments(filter),
      ]);

      return { items, total, page, limit };
    } catch (e) {
      console.error(e);
      return { error: e.message, server: true };
    }
  }

  static async queryByResource({ org, resourceId, resource, limit = 30 }) {
    try {
      const filter = { resourceId: String(resourceId) };
      if (org) filter.org = String(org);
      if (resource) filter.resource = resource;
      const items = await auditLogs
        .find(filter)
        .sort({ createdOn: -1 })
        .limit(Math.min(limit, 100))
        .toArray();
      return { items };
    } catch (e) {
      console.error(e);
      return { error: e.message, server: true };
    }
  }
}

module.exports = AuditDAO;
