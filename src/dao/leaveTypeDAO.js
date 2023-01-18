const { ObjectID,ObjectId} = require("mongodb");

let leaveTypes;

/**
 * @typedef LeaveTypeInfo leaveType data representation
 * @property {String} title The leave type name
 * @property {Number} duration This leaveType's parent in the hierarchy
 * @property {String} color The unique color associated with the leave type for visual purposes
 * @property {Boolean} allowDaysFromPast Can a leave be allowed for dates already in the past
 */
class LeaveTypeDAO {
  static async injectDB(db) {
    try {
      leaveTypes = await db.collection("leave_types", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["title", "duration"],
            additionalProperties: false,
            properties: {
              title: {
                bsonType: "string",
                description: "must be a string and is required",
              },
              duration: {
                bsonType: "string",
                description: "must be a a number and is required",
              },
              color: {
                bsonType: "string",
                description: "must be a string if the field exists",
              },
              allowDaysFromPast: {
                bsonType: "boolean",
                description: "must be a boolean and if the field exists",
              },
            },
          },
        },
      });
      await leaveTypes.createIndex({ title: 1 });
    } catch (e) {
      console.error(`Unable establish handle for LeaveTypeDAO, ${e}`);
    }
  }

  static async get(filter = {}) {
    try {
      console.log(filter);
      const { org, ...rest } = filter;
      let query = { ...rest };
      console.log(org);
      console.log(query);
      if (org) {
        query["org"] = String(org);
      }

      return await leaveTypes.find(query).toArray();
    } catch (e) {
      console.error(`Error fetching leave types, ${e}`);
      return { error: e };
    }
  }

  static async getById(leaveTypeId) {
    try {
      let query = { _id: ObjectId(leaveTypeId) };
      return await leaveTypes.findOne(query);
    } catch (e) {
      console.error(`Error fetching leave types, ${e}`);
      return { error: e };
    }
  }

  /**
   * Saves a new leave type into the database.
   * @param {leaveTypeInfo} leaveTypeInfo
   */
  static async add(leaveTypeInfo) {
    try {
      return await leaveTypes.insertOne(leaveTypeInfo);
    } catch (e) {
      if (String(e).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "A leave type with the given name already exists." };
      }
      console.error(
        `Error occurred while creating new leave type record, ${e}`
      );
      return { error: e, server: true };
    }
  }

  static async update({ _id, ...rest }) {
    try {
      console.log(_id);
      const query = { _id: ObjectId(_id) };
      const update = { $set: { ...rest } };
      console.log(query, update);
      return await leaveTypes.updateOne(query, update);
    } catch (e) {
      console.error(`Error occurred while updating leave type record, ${e}`);
      return { error: e, server: true };
    }
  }

  static async delete({ _id, ...rest }) {
    try {
      const query = { _id: ObjectId(_id), ...rest };
      return await leaveTypes.deleteOne(query);
    } catch (e) {
      console.error(`Error occurred while deleting leave type record, ${e}`);
      return { error: e, server: true };
    }
  }

  static async deleteAll() {
    try {
      return await leaveTypes.deleteMany();
    } catch (e) {
      console.error(
        `Error occurred while deleting all leave type records, ${e}`
      );
      return { error: e, server: true };
    }
  }
  static async getLeaveById({_id}) {
    try {
      return await leaveTypes.findOne({_id:ObjectId(_id)});
    } catch (e) {
      console.error(
        `Error occurred while deleting all leave type records, ${e}`
      );
      return { error: e, server: true };
    }
  }
}

module.exports = LeaveTypeDAO;
