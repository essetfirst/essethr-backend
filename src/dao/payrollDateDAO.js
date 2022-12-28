const chalk = require("chalk");
const { ObjectId, ObjectID } = require("mongodb");

let employeeDates;
/**
 * @typedef PayrollDateInfo
 * @property {number} employeeId The id of the employee whose this calendar date entry is
 * @property {Date} date The date of entry
 * @property {number} attendanceHours The number of hours counted as working
 * @property {number} leaveHours The number of hours accrued as leave
 * @property {number} holidayHours The number of hours allowed as holiday
 * @property {number} overtimeHours The number of hours worked in overtime
 */

class PayrollDateDAO {
  /**
   * Instantiates this DAO by creating a link to the database layer collection
   * @param {object} db
   */
  static async injectDB(db) {
    try {
      employeeDates = await db.collection("employee_dates");
      employeeDates.createIndex({ employeeId: 1, date: 1 });
    } catch (e) {
      console.error(
        `Unable to establish handle for ${chalk.black(
          chalk.bgWhite("PayrollDateDAO")
        )}, ${e}`
      );
    }
  }

  static async addDates(dates) {
    try {
      if (!Array.isArray(dates)) {
        throw new Error("dates must be an array");
      }

      return await employeeDates.insert(dates);
    } catch (e) {
      console.error(`Unable to add dates, ${e}`);
      return { error: e };
    }
  }

  /**
   * Adds a new in-payroll computable date info
   * @param {PayrollDateInfo} dateInfo The employee daily payroll data to be added
   */
  static async addDate(dateInfo) {
    try {
      const {
        employeeId,
        date,
        attendanceHours = 0,
        leaveHours = 0,
        holidayHours = 0,
        overtimeHours = 0,
        ...rest
      } = dateInfo;

      let fieldsToUpdate = {};
      // if (attendanceHours) {
      //   fieldsToUpdate = { ...fieldsToUpdate, attendanceHours };
      // }
      // if (leaveHours) {
      //   fieldsToUpdate = { ...fieldsToUpdate, leaveHours };
      // }
      // if (overtimeHours) {
      //   fieldsToUpdate = { ...fieldsToUpdate, overtimeHours };
      // }
      // if (holidayHours) {
      //   fieldsToUpdate = { ...fieldsToUpdate, holidayHours };
      // }
      // OR the shorter way below
      [
        { attendanceHours },
        { leaveHours },
        { overtimeHours },
        { holidayHours },
      ].forEach((field) => {
        if (Object.values(field)[0]) {
          fieldsToUpdate = { ...fieldsToUpdate, ...field };
        }
      });
      return await employeeDates.updateOne(
        { employeeId, date: new Date(date).toISOString() },
        {
          $set: {
            datetime: new Date(date).getDate(),
            ...fieldsToUpdate,
            paidHoursInDays: (attendanceHours + leaveHours + holidayHours) / 8,
            ...rest,
          },
        },
        { upsert: true }
      );
    } catch (e) {
      console.error(`Unable to add employee date record, ${e}`);
      return { error: e };
    }
  }

  static async getDates(filters = {}) {
    try {
      const { employeeId, fromDate, toDate } = filters;
      let query = {};
      if (employeeId && ObjectId.isValid(employeeId)) {
        query = { employeeId };
      }
      if (fromDate) {
        query["date"] = { $gte: fromDate };
      }
      if (toDate) {
        query["date"] = { ...query["date"], $lte: toDate };
      }
      return await employeeDates.find(query).toArray();
    } catch (e) {
      console.error(chalk.red(`Unable to fetch employee date records, ${e}`));
      return { error: e };
    }
  }

  static async generateSummary(filters = {}) {
    try {
      const { employees, fromDate, toDate } = filters;
      let query = {};
      if (employees && Array.isArray(employees) && employees.length > 0) {
        query = { employeeId: { $in: employees } };
      }
      if (fromDate) {
        query["date"] = { $gte: fromDate };
      }
      if (toDate) {
        query["date"] = { ...query["date"], $lte: toDate };
      }

      return await employeeDates
        .aggregate([
          { $match: query },
          { $set: { employeeId: { $toObjectId: "$employeeId" } } },
          {
            $group: {
              _id: "$employeeId",
              totalWorkedHours: { $sum: "$attendanceHours" },
              totalLeaveHours: { $sum: "$leaveHours" },
              totalHolidayHours: { $sum: "$holidayHours" },
              totalOvertimeHours: { $sum: "$overtimeHours" },
              totalWorkedDays: { $sum: "$paidHoursInDays" },
            },
          },
          {
            $lookup: {
              from: "employees",
              let: { id: "$_id" },
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    employeeId: { $toObjectId: "$$id" },
                    positionId: { $toObjectId: "$position" },
                  },
                },
                { $match: { $expr: { $eq: ["$_id", "$employeeId"] } } },
                {
                  $lookup: {
                    from: "positions",
                    localField: "positionId",
                    foreignField: "_id",
                    as: "positionDetails",
                  },
                },
              ],
              as: "employeeDetails",
            },
          },
          {
            $unwind: "$employeeDetails",
          },
          {
            $unwind: "$employeeDetails.positionDetails",
          },
        ])
        .toArray();
    } catch (e) {
      console.error(chalk.red(`Unable to fetch employee date records, ${e}`));
      return { error: e };
    }
  }

  static async deleteAllDates() {
    try {
      return await employeeDates.deleteMany();
    } catch (e) {
      console.error(`Unable to delete all date records, ${e}`);
      return { error: e };
    }
  }
}

module.exports = PayrollDateDAO;
