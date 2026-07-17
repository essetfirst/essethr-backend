const { ObjectId } = require("mongodb");

let templates;
let requests;

class WorkflowDAO {
  static async injectDB(conn) {
    if (!templates) {
      templates = conn.collection("workflow_templates");
      requests = conn.collection("approval_requests");
      await templates.createIndex({ org: 1, type: 1 });
      await requests.createIndex({ org: 1, status: 1, createdOn: -1 });
      await requests.createIndex({ org: 1, requesterId: 1 });
    }
  }

  static async listTemplates(org) {
    return templates.find({ org: String(org) }).toArray();
  }

  static async createTemplate(doc) {
    const entry = {
      org: String(doc.org), name: doc.name, type: doc.type,
      steps: doc.steps || [], // [{ role, order }]
      createdOn: new Date(),
    };
    const r = await templates.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async createRequest(doc) {
    const entry = {
      org: String(doc.org), type: doc.type, resourceType: doc.resourceType,
      resourceId: doc.resourceId ? String(doc.resourceId) : null,
      requesterId: String(doc.requesterId), status: "pending",
      currentStep: 0, steps: doc.steps || [],
      history: [{ action: "submitted", by: String(doc.requesterId), at: new Date() }],
      createdOn: new Date(),
    };
    const r = await requests.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async listRequests(org, { status, requesterId } = {}) {
    const filter = { org: String(org) };
    if (status) filter.status = status;
    if (requesterId) filter.requesterId = String(requesterId);
    return requests.find(filter).sort({ createdOn: -1 }).limit(200).toArray();
  }

  static async approve(id, approverId, comment) {
    const reqDoc = await requests.findOne({ _id: new ObjectId(String(id)) });
    if (!reqDoc) return null;
    const nextStep = (reqDoc.currentStep || 0) + 1;
    const done = nextStep >= (reqDoc.steps?.length || 1);
    const history = [...(reqDoc.history || []), { action: done ? "approved" : "step_approved", by: String(approverId), comment, at: new Date() }];
    return requests.findOneAndUpdate(
      { _id: reqDoc._id },
      { $set: { currentStep: nextStep, status: done ? "approved" : "pending", history, updatedOn: new Date() } },
      { returnDocument: "after" },
    );
  }

  static async reject(id, approverId, comment) {
    return requests.findOneAndUpdate(
      { _id: new ObjectId(String(id)) },
      {
        $set: { status: "rejected", updatedOn: new Date() },
        $push: { history: { action: "rejected", by: String(approverId), comment, at: new Date() } },
      },
      { returnDocument: "after" },
    );
  }
}

module.exports = WorkflowDAO;
