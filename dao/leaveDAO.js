const chalk = require("chalk");
const { ObjectID } = require("mongodb");

const PayrollDateDAO = require("./payrollDateDAO");

let leaves;
let allowances;

/**
 * @typedef LeaveInfo
 * @property {number} employeeId The employee [id] the leave is for
 * @property {String} leaveType The type of leave (absence) demanded
 * @property {number} duration The length of leave in days
 * @property {Date} from The start date of the leave
 * @property {Date} to The date the leave ends
 * @property {String} note A brief on the need for leave
 * @property {String} status Whether the leave has been approved or rejected (default pending)
 * @property {Date} createdOn The date leave request is created
 * @property {Date} lastModifiedOn The date leave is last modified
 */

class LeaveDAO {
  static async injectDB(db) {
    try {
      leaves = db.collection("leaves");
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to establish handle for LeaveDAO, ${e}`)
      );
    }
  }

  static async getLeaves(filterCriteria = {}) {
    try {
      const {
        org,
        employees = [],
        from,
        fromDate,
        startDate,
        to,
        toDate,
        endDate,
      } = filterCriteria;
      const start = from || fromDate || startDate;
      const end = to || toDate || endDate;
      const query = {
        org,
        employeeId:
          employees.length > 0 ? { $in: employees } : { $exists: true },
        startDate: start
          ? { $gte: extractDateString(start) }
          : { $exists: true },
        endDate: end ? { $lte: extractDateString(end) } : { $exists: true },
      };

      return await leaves.find(query).toArray();

      // const pipeline = [
      //   { $match: query },
      //   {
      //     $lookup: {
      //       from: "employees",
      //       let: { id: "$employeeId" },
      //       pipeline: [
      //         {
      //           $match: {
      //             _id: "$$id",
      //             org: org ? ObjectID(org) : { $exists: true },
      //           },
      //         },
      //         {
      //           $project: { firstName: 1, surName: 1, lastName: 1 },
      //         },
      //       ],
      //       as: "employee",
      //     },
      //   },
      // ];
      // return await leaves.aggregate(pipeline).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch leaves, ${e}`));
      return { server: true, error: e };
    }
  }

  static async getLeaveById(leaveId) {
    try {
      const query = { _id: ObjectID(leaveId) };
      return await leaves.findOne(query);

      // const pipeline = [
      //   { $match: query },
      //   {
      //     $lookup: {
      //       from: "employees",
      //       let: { id: "$employeeId" },
      //       pipeline: [
      //         { $match: { _id: "$$id" } },
      //         {
      //           $project: { firstName: 1, surName: 1, lastName: 1 },
      //         },
      //       ],
      //       as: "employee",
      //     },
      //   },
      // ];
      // const result = await leaves.aggregate(pipeline).toArray();
      // if (result.length > 0) {
      //   return result[0];
      // } else {
      //   return null;
      // }
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch leave by id, ${e}`));
      return { server: true, error: e };
    }
  }

  /**
   * Registers a new leave if conditions are met
   * @param {LeaveInfo} leaveInfo
   */
  static async addLeave(leaveInfo) {
    try {
      console.log(leaveInfo);
      // Compare requested duration & with remaining allowance
      return await leaves.insertOne({
        ...leaveInfo,
        status: "pending",
        createdOn: new Date(),
        lastModifiedOn: new Date(),
      });
    } catch (e) {
      console.error(chalk.redBright(`Unable to add leave record, ${e}`));
      return { server: true, error: e };
    }
  }

  static async updateLeave(leaveInfo) {
    try {
      const { _id, status = "pending", ...rest } = leaveInfo;

      const query = {
        _id: ObjectID(_id),
      };

      const update = {
        $set: {
          ...rest,
          status: status.toLowerCase(),
          lastModifiedOn: new Date(),
        },
      };

      if (status && status.toLowerCase() === "approved") {
        const { employeeId, duration, from, to, leaveType } =
          await leaves.findOne({
            _id,
          });
        const dates = [];
        const leaveHours = 8; // standard 8 hours
        if (duration > 0 && duration <= 1) {
          dates.push({
            employeeId,
            date: from,
            leaveHours: leaveHours * duration,
          });
        } else {
          for (let i = 0; i < duration; i++) {
            let date = new Date(
              new Date(from).getTime() + i * 24 * 360000
            ).toLocaleDateString();
            dates.push({ employeeId, date, leaveHours });
          }
        }
        // add leave dates to payroll dates
        // await PayrollDateDAO.addDates(dates);

        // update allowance
        await LeaveAllowanceDAO.updateAllowances({
          employees: [employeeId],
          [leaveType]: duration * -1,
        });
      }

      return await leaves.updateOne(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Unable to update leave record, ${e}`));
      return { server: true, error: e };
    }
  }

  static async approveLeaves(filterCriteria = {}) {
    try {
      console.log("[leaveDAO]: Line 196 -> filterCriteria: ", filterCriteria);

      const { leaveIds = [] } = filterCriteria;
      const query = {
        _id:
          leaveIds.length > 0
            ? { $in: leaveIds.map((id) => ObjectID(id)) }
            : { $exists: true },
        status: { $ne: "approved" },
      };

      const result = await leaves.updateMany(query, {
        $set: { status: "approved" },
      });

      const updatedLeaves = await leaves
        .find({
          _id: { $in: result.upsertedIds || leaveIds },
        })
        .toArray();

      console.log("[leaveDAO]: Line 217 -> updateLeaves: ", updatedLeaves);

      await updatedLeaves.forEach(
        async ({ employeeId, leaveType, duration }) => {
          await LeaveAllowanceDAO.updateAllowances({
            employees: [employeeId],
            [leaveType]: duration * -1,
          });
        }
      );

      return result;
    } catch (e) {
      console.error(chalk.redBright(`Unable to approve leave records, ${e}`));
      return { server: true, error: e };
    }
  }

  static async deleteLeave(leaveId) {
    try {
      const query = { _id: ObjectID(leaveId) };
      return await leaves.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to delete leave record, ${e}`));
      return { server: true, error: e };
    }
  }

  static async deleteManyLeaves(filterCriteria = {}) {
    try {
      const { employees = [], from, to } = filterCriteria;
      const query = {
        employeeId:
          employees.length > 0 ? { $in: employees } : { $exists: true },
        from: from ? { $gte: extractDateString(from) } : { $exists: true },
        to: to ? { $lte: extractDateString(to) } : { $exists: true },
      };

      return await leaves.deleteMany(query);
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to delete many leave records, ${e}`)
      );
      return { server: true, error: e };
    }
  }

  static async getReport(filterCriteria = {}) {
    try {
      const result = await this.getLeaves(filterCriteria);

      let leaveReport = {
        byMonth: {},
        byType: {},
        leaves: {},
      };

      result.forEach(({ employeeId, leaveType, duration, from, to }) => {
        // by month
        const month = new Date(from).getMonth();

        leaveReport.byMonth[month] = leaveReport.byMonth[month]
          ? leaveReport.byMonth[month] + 1
          : 1;

        // by type
        leaveReport.byType[leaveType] = leaveReport.byType[leaveType]
          ? leaveReport.byType[leaveType] + 1
          : 1;

        // leaves
        if (leaveReport.leaves[employeeId]) {
          leaveReport.leaves[employeeId] = {
            ...leaveReport.leaves[employeeId],
            days: parseInt(leaveReport.leaves[employeeId].days) + duration,
            types: [...leaveReport.leaves[employeeId].types, leaveType],
          };
        } else {
          leaveReport.leaves[employeeId] = {
            employeeId,
            days: duration,
            types: [leaveType],
          };
        }
      });
      return leaveReport;
    } catch (e) {
      console.error(chalk.redBright(`Unable to generate leave report, ${e}`));
      return { server: true, error: e };
    }
  }
}

