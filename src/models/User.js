const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    name: String,
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    phone: String,
    org: String,
    employeeId: String,
    role: { type: String, required: true, default: "USER" },
    activated: Boolean,
    tokens: [String],
    refreshTokens: [String],
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    lastFailedLoginAt: Date,
    lastFailedLoginIp: String,
    lastLoginAt: Date,
    lastLoginIp: String,
    createdOn: String,
    updatedOn: String,
  },
  {
    collection: "users",
    strict: false,
    versionKey: false,
  },
);

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret._id = ret._id?.toString?.() ?? ret._id;
    return ret;
  },
});

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
