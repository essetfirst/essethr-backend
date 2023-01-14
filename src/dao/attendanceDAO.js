const { performance } = require("perf_hooks");

const chalk = require("chalk");
const ObjectsToCsv = require("objects-to-csv");
const { readFile } = require("fs").promises;
const fs = require("fs");
const csv = require("csv-parser");
const { ObjectID, ObjectId } = require("mongodb");
const path = require("path");
const {
  DEFAULT_ATTENDANCE_POLICY,
  DAYS_OF_WEEK,
  DEFAULT_WORK_DAY_HOURS_FORMAT,
} = require("../constants");
const { computePayableHours } = require("../lib/computePayableHours");

const OrgDAO = require("./orgDAO");
const EmployeeDAO = require("./employeeDAO");
const PayrollDateDAO = require("./payrollDateDAO");
const { func, date, string } = require("joi");

let attendances;

/**
 * @typedef AttendanceInfo a representation of attendance data in db
 * @property {number} employeeId The employee associated with the attendance record
 * @property {Date} date The date attendance was recorded
 * @property {Time} checkin
 * @property {Time} checkout
 * @property {number} workedHours
 * @property {String} remark
 * @property {String} device
 */

function getRemark(t) {
  const date = new Date(t).getDay();
  // console.log(date);
  // const a = t <= new Date(`${new Date(t).toISOString().slice(0, 10)} 05:00 PM`).getTime();
  // const b = t <= new Date(`${new Date(t).toISOString().slice(0, 10)} 08:30 AM`).getTime();
  // const c =
  //   t <=
  //   new Date(
  //     `${new Date(t).toISOString().slice(0, 10)} 12:00 PM`
  //   ).getTime();
  // console.log(date!=0 && b, date > 0 && date <= 5, a, b,c);
  let remark;

  if ( date!= 0 && t <=
    new Date(`${new Date(t).toISOString().slice(0, 10)} 08:30 AM`).getTime()) {
    return "present";
  } else if (
    ( t <= new Date(`${new Date(t).toISOString().slice(0, 10)} 05:00 PM`).getTime() &&
      t > new Date(`${new Date(t).toISOString().slice(0, 10)} 08:30 AM`).getTime() &&
      date > 0 && date <= 5) ||
    (t <=
      new Date(
        `${new Date(t).toISOString().slice(0, 10)} 12:00 PM`
      ).getTime() &&
      date == 6
    )
  ) {
    return "late";
  } else {
    return "absent";
  }
}

