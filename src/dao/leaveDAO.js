const path = require("path");
const chalk = require("chalk");
const { ObjectID,ObjectId } = require("mongodb");
const ObjectsToCsv = require("objects-to-csv");
const LeaveTypeDAO = require("./leaveTypeDAO");

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
      // console.log(filterCriteria);
      const start = from || fromDate || startDate;
      const end = to || toDate || endDate;
      // console.log(start, end);
      const query = {
        org: ObjectId(org),
        employeeId:
          employees.length > 0 ? { $in: employees } : { $exists: true },
        startDate: start
          ? { $gte: extractDateString(start) }
          : { $exists: true },
        endDate: end ? { $lte: extractDateString(end) } : { $exists: true },
      };
      console.log(query);

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
  static async ExportLeaves(filterCriteria) {
    try {
      const result = await this.getLeaves(filterCriteria);
      const by = extractDateString(new Date());
      const on = extractTimeString(new Date()).replace(/:/g, "-");
    
      console.log(result);
      if (result) {
        const fileInfo = `Monthly-leave-report-by-${by}-on-${on}.csv`;
        const csv = new ObjectsToCsv(result);
        console.log(fileInfo);
        await csv.toDisk(path.join(__dirname, "../uploads/leaves/", fileInfo), {
          append: true,
        });
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error(chalk.redBright(`Unable To fetch leaves, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getLeaveById(leaveId) {
    try {
      const query = { _id: ObjectId(leaveId.id) };
      // console.log(query,leaveId,leaveId.id);
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
      const { id, org, status = "pending", ...rest } = leaveInfo;
      const query = { _id: ObjectId(id) };

      const update = {
        $set: {
          ...rest,
          status: status.toLowerCase(),
          lastModifiedOn: new Date(),
        },
      };

      console.log(update);

      if (status && status.toLowerCase() === "approved") {
        // console.log("True")
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
          // console.log("False");
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
      // console.log("Before Update");
      return await leaves.updateOne(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Unable to update leave record, ${e}`));
      return { server: true, error: e };
    }
  }

  static async approveLeaves(filterCriteria = {}) {
    try {
      // console.log("[leaveDAO]: Line 196 -> filterCriteria: ", filterCriteria);

      const { leaveIds = [] } = filterCriteria;
      // console.log(leaveIds.length)
      const query = {
        _id:
          leaveIds.length > 1
            ? { $in: leaveIds.map((id) => ObjectID(id)) }
            : ObjectId(leaveIds[0]),
        status: { $ne: "approved" },
      };
      console.log(query);
      const result = await leaves.updateMany(query, {
        $set: { status: "approved" },
      });
      console.log(result)

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
      //Get Leave Id
      const lId = result.upsertedIds || leaveIds[0];
      console.log(lId)
      const approveLeave = await leaves.findOne({ _id: ObjectId(lId) });
      console.log(approveLeave)
      // Get Leave Type,duration,employeeId
       const {employeeId,leaveType,duration} = approveLeave
      // Get Leave Name from leavetype
      const leaveName = await LeaveTypeDAO.getById(leaveType);
      console.log(leaveName);
      const { name } = leaveName;
      const leaveTypeName = (name) => {
        if (name == "Compassionate Leave (Bereavement Leave)") {
          return "special";
        } else if (name == "Maternity Leave (Parental Leave)") {
          return "maternal";
        } else {
          return "annual";
        }
      }
      const names = leaveTypeName(name);
      // call use allocated method
      var useAllocated = { employees: [employeeId]}; 
      useAllocated[names] = duration
      console.log(useAllocated, name,duration,names)
      const { employees = [], ...rest } = useAllocated;
      const allowanceFields = Object.keys(rest)
        .map((key) => ({
          [`used.${key}`]: rest[key] ? rest[key] : 0,
        }))
        .reduce((obj, n) => {
          obj = { ...obj, ...n };
          return obj;
        }, {});
      console.log(allowanceFields);
      const querys = {
        employeeId:
          employees.length > 1
            ? { $in: [String(employees)] }
            : String(employees[0]),
      };

      // console.log(query);
      // const dt = await allowances.findOne(query);
      // console.log(dt);
      const update = {
        $inc: allowanceFields,
      };
      console.log(update);
      const res = await allowances.updateMany(querys, update);
      console.log(res);
      return result;
    } catch (e) {
      console.error(chalk.redBright(`Unable to approve leave records, ${e}`));
      return { server: true, error: e };
    }
  }

  static async deleteLeave(leaveId) {
    try {
      const query = { _id: ObjectId(leaveId) };
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
      console.log(allowanceInfo)
      // console.log("Hello")
      const isAllocated = await allowances.findOne(allowanceInfo);
      console.log(isAllocated);
      if (isAllocated) {
        return false;
      }
      const allocate = await allowances.insertOne({
        ...allowanceInfo,
        allocated: { ...ethiopianYearlyPaidLeaveAllowance },
        used: { ...ethiopianLeaveTypesDefault },
      });
      return true;
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to allocate leave allowance, ${e}`)
      );
      return { error: e };
    }
  }

  static async updateAllowances(updateInfo) {
    try {
      console.log(updateInfo);
      const { employees = [], ...rest } = updateInfo;
      const allowanceFields = Object.keys(rest)
        .map((key) => ({
          [`used.${key}`]: rest[key] ? rest[key] : 0,
        }))
        .reduce((obj, n) => {
          obj = { ...obj, ...n };
          return obj;
        }, {});
      console.log(allowanceFields);
      const query = {
        employeeId:
          employees.length > 1
            ? { $in: [String(employees)] }
            : String(employees[0]),
      };

      // console.log(query);
      // const dt = await allowances.findOne(query);
      // console.log(dt);
      const update = {
        $inc: allowanceFields,
      };
      // console.log(update);
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
function extractTimeString(date) {
  return new Date(date).toISOString().slice(11, 19);
}

module.exports = { LeaveDAO, LeaveAllowanceDAO };
