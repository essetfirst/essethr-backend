const { ObjectId } = require("mongodb");

let goals;
let reviews;

class PerformanceDAO {
  static async injectDB(conn) {
    if (!goals) {
      goals = conn.collection("performance_goals");
      reviews = conn.collection("performance_reviews");
      await goals.createIndex({ org: 1, employeeId: 1 });
      await reviews.createIndex({ org: 1, employeeId: 1, period: 1 });
    }
  }

  static async listGoals(org, employeeId) {
    const filter = { org: String(org) };
    if (employeeId) filter.employeeId = String(employeeId);
    return goals.find(filter).sort({ createdOn: -1 }).toArray();
  }

  static async getGoalById(id, org) {
    try {
      return await goals.findOne({ _id: new ObjectId(String(id)), org: String(org) });
    } catch {
      return null;
    }
  }

  static async createGoal(doc) {
    const entry = {
      org: String(doc.org),
      employeeId: String(doc.employeeId),
      title: doc.title,
      description: doc.description || "",
      target: doc.target || "",
      dueDate: doc.dueDate || null,
      status: "active",
      progress: 0,
      createdOn: new Date(),
    };
    const r = await goals.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async updateGoal(id, org, updates) {
    const allowed = { updatedOn: new Date() };
    if (updates.title != null) allowed.title = String(updates.title).trim();
    if (updates.description != null) allowed.description = String(updates.description);
    if (updates.target != null) allowed.target = String(updates.target);
    if (updates.dueDate !== undefined) allowed.dueDate = updates.dueDate || null;
    if (updates.progress != null && updates.progress !== "") {
      allowed.progress = Math.min(100, Math.max(0, Number(updates.progress) || 0));
    }
    if (updates.status != null && ["active", "closed"].includes(updates.status)) {
      allowed.status = updates.status;
    }

    try {
      return await goals.findOneAndUpdate(
        { _id: new ObjectId(String(id)), org: String(org) },
        { $set: allowed },
        { returnDocument: "after" },
      );
    } catch {
      return null;
    }
  }

  static async listReviews(org, employeeId) {
    const filter = { org: String(org) };
    if (employeeId) filter.employeeId = String(employeeId);
    return reviews.find(filter).sort({ createdOn: -1 }).toArray();
  }

  static async getReviewById(id, org) {
    try {
      return await reviews.findOne({ _id: new ObjectId(String(id)), org: String(org) });
    } catch {
      return null;
    }
  }

  static async createReview(doc) {
    const entry = {
      org: String(doc.org),
      employeeId: String(doc.employeeId),
      period: doc.period,
      reviewerId: doc.reviewerId ? String(doc.reviewerId) : null,
      selfReview: doc.selfReview || "",
      managerReview: doc.managerReview || "",
      score: doc.score != null && doc.score !== "" ? Number(doc.score) : null,
      status: doc.status || "draft",
      createdOn: new Date(),
    };
    const r = await reviews.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async updateReview(id, org, updates) {
    const allowed = { updatedOn: new Date() };
    if (updates.selfReview != null) allowed.selfReview = String(updates.selfReview);
    if (updates.managerReview != null) allowed.managerReview = String(updates.managerReview);
    if (updates.score !== undefined) {
      allowed.score =
        updates.score != null && updates.score !== "" ? Number(updates.score) : null;
    }
    if (updates.status != null) allowed.status = updates.status;
    if (updates.period != null) allowed.period = String(updates.period);

    try {
      return await reviews.findOneAndUpdate(
        { _id: new ObjectId(String(id)), org: String(org) },
        { $set: allowed },
        { returnDocument: "after" },
      );
    } catch {
      return null;
    }
  }
}

module.exports = PerformanceDAO;