class AttendanceDAO {
  static async injectDB(db) {
    try {
      attendances = db.collection("attendances");
      await attendances.createIndex({ employeeId: 1, date: 1 });
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to establish handle for AttendanceDAO, ${e}`)
      );
    }
  }

  static async swipe(attendanceInfo) {
    try {
      const { orgId, employeeId, time = Date.now(), device } = attendanceInfo;
      console.log(attendanceInfo);
      if (!employeeId || employeeId === undefined) {
        return { error: "Employee id is required!" };
      }

      // let lastTime = performance.now();
      // const result = await EmployeeDAO.getEmployee({ employeeId });
      // console.log(`Fetch employee took: ${performance.now() - lastTime}ms`);

      // if (!result || result.error) {
      //   return { error: "Employee not recognized!" };
      // }

      let action = null;
      let message = "";
      let error = "";

      // const { firstName, surName } = result;
      // const employeeName = `${firstName} ${surName}`;
      const employeeName = `Employee (${employeeId}) `;
      console.log(employeeName);
      const date = extractDateString(Date.now());
      // const date = time
      console.log(date);
      let query = { employeeId, date };
      const update = (data) => ({ $set: { ...data } });
      console.log(query);

      let lastTime = performance.now();
      const attendance = await attendances.findOne(query);
      console.log(`Fetch attendance took: ${performance.now() - lastTime}ms`);
      console.log(attendance);

      const { checkin = 0, checkout = 0 } = attendance || {};
      console.log(checkin);

      let updateData = { orgId };
      if (!checkin) {
        updateData = {
          ...updateData,
          employeeId,
          checkin: time,
          date,
          remark: getRemark(time),
          status: "pending",
          device,
        };
        action = "checkin";
        message = `${employeeName} checked in at ${new Date(
          time
        ).toLocaleTimeString()}`;
      } else {
        if (!checkout) {
          if (time - checkin < 3600000) {
            action = "checkin";
            error = `${employeeName} has already checked in at ${new Date(
              checkin
            ).toLocaleTimeString()}!`;
          } else {
            console.log(
              "[attendanceDAO]: Line 103 -> We are about to checkout... at: ",
              new Date(time).toLocaleTimeString()
            );
            const workedHours = parseFloat((time - checkin) / 3600000).toFixed(
              2
            );
            const overtimeHours =
              parseFloat(
                (new Date(
                  `${new Date().toISOString().slice(0, 0)} 08:00:00`
                ).getTime() -
                  new Date(
                    `${new Date().toISOString().slice(0, 0)} 20:00:00`
                  ).getTime()) /
                  3600000
              ).toFixed(2) - workedHours;

            updateData = {
              ...updateData,
              checkout: time,
              workedHours,
              overtimeHours,
              device,
            };

            action = "checkout";
            message = `${employeeName} checked out at ${new Date(
              time
            ).toLocaleTimeString()}`;
          }
        } else {
          // action = "checkout";
          error = `${employeeName} has already checked out at ${new Date(
            checkout
          ).toLocaleTimeString()}`;
        }
      }

      // Side effect here
      lastTime = performance.now();
      await attendances.updateOne(query, update(updateData), { upsert: true });
      console.log(`Write attendance took: ${performance.now() - lastTime}ms`);

      return { action, message, error };
    } catch (e) {
      console.error("Error while processing swipe: ", e);
      return {
        error: String(e) || "Something went wrong",
        server: true,
      };
    }
  }

  // static async swipe(attendanceInfo) {
  //   try {
  //     const { orgId, employeeId, time = Date.now(), device } = attendanceInfo;

  //     if (!employeeId || employeeId === undefined) {
  //       return { error: "Employee id is required!" };
  //     }

  //     const result = await EmployeeDAO.getEmployee({ employeeId });

  //     if (!result || result.error) {
  //       return { error: "Employee not recognized!" };
  //     }

  //     let action = null;
  //     let message = "";
  //     let error = "";

  //     const { firstName, surName } = result;
  //     const employeeName = `${firstName} ${surName}`;

  //     const date = extractDateString(time);
  //     let query = { orgId, employeeId, date };
  //     const update = (data) => ({ $set: { ...data } });

  //     const attendance = await attendances.findOne(query);
  //     const {
  //       checkin = 0,
  //       breakin = 0,
  //       breakout = 0,
  //       checkout = 0,
  //     } = attendance || {};

  //     let attendancePolicy = DEFAULT_ATTENDANCE_POLICY;
  //     if (orgId) {
  //       attendancePolicy = await OrgDAO.getAttendancePolicy(orgId);
  //     }

  //     // attendancePolicy = Array.isArray(attendancePolicy)
  //     //   ? attendancePolicy.reduce(
  //     //       (prev, next) => Object.assign({}, prev, next),
  //     //       {}
  //     //     )
  //     //   : attendancePolicy;

  //     const day = DAYS_OF_WEEK[new Date().getDay()];
  //     const { workStartTime, workEndTime, breakStartTime, breakEndTime } =
  //       (attendancePolicy[day] || DEFAULT_ATTENDANCE_POLICY[day]).workHours ||
  //       DEFAULT_WORK_DAY_HOURS_FORMAT;

  //     const getAttendanceRemark = (t) =>
  //       t <
  //       new Date(
  //         `${new Date(time).toLocaleDateString()} ${workStartTime}`
  //       ).getTime()
  //         ? "present"
  //         : "late";

  //     if (!checkin) {
  //       const remark = getRemark(time);
  //       // console.log(`Remark should be ${getRemark(time)}, but got ${remark} `);
  //       await attendances.updateOne(
  //         query,
  //         update({
  //           orgId,
  //           employeeId,
  //           checkin: time,
  //           date,
  //           status: "pending",
  //           remark,
  //           device,
  //         }),
  //         { upsert: true }
  //       );
  //       action = "checkin";
  //       message = `${employeeName} checked in at ${new Date(
  //         time
  //       ).toLocaleTimeString()}`;

  //       return { message };
  //     }

  //     let probableAction = 0;

  //     let proximateOffsetHr = 1000;
  //     const proximation = [
  //       { action: "checkin", time: workStartTime },
  //       { action: "breakout", time: breakStartTime },
  //       { action: "breakin", time: breakEndTime },
  //       { action: "checkout", time: workEndTime },
  //     ].map((prop) =>
  //       new Date(
  //         `${new Date(time).toLocaleDateString()} ${prop.time}`
  //       ).getTime()
  //     );

  //     proximation.forEach((timeInMS, index) => {
  //       const timeStart = time;
  //       const timeEnd = timeInMS;
  //       const diff = Math.abs(timeEnd - timeStart) / 60000; //dividing by seconds and milliseconds

  //       const offsetMins = diff % 60;
  //       const offsetHrs = diff - offsetMins / 60;
  //       // return { ...prop, offset: hours };
  //       if (offsetHrs < proximateOffsetHr) {
  //         proximateOffsetHr = offsetHrs;
  //         probableAction = index;
  //       }
  //     });

  //     console.log(
  //       `${proximation[probableAction].action} request: `,
  //       JSON.stringify({
  //         employeeName,
  //         employeeId,
  //         date,
  //         [`${proximation[probableAction].action}`]: new Date(
  //           time
  //         ).toLocaleTimeString(),
  //       })
  //     );

  //     let updateData = {};
  //     switch (probableAction) {
  //       case 0:
  //         if (!checkin) {
  //           updateData = {
  //             orgId,
  //             employeeId,
  //             checkin: time,
  //             date,
  //             status: "pending",
  //             remark: getRemark(time),
  //             device,
  //           };
  //           action = "checkin";
  //           message = `${employeeName} checked in at ${new Date(
  //             time
  //           ).toLocaleTimeString()}`;
  //         } else {
  //           error = `${employeeName} has already checked in at ${new Date(
  //             checkin
  //           ).toLocaleTimeString()}!`;
  //         }
  //         break;

  //       case 1:
  //         if (checkin) {
  //           if (breakout) {
  //             updateData = { breakout: time };
  //             action = proximation[probableAction].action;
  //             message = `${employeeName} out for break at ${new Date(
  //               time
  //             ).toLocaleTimeString()}`;
  //           } else {
  //             error = `${employeeName} already has went out for break at ${new Date(
  //               breakout
  //             ).toLocaleTimeString()}`;
  //           }
  //         } else {
  //           error = `${employeeName} has to checkin before going out to break.`;
  //         }
  //         break;

  //       case 2:
  //         if (breakout) {
  //           if (breakin) {
  //             updateData = breakin;
  //             action = proximation[probableAction].action;
  //             message = `${employeeName} back from break at ${new Date(
  //               time
  //             ).toLocaleTimeString()}`;
  //           } else {
  //             error = `${employeeName} is already back from break at ${new Date(
  //               breakin
  //             ).toLocaleTimeString()}`;
  //           }
  //         } else {
  //           error = `${employeeName} has not gone out to break.`;
  //         }
  //         break;
  //       case 3:
  //         if (!checkout) {
  //           const { workedHours, overtimeHours } = computePayableHours(
  //             { checkin, checkout, breakin, breakout },
  //             attendancePolicy[day].workHours
  //           );

  //           console.log("Computed hours: ");
  //           console.log("Worked hrs: ", workedHours);
  //           console.log("Overtime hrs: ", overtimeHours);

  //           updateData = { checkout: time, workedHours, overtimeHours, device };

  //           action = proximation[probableAction].action;
  //           message = `${employeeName} checked out at ${new Date(
  //             time
  //           ).toLocaleTimeString()}`;
  //         } else {
  //           error = `${employeeName} has already checked out at ${new Date(
  //             checkout
  //           ).toLocaleTimeString()}`;
  //         }
  //         break;
  //       default:
  //         error = "Suspicious swipe timing. Probably unintended card swipe.";
  //     }

  //     // Side effect here
  //     await attendances.updateOne(query, update(updateData), { upsert: true });

  //     return { action, message, error };
  //   } catch (e) {
  //     console.error("Error while processing swipe: ", e);
  //     return {
  //       error: String(e) || "Something went wrong",
  //       server: true,
  //     };
  //   }
  // }

  static async checkin(attendanceInfo) {
    try {
      const {
        employeeId,
        time = Date.now(),
        remark,
        device,
        orgId,
      } = attendanceInfo;

      if (!employeeId || employeeId === undefined) {
        return { error: "Employee identity required for checkin!" };
      }

      const date = extractDateString(time);
      const isCheckin = await attendances.findOne({
        orgId,
        employeeId,
        date,
      });
      // console.log(isCheckin,date)

      if (isCheckin) {
        return { error: "Employee already checked in!" };
      }

      const remarks = getRemark(time);
      console.log(remarks,date,extractDateTimeString(time));

      await attendances.insertOne({
        orgId,
        employeeId,
        date,
        checkin: time,
        remark: getRemark(time),
        device,
        status: "pending",
      });
      return { message: "Employee checked in!" };
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to register 'checkin', ${e.stack}`)
      );
      return { error: e, server: true };
    }
  }

  static async checkout(attendanceInfo) {
    try {
      const { orgId, employeeId, time = Date.now(), device } = attendanceInfo;
      const date = extractDateString(time);

      if (!employeeId || employeeId === undefined) {
        return { error: "Employee identity required for checkout!" };
      }

      const query = { orgId, employeeId, date };

      // TODO: compute attendance hours

      console.log(query);
      // Add attended hours to payroll date
      const result = await attendances.findOne(query);
      console.log(result);
      const checkin = result ? result.checkin : 0;
      var difference = time - checkin;
      
      var hoursDifference = Math.floor(difference/1000/60/60);
      difference -= hoursDifference * 1000 * 60 * 60
      var minsDifference = Math.floor(difference/1000/60);
      difference -= minsDifference * 1000 * 60 
      var minComp = minsDifference / 60;
      var workedHours = hoursDifference + minComp;
      const wh = (x) => Math.round(x * 100) / 100;
      const update = { $set: { checkout: time, device, workedHours: wh(workedHours) } };


      if (!result) {
        return { error: "You should checkin first!" };
      }
      // console.log(update,typeof f,typeof workedHours)
      // console.log(workedHours,difference,hoursDifference,minsDifference,checkin, time);
      if (computeHours(Date.now() - result.checkin) < 1) {
        return { error: "You need to wait for at least an hour to checkout!" };
      }

      if (result.checkout) {
        return { error: "You have checked out already!" };
      }

      console.log(chalk.yellow(result));

      await PayrollDateDAO.addDate({
        employeeId,
        date,
        attendanceHours: (time - result.checkin) / 3600000,
      });

      await attendances.updateOne(query, update);

      return { message: "Employee checked out!" };
    } catch (e) {
      console.error(chalk.redBright(`Unable to register 'checkout', ${e}`));
      return { error: e, server: true };
    }
  }

  static async getAttendances(filterCriteria) {
    try {
      // TODO: implementation of org based attendance
      const {
        orgId,
        org,
        employees = [],
        fromDate,
        toDate,
        from = "2022-12-19",
        to = "2022-12-25",
      } = filterCriteria;

      let query = {
        orgId: ObjectId(orgId || org) || String(orgId),
        date: {
          $gte: fromDate
            ? extractDateString(fromDate)
            : extractDateString(new Date()),
          $lte: toDate
            ? extractDateString(toDate)
            : extractDateString(new Date()),
        },
      };

      if (employees.length > 0) {
        query.employeeId = { $in: employees };
      }
      console.log(query);

      // const pipeline = [
      //   { $match: query },
      //   {
      //     $lookup: {
      //       from: "employees",
      //       let: { id: { $toObjectId: "$employeeId" } },
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
      // const result = await attendances.aggregate(pipeline).toArray();

      const result = await attendances.find(query).toArray();
      // console.log("Attendance result: ", result);
      // let attendancePolicy = DEFAULT_ATTENDANCE_POLICY;

      // if (orgId) {
      //   // const { attendancePolicy /*, holidaySchedule */ } = await OrgDAO.getOrgById(req.org);
      //   const org = await OrgDAO.getOrgById(orgId);
      //   attendancePolicy = Object.assign(
      //     {},
      //     attendancePolicy,
      //     org.attendancePolicy
      //   );
      // }

      // attendancePolicy = Array.isArray(attendancePolicy)
      //   ? attendancePolicy.reduce(
      //       (prev, next) => Object.assign({}, prev, next),
      //       {}
      //     )
      //   : attendancePolicy;
      //
      // }
      // console.log(result);
      return (
        result
          //   .map((attendance) => {
          //     const day = new Date(attendance.checkin).getDay();
          //     const { workedHours, overtimeHours } = computePayableHours(
          //       attendance,
          //       attendancePolicy[DAYS_OF_WEEK[day]].workHours
          //     );

          //     console.log("Worked hours: ", workedHours);
          //     console.log("Overtime hours: ", overtimeHours);

          //     return {
          //       ...attendance,
          //       workedHours,
          //       overtimeHours,
          //     };
          //   })
          .reduce((prev, next) => {
            let attendanceList = prev[next.date];
            if (attendanceList && Array.isArray(attendanceList)) {
              attendanceList.push(next);
            } else {
              attendanceList = [next];
            }
            return Object.assign({}, prev, { [next.date]: attendanceList });
          }, {})
      );
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to fetch all attendance records, ${e.stack}`)
      );
      return { error: e, server: true };
    }
  }
  static async getAllAttendances(filterCriteria) {
    try {
      // TODO: implementation of org based attendance
      const { orgId, org, date } = filterCriteria;

      let query = {
        orgId: ObjectId(orgId) || string(orgId),
        date: date ? date : { $exists: true },
        employeeId: false ? true : { $exists: true },
        // checkin: { $exists: true },
        // status:{$exists:true}
      };

      console.log(query);

      // if (employees.length > 0) {
      //   query.employeeId = { $in: employees };
      // }

      // const pipeline = [
      //   { $match: query },
      //   {
      //     $lookup: {
      //       from: "employees",
      //       let: { id: { $toObjectId: "$employeeId" } },
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
      // const result = await attendances.aggregate(pipeline).toArray();

      const result = await attendances.find(query).toArray();
      console.log("Attendance result: ", result.length);
      // let attendancePolicy = DEFAULT_ATTENDANCE_POLICY;

      // if (orgId) {
      //   // const { attendancePolicy /*, holidaySchedule */ } = await OrgDAO.getOrgById(req.org);
      //   const org = await OrgDAO.getOrgById(orgId);
      //   attendancePolicy = Object.assign(
      //     {},
      //     attendancePolicy,
      //     org.attendancePolicy
      //   );
      // }

      // attendancePolicy = Array.isArray(attendancePolicy)
      //   ? attendancePolicy.reduce(
      //       (prev, next) => Object.assign({}, prev, next),
      //       {}
      //     )
      //   : attendancePolicy;
      //
      // }
      // console.log(result);
      return (
        result
          //   .map((attendance) => {
          //     const day = new Date(attendance.checkin).getDay();
          //     const { workedHours, overtimeHours } = computePayableHours(
          //       attendance,
          //       attendancePolicy[DAYS_OF_WEEK[day]].workHours
          //     );

          //     console.log("Worked hours: ", workedHours);
          //     console.log("Overtime hours: ", overtimeHours);

          //     return {
          //       ...attendance,
          //       workedHours,
          //       overtimeHours,
          //     };
          //   })
          .reduce((prev, next) => {
            let attendanceList = prev[next.date];
            if (attendanceList && Array.isArray(attendanceList)) {
              attendanceList.push(next);
            } else {
              attendanceList = [next];
            }
            return Object.assign({}, prev, { [next.date]: attendanceList });
          }, {})
      );
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to fetch all attendance records, ${e.stack}`)
      );
      return { error: e, server: true };
    }
  }
  static async getTodayAttendances(filterCriteria) {
    try {
      // console.log(filterCriteria);
      // TODO: implementation of org based attendance
      const {
        orgId,
        employees = [],
        today = extractDateString(new Date()),cl
      } = filterCriteria;
      console.log(orgId, today);

      let query = {
        orgId: ObjectId(orgId),
        date: today,
      };

      console.log(query);

      if (employees.length > 0) {
        query.employeeId = { $in: employees };
      }

      return await attendances.find(query).toArray();
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to fetch all attendance records, ${e.stack}`)
      );
      return { error: e, server: true };
    }
  }
  // A functionality only available for authorized users
  static async approveAttendance({ orgId, employees, date }) {
    try {
      let query = {
        orgId,
        employeeId: { $in: employees },
        date: date,
        checkin: { $exists: true, $ne: null },
        checkout: { $exists: true, $ne: null },
      };

      const update = { $set: { status: "approved" } };

      const result = await attendances.updateMany(query, update);
      console.log("Approve operation result: ", result);

      // Todo add payroll date
      return result.modifiedCount > 0
        ? {
            message: `${result.modifiedCount} attendance ${
              result.modifiedCount > 1 ? "entries" : "entry"
            } approved!`,
          }
        : { error: "No entries approved" };
    } catch (e) {
      console.error(`Unable to approve attendance, ${e}`);
      return { error: String(e), server: true };
    }
  }

