const chalk = require("chalk");
const { ObjectID,ObjectId } = require("mongodb");

const getSlug = require("../utils/getSlug");
const { DEFAULT_ATTENDANCE_POLICY } = require("../constants");

let orgs;

/**
 * @typedef Address Representation of address data
 * @property {number} houseNumber The house number of address
 * @property {number} kebele The kebele number of address
 * @property {number} woreda The woreda number of address
 * @property {String} street The name of street, if any
 * @property {String} subcity Which subcity of a city/town
 * @property {String} city Which city of a state
 * @property {String} state Which state of country
 * @property {String} country
 *
 */

/**
 * @typedef Contact
 * @property {number} phone
 * @property {number} mobile
 * @property {String} fax
 * @property {String} email
 */

/**
 * @typedef Audit
 * @property {User} createdBy The user who made the create action
 * @property {User} updatedBy The user who made the update action
 * @property {DateTime} createdAt The timestamp of create
 * @property {DateTime} updatedAt The timestamp of update
 *
 */

/**
 * @typedef Department
 * @property {String} company The company for which this department belongs
 * @property {Array<String>} names The department's names
 * @property {Array<String>} parents The parents of this department in the company heirarchy
 * @property {Array<Audit>} audits The modifications audit list
 *
 */

/**
 * @typedef Position
 * @property {String} title
 * @property {String} department
 * @property {String} payGrade
 *
 */

/**
 * @typedef PayGrade
 * @property {String} name
 *
 */

/**
 * @typedef LeaveType
 * @property {String} title
 * @property {number} duration
 * @property {String} color
 * @property {Boolean} allowDaysFromPast
 *
 */

/**
 * @typedef OrgInfo
 * @property {String} name The org's name
 * @property {String} logo The org logo
 * @property {String} branch Which branch of org
 * @property {String} description A brief about org
 * @property {Array<Address>} addresses Address list of org
 * @property {Array<Contact>} contacts Contact list of org
 * @property {Array<Department>} departments All the departments in the org
 * @property {Array<Position>} positions All the positions that belong to the org
 * @property {Array<PayGrade>} payGrades The pay grades available in the org
 * @property {Array<LeaveType>} leaveTypes The type of leaves conceded by org
 */

