const { ObjectId } = require("mongodb");

const CATEGORIES = [
  "contract",
  "certificate",
  "id",
  "resume",
  "policy",
  "signed",
  "other",
];

let documents;

class DocumentDAO {
  static async injectDB(conn) {
    if (!documents) {
      documents = conn.collection("documents");
      await documents.createIndex({ org: 1, employeeId: 1, createdOn: -1 });
      await documents.createIndex({ org: 1, category: 1 });
      await documents.createIndex({ expiresOn: 1 }, { sparse: true });
    }
  }

  static async create(doc) {
    try {
      const entry = {
        org: String(doc.org),
        employeeId: doc.employeeId ? String(doc.employeeId) : null,
        category: doc.category || "other",
        title: doc.title,
        filename: doc.filename,
        path: doc.path,
        mimeType: doc.mimeType,
        size: doc.size,
        version: doc.version || 1,
        previousVersionId: doc.previousVersionId || null,
        expiresOn: doc.expiresOn ? new Date(doc.expiresOn) : null,
        uploadedBy: doc.uploadedBy ? String(doc.uploadedBy) : null,
        createdOn: new Date(),
        updatedOn: new Date(),
      };
      const result = await documents.insertOne(entry);
      return { ...entry, _id: result.insertedId };
    } catch (e) {
      console.error(e);
      return { error: e.message, server: true };
    }
  }

  static async list({ org, employeeId, category, search, page = 1, limit = 50 }) {
    try {
      const filter = { org: String(org) };
      if (employeeId) filter.employeeId = String(employeeId);
      if (category) filter.category = category;
      if (search?.trim()) {
        filter.$or = [
          { title: { $regex: search.trim(), $options: "i" } },
          { filename: { $regex: search.trim(), $options: "i" } },
        ];
      }
      const skip = (Math.max(1, page) - 1) * limit;
      const [items, total] = await Promise.all([
        documents.find(filter).sort({ createdOn: -1 }).skip(skip).limit(limit).toArray(),
        documents.countDocuments(filter),
      ]);
      return { items, total, page, limit };
    } catch (e) {
      console.error(e);
      return { error: e.message, server: true };
    }
  }

  static async getById(id) {
    try {
      return await documents.findOne({ _id: new ObjectId(String(id)) });
    } catch (e) {
      return null;
    }
  }

  static async delete(id) {
    try {
      const result = await documents.findOneAndDelete({
        _id: new ObjectId(String(id)),
      });
      return result;
    } catch (e) {
      console.error(e);
      return { error: e.message, server: true };
    }
  }

  static async getLatestVersion(org, title, employeeId) {
    return documents
      .find({ org: String(org), title, employeeId: employeeId ? String(employeeId) : null })
      .sort({ version: -1 })
      .limit(1)
      .toArray()
      .then((rows) => rows[0] || null);
  }
}

module.exports = { DocumentDAO, CATEGORIES };