  // A functionality only available for ADMINS
  static async updateAttendance(attendanceInfo) {
    try {
      console.log(
        "\n[attendanceDAO]: Line 587 -> received attendance info: ",
        attendanceInfo
      );

      const { orgId, employeeId, date, checkin, checkout, status, ...rest } =
        attendanceInfo;

      let newData = {};
      // let attendancePolicy = await OrgDAO.getAttendancePolicy(orgId);
      // const day = DAYS_OF_WEEK[new Date().getDay()];
      // const { workStartTime } =
      //   attendancePolicy[day].workHours || DEFAULT_WORK_DAY_HOURS_FORMAT;

      if (checkin) {
        newData = {
          ...newData,
          checkin: new Date(checkin).getTime(),
          remark: getRemark(checkin),
        };
      }

      if (checkout) {
        // const { workedHours, overtimeHours } = computePayableHours(
        //   { checkin, checkout },
        //   attendancePolicy[day].workHours
        // );

        const workedHours = parseFloat(
          checkout > checkin ? (checkout - checkin) / 3600000 : 0
        ).toFixed(2);
        const overtimeHours = 0;

        // If time is approved then add to date payroll
        if (status && status === "approved") {
          await PayrollDateDAO.addDate({
            employeeId,
            date,

            attendanceHours: workedHours,
            overtimeHours: overtimeHours,
          });
        }

        newData = {
          ...newData,
          checkout: new Date(checkout).getTime(),
          workedHours,
          overtimeHours,
          status,
        };
      }

      const query = {
        orgId: String(orgId),
        employeeId,
        date: extractDateString(date),
      };
      const update = { $set: { ...newData, ...rest } };
      const result = await attendances.updateOne(query, update);
      // console.log(result,update)
      console.log(
        "[attendanceDAO]: Line 638 -> Update operation result: ",
        `${result.modifiedCount} upserted with id ${result.upsertedId}`
      );
      if (result.modifiedCount > 0) {
        return result;
      } else return { error: "Update was not successful" };
    } catch (e) {
      console.error(chalk.redBright(`Unable to update attendance, ${e.stack}`));
      return { error: e, server: true };
    }
  }

