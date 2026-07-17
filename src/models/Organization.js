const mongoose = require("mongoose");

const orgSchema = new mongoose.Schema(
  {
    slug: String,
    name: String,
    companySlug: String,
    branch: String,
    isMainBranch: Boolean,
    phone: String,
    email: String,
    address: String,
    poBox: String,
    logo: String,
    attendancePolicy: mongoose.Schema.Types.Mixed,
    departments: [mongoose.Schema.Types.Mixed],
    positions: [mongoose.Schema.Types.Mixed],
    leaveTypes: [mongoose.Schema.Types.Mixed],
    holidays: [mongoose.Schema.Types.Mixed],
    createdBy: String,
  },
  {
    collection: "orgs",
    strict: false,
    versionKey: false,
  },
);

orgSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret._id = ret._id?.toString?.() ?? ret._id;
    return ret;
  },
});

module.exports =
  mongoose.models.Organization || mongoose.model("Organization", orgSchema);
