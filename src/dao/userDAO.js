const chalk = require("chalk");
const { ObjectID,ObjectId } = require("mongodb");
// const EmployeeDAO = require("./employeeDAO");
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
      await users.createIndex({ email: 1, phone: 1 });
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
      // const pipeline = [
      //   {
      //     $match: {},
      //   },
      //   {
      //     $lookup: {
      //       $from: "employees",
      //       $localField: "$employeeId",
      //       $foreignField: "_id",
      //       $as: "employee",
      //     },
      //   },
      // ];
      // return await users.aggregate(pipeline).toArray();
      return await users.find({}).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Error fetching users, ${e.stack}`));
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
      console.log(query);
      return await users.findOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Error fetching single user, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async getUserById(userId) {
    try {
      return await users.findOne({ _id: ObjectId(userId) });
    } catch (e) {
      console.error(chalk.redBright(`Error fetching user by id, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async updateUser(userInfo) {
    try {
      const { _id, accessToken, token, tokens, tokenAction, ...rest } = userInfo;

      const query = { _id: ObjectId(_id) };
      let update = {
        $set: { ...rest, updatedOn: new Date().toISOString() },
      };

      if (accessToken || token || tokens) {
        update = {
          ...update,
          [`$${tokenAction}`]: { tokens: accessToken || token || tokens },
        };
      }

      console.log("Query: ", query," Rest ",rest);
      console.log("Update: ", update);


      const result = await users.updateOne(query, update);
      console.log(result)
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
      const query = { _id: ObjectId(userId) };
      return await users.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Error deleting user, ${e.stack}`));
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
