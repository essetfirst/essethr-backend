const User = require("../../models/User");
const { ObjectId } = require("mongodb");

function toPlain(doc) {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  if (obj._id && typeof obj._id !== "string") {
    obj._id = obj._id.toString();
  }
  return obj;
}

function toObjectId(id) {
  if (!id) return id;
  return typeof id === "string" ? new ObjectId(id) : id;
}

class UserRepository {
  static async findByEmail(email) {
    return UserRepository.findOne({ email });
  }

  static async findById(userId) {
    const doc = await User.findById(userId).lean();
    return toPlain(doc);
  }

  static async findOne(filter) {
    const doc = await User.findOne(filter).lean();
    return toPlain(doc);
  }

  static async findAll() {
    const docs = await User.find({}).lean();
    return docs.map(toPlain);
  }

  static async findByOrg(orgId) {
    const docs = await User.find({ org: String(orgId) }).lean();
    return docs.map(toPlain);
  }

  static async findDuplicate(email, phone) {
    const byEmail = await User.findOne({ email }).lean();
    if (byEmail) return toPlain(byEmail);
    if (phone) {
      const byPhone = await User.findOne({ phone }).lean();
      if (byPhone) return toPlain(byPhone);
    }
    return null;
  }

  static async create(userInfo) {
    try {
      const doc = await User.create({
        ...userInfo,
        name: `${userInfo.firstName} ${userInfo.lastName}`,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
      });
      return { insertedId: doc._id, acknowledged: true };
    } catch (e) {
      return { error: e, server: true };
    }
  }

  static async update(userInfo) {
    try {
      const {
        _id,
        accessToken,
        token,
        tokens,
        tokenAction,
        refreshToken,
        refreshTokens,
        refreshTokenAction,
        ...rest
      } = userInfo;

      const update = { $set: { ...rest, updatedOn: new Date().toISOString() } };

      if (accessToken || token || tokens) {
        update[`$${tokenAction || "push"}`] = {
          tokens: accessToken || token || tokens,
        };
      }

      if (refreshToken || refreshTokens) {
        update[`$${refreshTokenAction || "push"}`] = {
          refreshTokens: refreshToken || refreshTokens,
        };
      }

      const result = await User.updateOne({ _id: toObjectId(_id) }, update);
      if (!result.modifiedCount && !result.matchedCount) {
        return { success: false, error: "Unable to update" };
      }
      return UserRepository.findById(_id);
    } catch (e) {
      return { error: e, server: true };
    }
  }

  static async deleteById(userId) {
    try {
      return await User.deleteOne({ _id: toObjectId(userId) });
    } catch (e) {
      return { error: e, server: true };
    }
  }

  static async recordFailedLogin(userId, { maxAttempts = 5, lockoutMs = 15 * 60 * 1000, ip } = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) return { locked: false, attempts: 0 };

      const attempts = Number(user.failedLoginAttempts || 0) + 1;
      const update = {
        failedLoginAttempts: attempts,
        lastFailedLoginAt: new Date(),
        lastFailedLoginIp: ip || null,
        updatedOn: new Date().toISOString(),
      };

      if (attempts >= maxAttempts) {
        update.lockUntil = new Date(Date.now() + lockoutMs);
      }

      await User.updateOne({ _id: user._id }, { $set: update });
      return {
        locked: attempts >= maxAttempts,
        attempts,
        lockUntil: update.lockUntil || user.lockUntil || null,
      };
    } catch (e) {
      return { locked: false, attempts: 0 };
    }
  }

  static async clearLoginFailures(userId, { ip, at } = {}) {
    try {
      await User.updateOne(
        { _id: toObjectId(userId) },
        {
          $set: {
            failedLoginAttempts: 0,
            lockUntil: null,
            lastLoginAt: at || new Date(),
            lastLoginIp: ip || null,
            updatedOn: new Date().toISOString(),
          },
        },
      );
      return { success: true };
    } catch (e) {
      return { error: e, server: true };
    }
  }
}

module.exports = UserRepository;
