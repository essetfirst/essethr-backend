const { ObjectId } = require("mongodb");

let courses;
let records;

class TrainingDAO {
  static async injectDB(conn) {
    if (!courses) {
      courses = conn.collection("training_courses");
      records = conn.collection("training_records");
      await records.createIndex({ org: 1, employeeId: 1 });
    }
  }

  static async listCourses(org) {
    return courses.find({ org: String(org) }).sort({ title: 1 }).toArray();
  }

  static async createCourse(doc) {
    const entry = {
      org: String(doc.org), title: doc.title, description: doc.description || "",
      durationHours: doc.durationHours || 0, category: doc.category || "general",
      createdOn: new Date(),
    };
    const r = await courses.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async assign(doc) {
    const entry = {
      org: String(doc.org), employeeId: String(doc.employeeId),
      courseId: String(doc.courseId), status: "assigned",
      progress: 0, assignedOn: new Date(), completedOn: null,
      certificationExpiry: doc.certificationExpiry || null,
    };
    const r = await records.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async listRecords(org, employeeId) {
    const filter = { org: String(org) };
    if (employeeId) filter.employeeId = String(employeeId);
    return records.find(filter).sort({ assignedOn: -1 }).toArray();
  }

  static async updateProgress(id, progress, status) {
    const update = { progress, updatedOn: new Date() };
    if (status) update.status = status;
    if (status === "completed") update.completedOn = new Date();
    return records.findOneAndUpdate(
      { _id: new ObjectId(String(id)) },
      { $set: update },
      { returnDocument: "after" },
    );
  }
}

module.exports = TrainingDAO;