  static async deleteAttendance(filterCriteria) {
    try {
      const { deletedCount, deletedId } = await attendances.deleteMany(
        filterCriteria
      );

      return { deletedCount, deletedId };
    } catch (e) {
      return { error: String(e), server: true };
    }
  }

  static async deleteAllAttendance() {
    try {
      return await attendances.deleteMany();
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to delete all attendance records, ${e}`)
      );
      return { error: e, server: true };
    }
  }

  static async importAttendance(fileInfo) {
    try {
      const { filename } = fileInfo;
      console.log(filename);
      const results = [];
      var Alldata = [];
      fs.createReadStream(filename)
        .pipe(csv({}))
        .on("data", (data) => results.push(data))
        .on(
          "end",
          async () => {
            for (const result of results) {
              const {
                date,
                employeeId,
                checkin,
                device,
                orgId,
                remark,
                status,
                checkout,
              } = result;
              Alldata.push({
                date,
                employeeId,
                checkin,
                device,
                orgId,
                remark,
                status,
                checkout,
              });
            }
            // console.log(Alldata);
            return await attendances.insertMany(Alldata);
          }
          // //  console.log(result);
        );
      // console.log(Alldata)
      return true;
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to Import all attendance records, ${e}`)
      );
      //  { error: e, server: true };
      return false;
    }
  }
  static async exportAttendance(filterInfo) {
    try {
      const data = await this.getAttendancesToReport(filterInfo);
      const name = () => new Date(Date.now()).toISOString().slice(0, 10);
      const filename = name();
      const on = extractTimeString(new Date()).replace(/:/g, "-");
      if (data) {
        const fileInfo = `attendance-report-by-${filename}-T-${on}.csv`;
        console.log(fileInfo);
        const csv = new ObjectsToCsv(data);
        await csv.toDisk(
          path.join(__dirname, "../../uploads/attendance", fileInfo)
        );
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to Import all attendance records, ${e}`)
      );
      return { error: e, server: true };
    }
  }
  static async getAttendancesToReport(filterCriteria = {}) {
    try {
      // TODO: implementation of org based attendance
      const { orgId, employees = [], fromDate, toDate } = filterCriteria;

      let query = {
        orgId: String(orgId),
        date: {
          $gte: fromDate ? String(fromDate) : extractDateString(new Date()),
          $lte: toDate ? String(toDate) : extractDateString(new Date()),
        },
      };
      console.log(query);
      if (employees.length > 0) {
        query.employeeId = { $in: employees };
      }
      const result = await attendances.find(query).toArray();
      return result;
    } catch (err) {
      console.error(chalk.redBright(`Unable to generate attendance , ${e}`));
      return { error: e, server: true };
    }
  }
  static async getDailyReport(filterCriteria = {}) {
    try {
      const { orgId } = filterCriteria;
      const today = new Date().toJSON().slice(0, 10).replace(/-/g, "-");
      let query = {
        orgId: ObjectId(orgId),
        date: today,
      };
      console.log(query);
      const result = await attendances
        .aggregate(
          { $match: query },
          { $group: { _id: "$remark", count: { $sum: 1 } } },
          { $project: { remark: "$_id", count: 1 } }
        )
        .toArray();
      // const resl = await attendances.find(query).toArray();
      console.log(result);
      return result;
      // return resl;
    } catch (e) {
      console.error(chalk.redBright(`Unable to get attendance report, ${e}`));
      return { error: e, server: true };
    }
  }
  static async getReport(filterCriteria = {}) {
    try {
      let attendanceReport = {
        byDate: {},
        byRemark: {},
        attendance: {},
      };

      const result = await this.getAttendances(filterCriteria);
      console.log(Object.keys(result));

      const attendanceList = [];
      Object.keys(result).forEach((date) =>
        attendanceList.push(...result[date])
      );
      console.log(attendanceList);

      attendanceList.forEach(({ employeeId, date, remark }) => {
        // By date
        if (attendanceReport.byDate[date]) {
          attendanceReport.byDate[date] = {
            ...attendanceReport.byDate[date],
            [remark]:
              attendanceReport.byDate[date][remark] !== undefined
                ? attendanceReport.byDate[date][remark] + 1
                : 1,
          };
        } else {
          attendanceReport.byDate[date] = { [remark]: 1 };
        }

        // By remark
        if (attendanceReport.byRemark[remark]) {
          attendanceReport.byRemark[remark] = {
            ...attendanceReport.byRemark[remark],
            [employeeId]:
              attendanceReport.byRemark[remark][employeeId] !== undefined
                ? attendanceReport.byRemark[remark][employeeId] + 1
                : 1,
          };
        } else {
          attendanceReport.byRemark[remark] = { [employeeId]: 1 };
        }

        // Employee collected attendance record
        attendanceReport.attendance[employeeId] = {
          ...(attendanceReport.attendance[employeeId] || {}),
          [remark]: parseInt(
            attendanceReport.attendance[employeeId] &&
              attendanceReport.attendance[employeeId][remark] !== undefined
              ? attendanceReport.attendance[employeeId][remark] + 1
              : 1
          ),
          workedHours: parseInt(
            attendanceReport.attendance[employeeId] &&
              attendanceReport.attendance[employeeId]["workedHours"] !==
                undefined
              ? attendanceReport.attendance[employeeId]["workedHours"]
              : 0
          ),
        };
      });

      return attendanceReport;
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to generate attendance report, ${e}`)
      );
      return { error: e, server: true };
    }
  }
}

/**
 * Returns to hours extracted from date time milliseconds number
 *
 */
function computeHours(datetime = 0) {
  return Math.floor(datetime / 3600000);
}

function extractDateString(date) {
  return new Date(date).toISOString().slice(0, 10);
}
function extractTimeString(date) {
  return new Date(date).toISOString().slice(11, 19);
}
function extractDateTimeString(date) {
  return new Date(date).toISOString();
}
module.exports = AttendanceDAO;
