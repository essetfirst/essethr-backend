const { ObjectId } = require("mongodb");

let schedules;

class ReportScheduleDAO {
  static async injectDB(conn) {
    if (!schedules) {
      schedules = conn.collection("report_schedules");
      await schedules.createIndex({ org: 1, active: 1 });
    }
  }

  static async list(org) {
    return schedules.find({ org: String(org) }).sort({ createdOn: -1 }).toArray();
  }

  static async create(doc) {
    const entry = {
      org: String(doc.org),
      name: doc.name,
      reportType: doc.reportType,
      cron: doc.cron,
      recipients: doc.recipients || [],
      format: doc.format || "pdf",
      active: doc.active !== false,
      lastRunAt: null,
      createdOn: new Date(),
      updatedOn: new Date(),
    };
    const r = await schedules.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async update(org, id, patch) {
    return schedules.findOneAndUpdate(
      { _id: new ObjectId(String(id)), org: String(org) },
      { $set: { ...patch, updatedOn: new Date() } },
      { returnDocument: "after" },
    );
  }

  static async remove(org, id) {
    return schedules.deleteOne({ _id: new ObjectId(String(id)), org: String(org) });
  }

  static async listDue(now = new Date()) {
    return schedules.find({ active: true }).toArray();
  }
}

module.exports = ReportScheduleDAO;
