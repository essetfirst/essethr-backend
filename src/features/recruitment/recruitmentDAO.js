const { ObjectId } = require("mongodb");

let jobs;
let candidates;

class RecruitmentDAO {
  static async injectDB(conn) {
    if (!jobs) {
      jobs = conn.collection("job_postings");
      candidates = conn.collection("candidates");
      await jobs.createIndex({ org: 1, status: 1 });
      await candidates.createIndex({ org: 1, jobId: 1, stage: 1 });
    }
  }

  static async listJobs(org) {
    return jobs.find({ org: String(org) }).sort({ createdOn: -1 }).toArray();
  }

  static async createJob(doc) {
    const entry = {
      org: String(doc.org), title: doc.title, department: doc.department || "",
      description: doc.description || "", status: doc.status || "open",
      location: doc.location || "", createdOn: new Date(),
    };
    const r = await jobs.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async listCandidates(org, jobId) {
    const filter = { org: String(org) };
    if (jobId) filter.jobId = String(jobId);
    return candidates.find(filter).sort({ createdOn: -1 }).toArray();
  }

  static async createCandidate(doc) {
    const email = String(doc.email || "").trim().toLowerCase();
    if (email) {
      const dup = await candidates.findOne({ org: String(doc.org), email });
      if (dup) return { error: "duplicate", existingId: dup._id };
    }
    const entry = {
      org: String(doc.org), jobId: String(doc.jobId), name: doc.name,
      email: doc.email, phone: doc.phone || "", resumePath: doc.resumePath || "",
      stage: doc.stage || "applied", score: doc.score || null, rating: doc.rating || null,
      notes: doc.notes || "",
      stageHistory: [{ stage: doc.stage || "applied", at: new Date(), by: doc.createdBy || null }],
      createdOn: new Date(),
    };
    const r = await candidates.insertOne(entry);
    return { ...entry, _id: r.insertedId };
  }

  static async updateCandidateStage(id, stage, score, rating, meta = {}) {
    const existing = await candidates.findOne({ _id: new ObjectId(String(id)) });
    if (!existing) return null;
    const update = {
      stage,
      updatedOn: new Date(),
      stageHistory: [
        ...(existing.stageHistory || []),
        { stage, at: new Date(), by: meta.by || null, note: meta.note || null },
      ],
    };
    if (score != null) update.score = score;
    if (rating != null) update.rating = rating;
    if (meta.notes != null) update.notes = meta.notes;
    return candidates.findOneAndUpdate(
      { _id: new ObjectId(String(id)) },
      { $set: update },
      { returnDocument: "after" },
    );
  }

  static async updateCandidate(id, patch) {
    return candidates.findOneAndUpdate(
      { _id: new ObjectId(String(id)) },
      { $set: { ...patch, updatedOn: new Date() } },
      { returnDocument: "after" },
    );
  }
}

module.exports = RecruitmentDAO;
