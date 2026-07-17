const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    org: String,
    orgId: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    status: String,
    department: String,
    position: String,
    job: mongoose.Schema.Types.Mixed,
    contact: mongoose.Schema.Types.Mixed,
    address: mongoose.Schema.Types.Mixed,
    createdOn: String,
    updatedOn: String,
  },
  {
    collection: "employees",
    strict: false,
    versionKey: false,
  },
);

employeeSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret._id = ret._id?.toString?.() ?? ret._id;
    return ret;
  },
});

module.exports =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