class OrgDAO {
  static async injectDB(db) {
    try {
      orgs = db.collection("orgs", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "phone", "address"],
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
              logo: {
                bsonType: "string",
                description: "must be a string if the field exists",
              },
              branch: {
                bsonType: "string",
                description: "must be a string if the field exists",
              },
              phone: {
                bsonType: "string",
                description: "must be a string and is required",
              },
              address: {
                bsonType: "object",
                required: ["city", "region"],
                properties: {
                  woreda: {
                    bsonType: "string",
                    description: "must be a string if the field exists",
                  },
                  city: {
                    bsonType: "string",
                    description: "must be a string and is required",
                  },
                  region: {
                    bsonType: "string",
                    description: "must be a string and is required",
                  },
                },
                description: "must be an object and is required",
              },
              email: {
                bsonType: "string",
                description: "must be a string if the field exists",
              },
              poBox: {
                bsonType: "string",
                description: "must be a string if the field exists",
              },
            },
          },
        },
      });
      await orgs.createIndex({ slug: 1 });
    } catch (e) {
      console.error(chalk.redBright(`Error creating handle for OrgDAO, ${e}`));
    }
  }

  static async createOrg(orgInfo) {
    try {
      const { name, attendancePolicy, ...rest } = orgInfo;
      // Fetch ethiopian holidays & assign it to org
      const newOrgInfo = {
        slug: getSlug(name),
        name,
        attendancePolicy: attendancePolicy || DEFAULT_ATTENDANCE_POLICY,
        // holidays: [],
        ...rest,
      };
      return await orgs.insertOne(newOrgInfo);
    } catch (e) {
      if (String(e).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "An org with the given name already exists." };
      }

      console.error(chalk.redBright(`Error creating org record, ${e}`));
      return { error: e, server: true };
    }
  }

  static async getOrgs({ page, limit, ...rest } = {}) {
    try {
      let query = { ...rest };
      const pipeline = [
        { $match: query },
        {
          $project: {
            slug: 1,
            name: 1,
            logo: 1,
            branch: 1,
            email: 1,
            phone: 1,
            address: 1,
            poBox: 1,
            attendancePolicy: 1,
            _id: {
              $toString: "$_id",
            },
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "org",
            as: "departments",
          },
        },
        {
          $lookup: {
            from: "positions",
            localField: "_id",
            foreignField: "org",
            as: "positions",
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "org",
            as: "employees",
          },
        },
        {
          $lookup: {
            from: "leave_types",
            localField: "_id",
            foreignField: "org",
            as: "leaveTypes",
          },
        },
        {
          $lookup: {
            from: "holidays",
            localField: "_id",
            foreignField: "org",
            as: "holidays",
          },
        },
      ];
      return await orgs.aggregate(pipeline).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Error fetching all org records, ${e}`));
      return { error: e, server: true };
    }
  }

  static async getOrgById(orgId) {
    try {
      let query = { _id: ObjectId(orgId) };
      const pipeline = [
        { $match: query },
        {
          $project: {
            slug: 1,
            name: 1,
            logo: 1,
            branch: 1,
            email: 1,
            phone: 1,
            address: 1,
            poBox: 1,
            attendancePolicy: 1,
            _id: {
              $toString: "$_id",
            },
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "org",
            as: "departments",
          },
        },
        {
          $lookup: {
            from: "positions",
            localField: "_id",
            foreignField: "org",
            as: "positions",
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "org",
            as: "employees",
          },
        },
        {
          $lookup: {
            from: "leave_types",
            localField: "_id",
            foreignField: "org",
            as: "leaveTypes",
          },
        },
        {
          $lookup: {
            from: "holidays",
            localField: "_id",
            foreignField: "org",
            as: "holidays",
          },
        },
      ];

      const result = await orgs.aggregate(pipeline).toArray();
      if (Array.isArray(result) && result.length > 0) {
        return result[0];
      }
      return result;
    } catch (e) {
      console.error(chalk.redBright(`Error fetching org record by id, ${e}`));
      return { error: e, server: true };
    }
  }

  static async getOrgBySlug(slug) {
    try {
      let query = { slug };
      return await orgs.findOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Error fetching org record by slug, ${e}`));
      return { error: e, server: true };
    }
  }

  static async updateOrg(orgInfo) {
    try {
      const { _id, slug, ...rest } = orgInfo;
      let query = { _id: ObjectId(_id) };
      let update = { $set: { ...rest } };
      return await orgs.updateOne(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Error updating org record, ${e}`));
      return { error: e, server: true };
    }
  }

  static async deleteOrg(orgId) {
    try {
      // TODO: delete all employees, departments, positions, policies, users, etc
      let query = { _id: ObjectId(orgId) };
      return await orgs.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Error deleting org record, ${e}`));
      return { error: e, server: true };
    }
  }

  static async deleteAllOrgs() {
    try {
      // TODO: delete all employees, departments, positions, policies, users, etc
      return await orgs.deleteMany();
    } catch (e) {
      console.error(chalk.redBright(`Error deleting all orgs record, ${e}`));
      return { error: e, server: true };
    }
  }

  static async getAttendancePolicy(id) {
    try {
      let query = { _id: ObjectId(id) };
      const result = await orgs.findOne(query);
      return result.attendancePolicy;
    } catch (e) {
      console.error(
        chalk.redBright(`Error fetching org attendance policy, ${e}`)
      );
      return { error: e, server: true };
    }
  }

  static async updateAttendancePolicy(id, attendancePolicy) {
    try {
      let query = { _id: ObjectId(id) };
      let update = {
        $set: {
          attendancePolicy: {
            ...DEFAULT_ATTENDANCE_POLICY,
            ...attendancePolicy,
          },
        },
      };
      return await orgs.updateOne(query, update);
    } catch (e) {
      console.error(
        chalk.redBright(`Error updating org attendance policy, ${e}`)
      );
      return { error: e, server: true };
    }
  }

  // static async addHoliday(id, holiday) {
  //   try {
  //     let query = { _id: ObjectID(id) };
  //     // TODO: push to embedded MongoDB NodeJS native driver syntax
  //     let update = {
  //       $push: {
  //         holidays: holiday,
  //       },
  //     };
  //     return await orgs.updateOne(query, update);
  //   } catch (e) {
  //     console.error(
  //       chalk.redBright(`Error adding holiday, ${e}`)
  //     );
  //     return { error: e, server: true };
  //   }
  // }

  // static async updateHoliday(id, holiday) {
  //   try {
  //     let query = { _id: ObjectID(id) };
  //     // TODO: update embedded array MongoDB NodeJS native driver syntax
  //     let update = {
  //       $push: {
  //         holidays: holiday,
  //       },
  //     };
  //     return await orgs.updateOne(query, update);
  //   } catch (e) {
  //     console.error(
  //       chalk.redBright(`Error updating holiday, ${e}`)
  //     );
  //     return { error: e, server: true };
  //   }
  // }

  //
  //
  //
  // static async isHoliday(id, date) {
  //   try {
  //     let query = { _id: ObjectID(id), date: getDateString(date) };
  //     return await orgs.findOne(query);
  //   } catch (e) {
  //     console.error(
  //       chalk.redBright(`Error checking holiday, ${e}`)
  //     );
  //     return { error: e, server: true };
  //   }
  // }

  // static async removeHoliday(id, holiday) {
  //   try {
  //     let query = { _id: ObjectID(id) };
  //     // TODO: remove from embedded array MongoDB NodeJS native driver syntax
  //     let update = {
  //       $push: {
  //         holidays: holiday,
  //       },
  //     };
  //     return await orgs.updateOne(query, update);
  //   } catch (e) {
  //     console.error(
  //       chalk.redBright(`Error removing holiday, ${e}`)
  //     );
  //     return { error: e, server: true };
  //   }
  // }

  // static async addDepartment(departmentInfo) {}
  // static async addPosition(positionInfo) {}
  // static async addPayGrade(payGradeInfo) {}
  // static async addLeaveType(leaveTypeInfo) {}
}

module.exports = OrgDAO;
