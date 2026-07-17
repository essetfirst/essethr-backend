const chalk = require("chalk");
const { ObjectID,ObjectId } = require("mongodb");
// const EmployeeDAO = require("../employees/employeeDAO");
let users;

class UserDAO {
  static async injectDB(db) {
    try {
      users = db.collection("users", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["firstName", "lastName", "email", "password", "role"],
            additionalProperties: false,
            properties: {
              firstName: {
                bsonType: "string",
                description: "must be a string and is required",
              },
              lastName: {
                bsonType: "string",
                description: "must be a string and is required",
              },
              email: {
                bsonType: "string",
                description: "must be a string and is required",
              },
              password: {
                bsonType: "string",
                description: "must be a string and is required",
              },
              phone: {
                bsonType: "string",
                description: "must be a string if field exists",
              },
              org: {
                bsonType: "string",
                description: "must be a string if field exists",
              },
              employeeId: {
                bsonType: "string",
                description: "must be a string if field exists",
              },
              role: {
                bsonType: "string",
                description: "must be a string and is required",
                default: "USER",
              },
              activated: {
                bsonType: "boolean",
                description: "must be a boolean if field exists",
              },
              accessToken: {
                bsonType: "string",
                description: "must be an string if field exists",
              },
            },
          },
        },
      });
      await users.createIndex({ email: 1 }, { unique: true });
      await users.createIndex({ phone: 1 });
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to establish handle for UserDAO, ${e.stack}`)
      );
    }
  }

  static async createUser(userInfo) {
    try {
      return await users.insertOne({
        ...userInfo,
        name: `${userInfo.firstName} ${userInfo.lastName}`,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
      });
    } catch (e) {
      console.error(chalk.redBright(`Error creating user, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async checkDuplicateEmailOrPhone(email, phone) {
    try {
      return (await users.findOne({ email })) || (phone && (await orgs.findOne({phone})));
    } catch (e) {
      console.error(
        chalk.redBright(`Error checking duplicate email or phone, ${e.stack}`)
      );
      return { error: e, server: true };
    }
  }

  static async getUsers() {
    try {
      return await users.find({}).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Error fetching users, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async getUsersByOrg(orgId) {
    try {
      return await users.find({ org: String(orgId) }).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Error fetching org users, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async getUser(filterQuery = {}) {
    try {
      const { accessToken, token, tokens, ...rest } = filterQuery;
      let query = { ...rest };
      // console.log(accessToken,token,tokens)
      if (accessToken || token || tokens) {
        query = { ...query, tokens: accessToken || token || tokens };
      }
      return await users.findOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Error fetching single user, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async getUserById(userId) {
    try {
      return await users.findOne({ _id: new ObjectId(userId) });
    } catch (e) {
      console.error(chalk.redBright(`Error fetching user by id, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async getUserByEmployeeId(employeeId) {
    try {
      return await users.findOne({ employeeId: String(employeeId) });
    } catch (e) {
      console.error(
        chalk.redBright(`Error fetching user by employee id, ${e.stack}`)
      );
      return { error: e, server: true };
    }
  }

  static async updateUser(userInfo) {
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

      const query = { _id: new ObjectId(_id) };
      let update = {
        $set: { ...rest, updatedOn: new Date().toISOString() },
      };

      if (accessToken || token || tokens) {
        update = {
          ...update,
          [`$${tokenAction || "push"}`]: {
            tokens: accessToken || token || tokens,
          },
        };
      }

      if (refreshToken || refreshTokens) {
        update = {
          ...update,
          [`$${refreshTokenAction || "push"}`]: {
            refreshTokens: refreshToken || refreshTokens,
          },
        };
      }

      const result = await users.updateOne(query, update);
      if (!result.modifiedCount) {
        return { success: false, error: "Unable to update" };
      }
      var updatedUser = await users.findOne(query);
      return updatedUser;
    } catch (e) {
      console.error(chalk.redBright(`Error updating user, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async deleteUser(userId) {
    try {
      const query = { _id: new ObjectId(userId) };
      return await users.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Error deleting user, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async recordFailedLogin(userId, { maxAttempts = 5, lockoutMs = 15 * 60 * 1000, ip } = {}) {
    try {
      const user = await users.findOne({ _id: new ObjectId(userId) });
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

      await users.updateOne({ _id: user._id }, { $set: update });
      return {
        locked: attempts >= maxAttempts,
        attempts,
        lockUntil: update.lockUntil || user.lockUntil || null,
      };
    } catch (e) {
      console.error(chalk.redBright(`Error recording failed login, ${e.stack}`));
      return { locked: false, attempts: 0 };
    }
  }

  static async clearLoginFailures(userId, { ip, at } = {}) {
    try {
      await users.updateOne(
        { _id: new ObjectId(userId) },
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
      console.error(chalk.redBright(`Error clearing login failures, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async deleteAllUsers() {
    try {
      const query = {};
      return await users.deleteMany(query);
    } catch (e) {
      console.error(chalk.redBright(`Error deleting all users, ${e.stack}`));
      return { error: e, server: true };
    }
  }
}

module.exports = UserDAO;
