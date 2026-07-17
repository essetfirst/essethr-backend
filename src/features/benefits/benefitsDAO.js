const { ObjectId } = require("mongodb");

let plans;

class BenefitsDAO {
  static async injectDB(conn) {
    if (!plans) {
      plans = conn.collection("benefit_plans");
      await plans.createIndex({ org: 1, name: 1 });
    }
  }

  static async list(org) {
    return plans.find({ org: String(org) }).sort({ createdOn: -1 }).toArray();
  }

  static async create(doc) {
    const entry = {
      org: String(doc.org),
      name: doc.name,
      description: doc.description || "",
      allowanceAmount: Number(doc.allowanceAmount) || 0,
      active: doc.active !== false,
      createdOn: new Date(),
    };
    const r = await plans.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }
}

module.exports = BenefitsDAO;
