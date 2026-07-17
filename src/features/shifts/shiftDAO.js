const { ObjectId } = require("mongodb");

let templates;
let assignments;

class ShiftDAO {
  static async injectDB(conn) {
    if (!templates) {
      templates = conn.collection("shift_templates");
      assignments = conn.collection("shift_assignments");
      await templates.createIndex({ org: 1, name: 1 });
      await assignments.createIndex({ org: 1, employeeId: 1, date: 1 });
    }
  }

  static async listTemplates(org) {
    return templates.find({ org: String(org) }).sort({ name: 1 }).toArray();
  }

  static async createTemplate(doc) {
    const entry = {
      org: String(doc.org), name: doc.name, startTime: doc.startTime, endTime: doc.endTime,
      breakMinutes: doc.breakMinutes || 0, isOvernight: !!doc.isOvernight,
      createdOn: new Date(),
    };
    const r = await templates.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async listAssignments(org, { from, to, employeeId } = {}) {
    const filter = { org: String(org) };
    if (employeeId) filter.employeeId = String(employeeId);
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }
    return assignments.find(filter).sort({ date: 1 }).toArray();
  }

  static async assign(doc) {
    const entry = {
      org: String(doc.org), employeeId: String(doc.employeeId),
      templateId: doc.templateId ? String(doc.templateId) : null,
      date: doc.date, startTime: doc.startTime, endTime: doc.endTime,
      notes: doc.notes || "", createdOn: new Date(),
    };
    const r = await assignments.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async removeAssignment(id) {
    return assignments.findOneAndDelete({ _id: new ObjectId(String(id)) });
  }
}

module.exports = ShiftDAO;
