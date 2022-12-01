const { ObjectID } = require("mongodb");

let departments;

/**
 * @typedef DepartmentInfo Department data representation
 * @property {String} slug A unique string representation of department name
 * @property {String} name The department's name
 * @property {String} parent This department's parent in the hierarchy
 * @property {String} org The organization this department is associated with
 * @property {String} location Where the department is located
 */
class DepartmentDAO {
  static async injectDB(db) {
    try {
      departments = await db.collection("departments", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["slug", "name", "org"],
            additionalProperties: false,
            properties: {
              slug: {
                bsonType: "string",
                description: "must be a unique string and is required",
              },
              name: {
                bsonType: "string",
                description: "must be a unique string and is required",
              },
              parent: {
                bsonType: "string",
                description: "must be a string if the field exists",
              },
              org: {
                bsonType: "string",
                description: "must be a string and is required",
              },
              location: {
                bsonType: "string",
                description: "must be a string and is required",
              },
            },
          },
        },
      });
      await departments.createIndex({ slug: 1 });
    } catch (e) {
      console.error(`Unable establish handle for DepartmentDAO, ${e}`);
    }
  }

  static async get(filter = {}) {
    try {
      const { org, ...rest } = filter;
      let query = { ...rest };

      if (org) {
        query["org"] = ObjectID(org);
      }

      return await departments.find(query).toArray();
    } catch (e) {
      console.error(`Error fetching departments, ${e}`);
      return { error: e };
    }
  }

  static async getById(departmentId) {
    try {
      let query = { _id: ObjectID(departmentId) };
      return await departments.findOne(query);
    } catch (e) {
      console.error(`Error fetching departments, ${e}`);
      return { error: e };
    }
  }

  /**
   * Saves a new company into the database.
   * @param {DepartmentInfo} deptInfo
   */
  static async create(deptInfo) {
    try {
      const { name, ...rest } = deptInfo;
      const newDeptInfo = {
        slug: name
          .split()
          .map((part) => part.toLowerCase())
          .join("-"),
        name,
        ...rest,
      };

      return await departments.insertOne(newDeptInfo);
    } catch (e) {
      if (String(e).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "A department with the given name already exists." };
      }
      console.error(
        `Error occurred while creating new department record, ${e}`
      );
      return { error: e, server: true };
    }
  }

  static async update({ _id, ...rest }) {
    try {
      const query = { _id: ObjectID(_id) };
      const update = { $set: { ...rest } };
      return await departments.updateOne(query, update);
    } catch (e) {
      console.error(`Error occurred while updating department record, ${e}`);
      return { error: e, server: true };
    }
  }

  static async delete({ _id, ...rest }) {
    try {
      const query = { _id: ObjectID(_id), ...rest };
      return await departments.deleteOne(query);
    } catch (e) {
      console.error(`Error occurred while deleting department record, ${e}`);
      return { error: e, server: true };
    }
  }

  static async deleteAll() {
    try {
      return await departments.deleteMany();
    } catch (e) {
      console.error(
        `Error occurred while deleting all department records, ${e}`
      );
      return { error: e, server: true };
    }
  }
}

module.exports = DepartmentDAO;
