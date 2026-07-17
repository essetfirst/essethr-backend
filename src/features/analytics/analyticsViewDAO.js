let views;

class AnalyticsViewDAO {
  static async injectDB(conn) {
    if (!views) {
      views = conn.collection("analytics_views");
      await views.createIndex({ org: 1, userId: 1, name: 1 }, { unique: true });
      await views.createIndex({ org: 1, userId: 1, savedAt: -1 });
    }
  }

  static async list(org, userId) {
    return views
      .find({ org: String(org), userId: String(userId) })
      .sort({ savedAt: -1 })
      .limit(20)
      .toArray();
  }

  static async upsert(org, userId, name, filters) {
    const doc = {
      org: String(org),
      userId: String(userId),
      name: String(name).trim(),
      filters: filters || {},
      savedAt: new Date(),
      updatedOn: new Date(),
    };
    await views.updateOne(
      { org: doc.org, userId: doc.userId, name: doc.name },
      { $set: doc },
      { upsert: true },
    );
    return doc;
  }

  static async remove(org, userId, name) {
    const result = await views.deleteOne({
      org: String(org),
      userId: String(userId),
      name: String(name),
    });
    return { deletedCount: result.deletedCount };
  }
}

module.exports = AnalyticsViewDAO;
