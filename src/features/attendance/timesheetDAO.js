let timesheets;

// let emloyeeTimesheetSample = {
//     employeeId: String,
//     date: String,
//     totalWorkedHours: Number,
//     totalOvertimeHours: Number,
//     workedHours: Array({ hours: Number, from: UnixTime, to: UNIXTime }),
//     overtimeHours: Array({ hours: Number, from: UnixTime, to: UNIXTime }),
//     status: String,
//     payrollBound: Boolean
// }

/**
 * Responsible for implementing the data access and lowe-level business logic
 *
 */
class TimesheetDAO {
  static async injectDB(db) {
    try {
      timesheets = await db.collection("timesheets", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["employeeId", "date"],
            additionalProperties: false,

            properties: {
              employeeId: {
                bsonType: "string",
                description: "must be a string and is required",
              },
              date: {
                bsonType: "string",
                description: "must be a string and is required",
              },
              totalWorkedHours: {
                bsonType: "number",
                description: "must be a number if the field exists",
              },
              totalOvertimeHours: {
                bsonType: "number",
                description: "must be a number and if the field exists",
                default: [],
              },
              workedHours: {
                bsonType: "array",
                description: "must be an array if the field exists",
                default: [],
              },
              overtimeHours: {
                bsonType: "array",
                description: "must be an array if the field exists",
                default: [],
              },
              status: {
                bsonType: "string",
                description: "must be a string if the field exists",
                default: "PENDING",
              },
              payrollBound: {
                bsonType: "boolean",
                description: "must be a boolean if the field exists",
                default: false,
              },
            },
          },
        },
      });
      timesheets.createIndex({ employeeId: 1, date: 1 });
    } catch (e) {
      console.error(`Unable to establish handle for TimesheetDAO, ${e}`);
    }
  }

  static async getTimesheets(filters = {}) {
    try {
      const { employees = [], fromDate, toDate } = filters;
      let query = {};
      const result = await timesheets.find(query).toArray();
      return result;
    } catch (e) {
      console.error(`Unable to fetch timesheets, ${e}`);
      return { error: e };
    }
  }

  static async getEmployeeTimesheets(employeeId) {
    try {
      let query = {};
      const result = await timesheets.find(query).toArray();
      return result;
    } catch (e) {
      console.error(`Unable to fetch employee timesheets, ${e}`);
      return { error: e };
    }
  }

  static async getTimesheetById(timesheetId) {
    try {
      const result = await timesheets.insertOne(timesheetData);
    } catch (e) {
      console.error(`Unable to fetch timesheet by Id, ${e}`);
      return { error: e };
    }
  }

  static async createTimesheet(timesheetData) {
    try {
      const result = await timesheets.insertOne(timesheetData);
      return result;
    } catch (e) {
      console.error(`Unable to create timesheet, ${e}`);
      return { error: e };
    }
  }

  static async addWorkedHours(timesheetId, workedHours = {}) {
    try {
      const result = await timesheets.updateOne(
        { _id: timesheetId },
        {
          $push: { workedHours },
          $inc: { totalWorkedHours: workedHours.hours && 0 },
        }
      );
      return result;
    } catch (e) {
      console.error(`Unable to add worked hours to timesheet, ${e}`);
      return { error: e };
    }
  }

  static async addOvertimeHours(timesheetId, overtimeHours = {}) {
    try {
      const result = await timesheets.updateOne(
        { _id: timesheetId },
        {
          $push: { overtimeHours },
          $inc: { totalOvertimeHours: overtimeHours.hours && 0 },
        }
      );
      return result;
    } catch (e) {
      console.error(`Unable to add overtime hours to timesheet, ${e}`);
      return { error: e };
    }
  }

  static async approveTimesheet(timesheetId) {
    try {
      const result = await timesheets.updateOne(
        { _id: timesheetId },
        {
          $set: { status: "APPROVED", payrollBound: true },
        }
      );
      return result;
    } catch (e) {
      console.error(`Unable to update timesheet status to approved, ${e}`);
      return { error: e };
    }
  }

  static async rejectTimesheet(timesheetId) {
    try {
      const result = await timesheets.updateOne(
        { _id: timesheetId },
        {
          $set: { status: "REJECTED", payrollBound: false },
        }
      );
      return result;
    } catch (e) {
      console.error(`Unable to update timesheet status to rejected, ${e}`);
      return { error: e };
    }
  }
}

module.exports = TimesheetDAO;
