const { ObjectId } = require("mongodb");

let col;

class AnnouncementDAO {
  static async injectDB(conn) {
    if (!col) {
      col = conn.collection("announcements");
      await col.createIndex({ org: 1, publishedOn: -1 });
    }
  }

  static async list(org, { activeOnly = true } = {}) {
    const filter = { org: String(org) };
    if (activeOnly) filter.active = { $ne: false };
    return col.find(filter).sort({ publishedOn: -1 }).limit(100).toArray();
  }

  static async create(doc) {
    const entry = {
      org: String(doc.org),
      title: doc.title,
      body: doc.body,
      authorId: doc.authorId ? String(doc.authorId) : null,
      active: doc.active !== false,
      publishedOn: new Date(),
      expiresOn: doc.expiresOn ? new Date(doc.expiresOn) : null,
    };
    const r = await col.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async update(id, updates) {
    return col.findOneAndUpdate(
      { _id: new ObjectId(String(id)) },
      { $set: { ...updates, updatedOn: new Date() } },
      { returnDocument: "after" },
    );
  }

  static async remove(id) {
    return col.findOneAndDelete({ _id: new ObjectId(String(id)) });
  }
}

module.exports = AnnouncementDAO;
