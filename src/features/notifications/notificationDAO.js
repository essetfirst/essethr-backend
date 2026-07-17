const { ObjectId } = require("mongodb");

let notifications;

class NotificationDAO {
  static async injectDB(conn) {
    if (!notifications) {
      notifications = conn.collection("notifications");
      await notifications.createIndex({ userId: 1, org: 1, readAt: 1, createdOn: -1 });
      await notifications.createIndex({ userId: 1, dedupeKey: 1 }, { unique: true, sparse: true });
    }
  }

  static async create(doc) {
    const entry = {
      org: String(doc.org),
      userId: String(doc.userId),
      type: doc.type || "info",
      title: doc.title,
      message: doc.message || "",
      href: doc.href || null,
      resourceType: doc.resourceType || null,
      resourceId: doc.resourceId ? String(doc.resourceId) : null,
      dedupeKey: doc.dedupeKey || null,
      readAt: null,
      createdOn: new Date(),
    };
    if (entry.dedupeKey) {
      const existing = await notifications.findOne({
        userId: entry.userId,
        dedupeKey: entry.dedupeKey,
        readAt: null,
      });
      if (existing) return existing;
      try {
        const r = await notifications.insertOne(entry);
        return { ...entry, _id: r.insertedId };
      } catch (e) {
        if (e.code === 11000) {
          return notifications.findOne({ userId: entry.userId, dedupeKey: entry.dedupeKey });
        }
        throw e;
      }
    }
    const r = await notifications.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async listForUser(userId, org, { limit = 50, unreadOnly = false } = {}) {
    const filter = { userId: String(userId), org: String(org) };
    if (unreadOnly) filter.readAt = null;
    return notifications
      .find(filter)
      .sort({ createdOn: -1 })
      .limit(Math.min(limit, 100))
      .toArray();
  }

  static async countUnread(userId, org) {
    return notifications.countDocuments({
      userId: String(userId),
      org: String(org),
      readAt: null,
    });
  }

  static async markRead(id, userId) {
    return notifications.findOneAndUpdate(
      { _id: new ObjectId(String(id)), userId: String(userId) },
      { $set: { readAt: new Date() } },
      { returnDocument: "after" },
    );
  }

  static async markAllRead(userId, org) {
    return notifications.updateMany(
      { userId: String(userId), org: String(org), readAt: null },
      { $set: { readAt: new Date() } },
    );
  }
}

module.exports = NotificationDAO;
