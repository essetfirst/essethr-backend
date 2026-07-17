const { ObjectId } = require("mongodb");

let claims;

class ExpensesDAO {
  static async injectDB(conn) {
    if (!claims) {
      claims = conn.collection("expense_claims");
      await claims.createIndex({ org: 1, employeeId: 1, status: 1 });
    }
  }

  static async list(org, { employeeId, status } = {}) {
    const filter = { org: String(org) };
    if (employeeId) filter.employeeId = String(employeeId);
    if (status) filter.status = status;
    return claims.find(filter).sort({ createdOn: -1 }).toArray();
  }

  static async create(doc) {
    const entry = {
      org: String(doc.org),
      employeeId: String(doc.employeeId),
      amount: Number(doc.amount) || 0,
      currency: doc.currency || "ETB",
      category: doc.category || "general",
      description: doc.description || "",
      status: "pending",
      createdOn: new Date(),
    };
    const r = await claims.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async updateStatus(org, id, status) {
    const result = await claims.findOneAndUpdate(
      { _id: new ObjectId(String(id)), org: String(org) },
      { $set: { status, updatedOn: new Date() } },
      { returnDocument: "after" },
    );
    return result?.value ?? result ?? null;
  }
}

module.exports = ExpensesDAO;