class LeaveAllowanceDAO {
  static async injectDB(db) {
    try {
      allowances = db.collection("leave_allowances");
      await allowances.createIndex({ employeeId: 1 });
    } catch (e) {
      console.error(
        chalk.redBright(
          `Unable to establish handle for LeaveAllowanceDAO, ${e}`
        )
      );
    }
  }

  static async getAllowances(filterCriteria = {}) {
    try {
      const query = {};
      return await allowances.find(query).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch leave allowances, ${e}`));
      return { error: e };
    }
  }

  static async getEmployeeAllowance(employeeId) {
    try {
      return await allowances
        .aggregate([
          { $match: { employeeId: ObjectID(employeeId) } },
          {
            $lookup: {
              from: "employees",
              let: { id: "$employeeId" },
              pipeline: [
                { $match: { _id: "$$id" } },
                {
                  $project: { firstName: 1, surName: 1, lastName: 1 },
                },
              ],
              as: "employee",
            },
          },
        ])
        .toArray();
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to fetch employee leave allowance, ${e}`)
      );
      return { error: e };
    }
  }

  static async allocateAllowance(allowanceInfo) {
    try {
      return await allowances.insertOne({
        ...allowanceInfo,
        allocated: { ...ethiopianYearlyPaidLeaveAllowance },
        used: { ...ethiopianLeaveTypesDefault },
      });
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to allocate leave allowance, ${e}`)
      );
      return { error: e };
    }
  }

  static async updateAllowances(updateInfo) {
    try {
      const { employees = [], ...rest } = updateInfo;
      const allowanceFields = Object.keys(rest)
        .map((key) => ({
          [key]: { $sum: rest[key] || 0 },
        }))
        .reduce((obj, n) => {
          obj = { ...obj, ...n };
          return obj;
        }, {});
      // rest = { annual: 4, special: -2 }
      // allowanceFields = { annual: { $sum: 4 }, special: { $sum: -2 } }
      const query = {
        employeeId:
          employees.length > 0 ? { $in: employees } : { $exists: true },
      };
      const update = { ...allowanceFields };
      return await allowances.updateMany(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Unable to update leave allowance, ${e}`));
      return { error: e };
    }
  }
}

const ethiopianYearlyPaidLeaveAllowance = {
  annual: 16,
  special: 3,
  maternal: 60,
};
const ethiopianLeaveTypesDefault = {
  annual: 0,
  special: 0,
  maternal: 0,
};

function extractDateString(date) {
  return new Date(date).toISOString().slice(0, 10);
}

module.exports = { LeaveDAO, LeaveAllowanceDAO };
