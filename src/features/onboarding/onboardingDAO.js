const { ObjectId } = require("mongodb");

let templates;
let instances;

class OnboardingDAO {
  static async injectDB(conn) {
    if (!templates) {
      templates = conn.collection("onboarding_templates");
      instances = conn.collection("onboarding_instances");
      await instances.createIndex({ org: 1, employeeId: 1 });
    }
  }

  static async listTemplates(org) {
    return templates.find({ org: String(org) }).toArray();
  }

  static async createTemplate(doc) {
    const entry = {
      org: String(doc.org), name: doc.name,
      tasks: doc.tasks || [], // [{ title, dueDays, required }]
      createdOn: new Date(),
    };
    const r = await templates.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async startInstance(doc) {
    const template = doc.templateId
      ? await templates.findOne({ _id: new ObjectId(String(doc.templateId)) })
      : null;
    const startDate = new Date();
    const tasks = (template?.tasks || doc.tasks || []).map((t, i) => {
      const dueDays = t.dueDays != null ? Number(t.dueDays) : null;
      return {
        ...t,
        id: i,
        completed: false,
        completedOn: null,
        assigneeRole: t.assigneeRole || "HR_MANAGER",
        dueDate: dueDays != null && !Number.isNaN(dueDays)
          ? new Date(startDate.getTime() + dueDays * 86400000)
          : null,
      };
    });
    const entry = {
      org: String(doc.org), employeeId: String(doc.employeeId),
      templateId: doc.templateId ? String(doc.templateId) : null,
      tasks, status: "in_progress", probationEnd: doc.probationEnd || null,
      progress: 0, createdOn: startDate, startedOn: startDate,
    };
    const r = await instances.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async listInstances(org, employeeId) {
    const filter = { org: String(org) };
    if (employeeId) filter.employeeId = String(employeeId);
    return instances.find(filter).sort({ createdOn: -1 }).toArray();
  }

  static async completeTask(instanceId, taskId) {
    const inst = await instances.findOne({ _id: new ObjectId(String(instanceId)) });
    if (!inst) return null;
    const tasks = inst.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: true, completedOn: new Date() } : t,
    );
    const done = tasks.filter((t) => t.completed).length;
    const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    const status = progress === 100 ? "completed" : "in_progress";
    return instances.findOneAndUpdate(
      { _id: inst._id },
      { $set: { tasks, progress, status, updatedOn: new Date() } },
      { returnDocument: "after" },
    );
  }
}

module.exports = OnboardingDAO;
