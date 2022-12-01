const chalk = require("chalk");
const { ObjectID } = require("mongodb");

const AttendanceDAO = require("./attendanceDAO");
const EmployeeDAO = require("./employeeDAO");
const { LeaveDAO } = require("./leaveDAO");
const PayrollDateDAO = require("./payrollDateDAO");
const PayslipDAO = require("./payslipDAO");
const OrgDAO = require("./orgDAO");

// const { EmployeeDAO, AttendanceDAO, PayslipDAO, PayrollDateDAO } = require(".");

const computeIncomeTax = require("../lib/computeIncomeTax");
const computeCommission = require("../lib/computeCommission");
const roundNumber = require("../lib/roundNumber");

let payrolls;

/**
 * @typedef PayrollInfo
 * @property {String} title
 * @property {String} frequency
 * @property {Date} from
 * @property {Date} to
 * @property {String} period
 * @property {Date} payDate
 * @property {Enum} status
 * @property {Array<Object>} payslips
 * @property {Date} createdOn
 * @property {Date} lastModifiedOn
 */

class PayrollDAO {
  static async injectDB(db) {
    try {
      payrolls = await db.collection("payrolls");
    } catch (e) {
      console.error(
        `Unable to establish handle for ${chalk.black(
          chalk.bgWhite("PayrollDAO")
        )}, ${e}`
      );
    }
  }

  static async addPayroll(payrollInfo) {
    try {
      return await payrolls.insertOne(payrollInfo);
    } catch (e) {
      console.error(`Unable to add payroll data, ${e}`);
      return { error: e };
    }
  }

  static async getPayrolls(filterCriteria = {}) {
    // const { frequency, from, to, status, totalPaymentAmount } = filterCriteria;
    try {
      // TODO: filtering and sorting
      const { org, fromDate, toDate, from, to, ...rest } = filterCriteria;
      console.log("Get payrolls, org: ", org);
      let query = { org: org ? org : { $exists: true }, ...rest };

      if (from) {
        query.fromDate = {
          $gte: new Date(fromDate || from).toISOString().slice(0, 10),
        };
      }

      if (to) {
        query.toDate = {
          $lte: new Date(toDate || to).toISOString().slice(0, 10),
        };
      }
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "payslips",
            localField: "_id",
            foreignField: "payrollId",
            as: "payslips",
          },
        },
      ];

      return await payrolls.aggregate(pipeline).toArray();
    } catch (e) {
      console.error(`Unable to fetch payroll data, ${e}`);
      return { error: e };
    }
  }

  static async getPayrollById(payrollId) {
    try {
      const query = { _id: ObjectID(payrollId) };
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "payslips",
            localField: "_id",
            foreignField: "payrollId",
            as: "payslips",
          },
        },
      ];

      const result = await payrolls.aggregate(pipeline).toArray();
      if (result.length > 0) {
        return result[0];
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to fetch payroll data by id, ${e}`);
      return { error: e };
    }
  }

  static async updatePayroll({ payrollId, ...rest } = {}) {
    try {
      const query = { _id: ObjectID(payrollId) };
      const update = { $set: { ...rest } };

      return await payrolls.updateOne(query, update);
    } catch (e) {
      console.error(`Unable to update payroll record, ${e}`);
      return { error: e };
    }
  }

  static async deletePayroll(payrollId) {
    try {
      // TODO: first delete all payslips related to this payroll
      PayslipDAO.deletePayrollPayslips(payrollId);
      return await payrolls.deleteOne({ _id: ObjectID(payrollId) });
    } catch (e) {
      console.error(`Unable to delete payroll record by id, ${e}`);
      return { error: e };
    }
  }

  static async deleteAllPayrolls(payrollId) {
    try {
      // TODO: first delete all payslips related to this payroll
      PayslipDAO.deleteAllPayslips();
      return await payrolls.deleteMany();
    } catch (e) {
      console.error(`Unable to delete payroll record by id, ${e}`);
      return { error: e };
    }
  }

  static async getPayrollHours({
    org,
    orgId,
    employees = [],
    fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0),
    toDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  }) {
    try {
      const orgFromDb = await OrgDAO.getOrgById(org || orgId);
      // console.log(
      //   "[payrollDAO:getPayrollHours]: Line 162 -> orgFromDb: ",
      //   orgFromDb
      // );
      const { positions = [], holidays = [] } = orgFromDb || {};
      const positionsMap = positions
        .map((p) => ({ [p._id]: p }))
        .reduce((o, c) => ({ ...o, ...c }), {});

      // console.log(
      //   "[payrollDAO:getPayrollHours]: Line 172 -> positionsMap: ",
      //   positionsMap
      // );

      const employeesFromDb = orgFromDb.employees
        ? employees.length > 0
          ? orgFromDb.employees.filter((e) => employees.includes(String(e._id)))
          : orgFromDb.employees
        : [];

      // console.log(
      //   "[payrollDAO:getPayrollHours]: Line 178 -> employeesFromDb: ",
      //   employeesFromDb
      // );

      const holidaysByDate = holidays.reduce(
        (p, n) => ({ ...p, [n.date]: true }),
        {}
      );

      let attendanceHoursByEmployee = {};
      let overtimeHoursByEmployee = {};
      let leaveHoursByEmployee = {};
      let payrollHoursStatus = "approved";

      // Structure of attendanceFromDb = { ['10-10-2021']: [] }
      const attendanceFromDb = await AttendanceDAO.getAttendances({
        org: org || orgId,
        fromDate,
        toDate,
      });

      console.log(
        "[payrollDAO:getPayrollHours]: Line 205 -> attendanceFromDb: ",
        attendanceFromDb
      );
      Object.values(attendanceFromDb).forEach(
        ({ employeeId, date, workedHours, overtimeHours = 0, status }) => {
          if (holidaysByDate[date]) {
            overtimeHoursByEmployee = {
              ...overtimeHoursByEmployee,
              [employeeId]: overtimeHoursByEmployee[employeeId]
                ? overtimeHours +
                  workedHours +
                  overtimeHoursByEmployee[employeeId]
                : overtimeHours,
            };
          } else {
            attendanceHoursByEmployee = {
              ...attendanceHoursByEmployee,
              [employeeId]: attendanceHoursByEmployee[employeeId]
                ? workedHours + attendanceHoursByEmployee[employeeId]
                : workedHours,
            };
          }
          if (status !== "approved") {
            payrollHoursStatus = "pending";
          }
        }
      );

      const leavesFromDb = await LeaveDAO.getLeaves({
        org: org || orgId,
        fromDate,
        toDate,
      });

      console.log(
        "[payrollDAO:getPayrollHours]: Line 227 -> leavesFromDb: ",
        leavesFromDb
      );

      leavesFromDb.forEach(({ employeeId, duration }) => {
        leaveHoursByEmployee = {
          ...leaveHoursByEmployee,
          [employeeId]: leaveHoursByEmployee[employeeId]
            ? duration + leaveHoursByEmployee[employeeId]
            : duration * 10,
        };
      });

      return employeesFromDb.map(
        ({
          _id,
          firstName,
          surName,
          lastName,
          image,
          position,
          phone,
          hireDate,
        }) => {
          const regular = attendanceHoursByEmployee[_id] || 0;
          const leave = leaveHoursByEmployee[_id] || 0;
          const overtime = overtimeHoursByEmployee[_id] || 0;

          console.log(
            "[payrollDAO:getPayrollHours]: Line 254 -> overtime, leave, regular",
            `${overtime}, ${leave} ${regular}`
          );

          return {
            employeeId: _id,
            employeeName: `${firstName} ${surName} ${lastName}`,
            employeeImage: image,
            employeePosition: positionsMap[position],
            employeePhone: phone,
            employeeJoinedDate: hireDate,
            organization: orgFromDb.name,
            fromDate,
            toDate,
            
            regular,
            leave,
            overtime,
            status: payrollHoursStatus,
          };
        }
      );
    } catch (e) {
      console.error(`Error unable to get payroll hours, ${e}`);
      return { error: e, server: true };
    }
  }

  static async generatePayroll({
    title,
    employees = [],
    fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0),
    toDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    payDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    payType = "Daily",
    org,
  }) {
    try {
      // TODO: implementing an automatic date range of current month
      // if fromDate and toDate parameters are undefined
      // console.log(
      //   "[payrollDAO:generatePayroll]: Line 284 -> Employees: ",
      //   employees
      // );
      // console.log("Date range: ", fromDate, toDate);
      const dateRangeInDays =
        ((new Date().getTime(toDate) - new Date(fromDate).getTime()) / 24) *
        3600000;

      const payrollHours = await this.getPayrollHours({
        employees,
        fromDate,
        toDate,
        org,
      });

      // console.log(
      //   "[payrollDAO:generatePayroll]: Line 276 -> payrollHours: ",
      //   payrollHours
      // );

      let totalPayment = 0;

      const payslips = payrollHours.map(
        ({ regular, leave, overtime, status, employeePosition, ...rest }) => {
          const { salary } = employeePosition;
          // console.log(
          //   "[payrollDAO:generatePayroll]: Line 332 -> Employee salary: ",
          //   salary
          // );

          const hourlyRate = roundNumber(salary / (8 * 30));

          // Todo: Create payslip only if payrollHours status is approved

          const earnings = [
            {
              desc: "Regular",
              rate: hourlyRate,
              hours: regular,
              amount: roundNumber(hourlyRate * regular),
            },
            {
              desc: "Paid Leave",
              rate: hourlyRate,
              hours: leave,
              amount: roundNumber(hourlyRate * leave),
            },
            {
              desc: "Overtime",
              rate: hourlyRate,
              hours: overtime,
              amount: roundNumber(hourlyRate * overtime),
            },
          ];
          const earningsTotal = roundNumber(
            earnings.reduce((prev, n) => prev + n.amount, 0)
          );
          const grossIncome = earningsTotal;
          const { taxRate, deduction } = computeIncomeTax(earningsTotal);
          const deductions = [
            {
              desc: "Income Tax",
              rate: taxRate,
              amount: roundNumber(grossIncome * taxRate - deduction),
            },
            {
              desc: "Pension",
              rate: 0.7,
              amount: roundNumber(grossIncome * (1 - 0.7)),
            },
          ];
          const deductionsTotal = roundNumber(
            deductions.reduce((prev, n) => prev + n.amount, 0)
          );

          const netPayment = roundNumber(earningsTotal - deductionsTotal);

          totalPayment += netPayment;

          return {
            ...rest,
            employeePosition,
            fromDate,
            toDate,
            payDate,
            earnings,
            deductions,
            earningsTotal,
            deductionsTotal,
            netPayment,
            status,
          };
        }
      );

      const payrollInfo = {
        org,
        title,
        employeesCount: payrollHours.length,
        totalPayment,
        fromDate,
        toDate,
        payDate,
        frequency: [28, 31, 20, 29].includes(dateRangeInDays)
          ? "Monthly"
          : dateRangeInDays === 14
          ? "Bi-Weekly"
          : dateRangeInDays === 7
          ? "Weekly"
          : "Custom",
        payType:
          payType && payType.toLowerCase() === "daily" ? "Daily" : "Hourly",
        status: "pending",
      };

      // Register payroll to database
      const payrollResult = await PayrollDAO.addPayroll(payrollInfo);

      // Register payslips to database
      await PayslipDAO.importPayslips(
        payslips.map((p) => ({
          ...p,
          payrollId: payrollResult.insertedId,
          payrollTitle: title,
        }))
      );

      return payrollResult.insertedId;
    } catch (e) {
      console.error(`Unable to generate payroll {new}, ${e}`);
      return { server: true, error: e };
    }
  }

  static async processPayroll(args) {
    try {
      const {
        org,
        orgId,
        title,
        employees = [],
        fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        toDate = new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ),
        payDate = new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ),
        payType = "Daily",
        commissionEnabled,
        salesData,
      } = args;

      // Validate query/params/body data
      if (!title) {
        return { error: "'Title' is required" };
      }
      if (
        !salesData ||
        salesData.length <= 0 ||
        !salesData[0].hasOwnProperty("date") ||
        !salesData[0].hasOwnProperty("count")
      ) {
        return {
          error: "Sales data not properly formatted. Please provide one.",
        };
      }

      let positionsMap = {};
      let employeesFromDb = [];
      const holidaysByOrg = {};
      if (!org && !orgId) {
        // Fetch org data
        const orgs = await OrgDAO.getOrgs();
        // const orgsMap =
        orgs.map((org) => {
          const { positions = [], holidays = [] } = org;
          positionsMap = positions
            .map((p) => ({ [p._id]: p }))
            .reduce((o, c) => ({ ...o, ...c }), positionsMap);
          // Fetch employees for payroll
          employeesFromDb = [
            ...employeesFromDb,
            ...(org.employees || []).filter((e) =>
              employees.length > 0 ? employees.includes(e._id) : true
            ),
          ];
          holidaysByOrg[org._id] = holidays;
          return { [org._id]: org };
        });
      } else {
        const eOrg = await OrgDAO.getOrgById(org || orgId);
        const { positions = [], holidays = [] } = eOrg || {};
        positionsMap = positions
          .map((p) => ({ [p._id]: p }))
          .reduce((o, c) => ({ ...o, ...c }), positionsMap);
        employeesFromDb = (org.employees || []).filter((e) =>
          employees.length > 0 ? employees.includes(e._id) : true
        );
        holidaysByOrg[position._id] = holidays;
      }

      // Fetch attendance for payroll
      const attendanceByDate = await AttendanceDAO.getAttendances({
        from: fromDate,
        to: toDate,
      });

      // Fetch leaves for payroll
      const leaves = await LeaveDAO.getLeaves({ fromDate, toDate });

      const salesByDate = salesData
        .map(({ date, count }) => ({ [date]: count }))
        .reduce((prev, next) => Object.assign({}, prev, next), {});

      let totalPayment = 0;
      const payslips = employeesFromDb.map(
        ({ _id, firstName, surName, lastName, org, position }) => {
          // Get salary & commission rate from employee's job title
          const { salary = 1025, commissionRate = 0.2 } =
            positionsMap[position] || {};
          const dailyRate = commissionRate;

          let attendanceDates = [];
          let leaveDates = [];
          const holidays = (holidaysByOrg[org] || []).map(({ date }) => date);
          let overtimeDates = [];

          // Find the paid dates (approved attendance, approved leave, and holidays)
          attendanceDates = Object.keys(attendanceByDate)
            .map((date) => {
              return attendanceByDate[date]
                .filter(
                  (a) =>
                    a.employeeId === _id &&
                    a.workedHours > 7 &&
                    a.status === "approved"
                )
                .map(({ date }) => date);
            })
            .reduce((p, n) => [...p, ...n], []);
          leaveDates = leaves
            .filter((l) => l.employeeId === _id && l.status === "approved")
            .map(({ fromDate, toDate }) => {
              const dates = [];
              for (
                let d = fromDate;
                d <= toDate;
                d = new Date(new Date(d).getTime() + 24 * 3600000)
              ) {
                dates.push(d);
              }
              return dates;
            })
            .reduce((p, n) => [...p, ...n], []);

          const paidDates = [...attendanceDates, ...leaveDates, ...holidays];
          // Find overtime dates
          overtimeDates = paidDates.filter(
            (d) => holidays.includes(d) && attendanceDates.includes(d)
          );

          // Filter the unique paid dates only
          // const uniquePaidDates = paidDates
          //   .map((d) => ({ [d]: true }))
          //   .reduce((p, n) => ({ ...p, ...n }), {});

          // console.log("[payrollDAO]: Unique dates: ", uniquePaidDates);

          let regularCommission = 0;
          let leaveCommission = 0;
          let holidayCommission = 0;
          let overtimeCommission = 0;
          let commission = 0;

          if (commissionEnabled) {
            regularCommission = computeCommission(
              commissionRate,
              [...attendanceDates.filter((d) => !overtimeDates.includes(d))],
              salesByDate
            );

            leaveCommission = computeCommission(
              commissionRate,
              leaveDates,
              salesByDate
            );

            holidayCommission = computeCommission(
              commissionRate,
              holidays.filter((d) => !overtimeDates.includes(d)),
              salesByDate
            );

            overtimeCommission = computeCommission(
              commissionRate * 2,
              overtimeDates,
              salesByDate
            );

            commission =
              regularCommission +
              leaveCommission +
              holidayCommission +
              overtimeCommission;
          }

          const grossIncome = salary + commission;
          console.log("[payrollDAO]: Line 718 -> Gross income: ", grossIncome);
          const { taxRate, deduction } = computeIncomeTax(grossIncome);
          const incomeTaxAmount = grossIncome * taxRate - deduction;
          const pensionAmount = grossIncome * 0.3;

          const earnings = [
            {
              desc: "Regular",
              rate: dailyRate,
              hours: attendanceDates.length * 10,
              days: attendanceDates.length,
              amount: regularCommission,
            },
            {
              desc: "Paid leave",
              rate: dailyRate,
              hours: leaveDates.length * 10,
              days: leaveDates.length,
              amount: leaveCommission,
            },
            {
              desc: "Overtime",
              rate: dailyRate,
              hours: overtimeDates.length * 10,
              days: overtimeDates.length,
              amount: overtimeCommission,
            },
            {
              desc: "Holidays",
              rate: dailyRate,
              hours: holidays.length * 10,
              days: holidays.length,
              amount: holidayCommission,
            },
          ];
          const earningsTotal =
            grossIncome || earnings.reduce((sum, n) => sum + n.amount, 0);
          console.log("[payrollDAO]: Line 753 -> Earnings: ", earnings);

          const deductions = [
            { desc: "Income tax", rate: taxRate, amount: incomeTaxAmount },
            { desc: "Pension", rate: 0.7, amount: pensionAmount },
          ];
          const deductionsTotal = deductions.reduce(
            (sum, n) => sum + n.amount,
            0
          );

          const netPayment = earningsTotal - deductionsTotal;

          // Total payroll payment
          totalPayment += netPayment;

          return {
            employeeId: _id,
            employeeName: `${firstName} ${surName} ${lastName}`,

            earnings,
            earningsTotal,
            deductions,
            deductionsTotal,
            netPayment,

            salary,
            commission,
            grossIncome,
            incomeTaxAmount,
            pensionAmount,
          };
        }
      );

      // Create payroll data
      const payrollInfo = {
        org: org || orgId,
        title,
        fromDate,
        toDate,
        payType,
        payDate,
        employeeCount: payslips.length,
        totalPayment,
        createdOn: new Date(),
      };

      // add payroll to database
      const { insertedId } = await this.addPayroll(payrollInfo);

      // add payslips to database
      await PayslipDAO.importPayslips(
        payslips.map((p) => ({
          payrollId: insertedId,
          payrollTitle: title,
          fromDate,
          toDate,
          status: "pending",
          ...p,
        }))
      );

      // return payroll id
      return insertedId;
    } catch (e) {
      console.error(`Error processing payroll, ${e}`);
      return { error: e, server: true };
    }
  }

  static async generatePayrollOlder({}) {
    try {
      const dateRangeInDays =
        ((new Date().getTime(toDate) - new Date(fromDate).getTime()) / 24) *
        3600000;

      const payrollDetails = {
        fromDate,
        toDate,
        payDate,
        frequency: [28, 31, 20, 29].includes(dateRangeInDays)
          ? "Monthly"
          : dateRangeInDays === 14
          ? "Bi-Weekly"
          : dateRangeInDays === 7
          ? "Weekly"
          : "Custom",
        payType:
          payType && payType.toLowerCase() === "daily" ? "Daily" : "Hourly",
      };

      const datesSummary = await PayrollDateDAO.generateSummary({
        employees,
        fromDate,
        toDate,
      });

      const payslips = datesSummary.map(
        ({
          totalWorkedHours,
          totalLeaveHours,
          totalHolidayHours,
          totalOvertimeHours,
          totalWorkedDays,
          employeeDetails,
        }) => {
          const employeeId = employeeDetails._id;
          const { positionDetails } = employeeDetails;

          console.log("PositionDetails: ", positionDetails);

          const { salary, allowances = [], deductibles = [] } = positionDetails;
          const payslipMetadata = {
            ...payrollDetails,

            employeeId,
            salary,
            allowances,
            deductibles,
          };

          let earnings = [];

          const dailyRate = salary / 30;
          console.log("Daily rate: ", dailyRate);
          const hourlyRate = salary / (30 * 7);
          console.log("Hourly rate: ", hourlyRate);

          const workedDaysEarning = dailyRate * totalWorkedDays;
          const workedHoursEarning = hourlyRate * totalWorkedHours;
          const overtimeHoursEarning = hourlyRate * totalOvertimeHours;
          const leaveHoursEarning = hourlyRate * totalLeaveHours;
          const holidayHoursEarning = hourlyRate * totalHolidayHours;

          // console.log("Worked days earnings: ", workedDaysEarning);
          // console.log("Worked hours earnings: ", workedHoursEarning);
          // console.log("Overtime hours earnings: ", overtimeHoursEarning);
          // console.log("Leave hours earnings: ", leaveHoursEarning);
          // console.log("Holiday hours earnings: ", holidayHoursEarning);

          // earnings.push(
          //   payrollDetails.payType ? workedHoursEarning : workedDaysEarning
          // );
          // earnings.push(leaveHoursEarning);
          // earnings.push(holidayHoursEarning);
          // earnings.push(overtimeHoursEarning);
          // earnings.push(allowanceEarning);
          // earnings.push(bonusEarning);

          // Add allowances (part of salary structure) to payslip earnings
          allowances.forEach((s) => earnings.push(s));
          const earningsSummary = [
            {
              desc: "Standard hours",
              rate: hourlyRate,
              hours: totalWorkedHours,
              amount: workedHoursEarning,
            },
            {
              desc: "Paid leave hours",
              rate: hourlyRate,
              hours: totalLeaveHours,
              amount: leaveHoursEarning,
            },
            {
              desc: "Overtime hours",
              rate: hourlyRate,
              hours: totalOvertimeHours,
              amount: overtimeHoursEarning,
            },
            {
              desc: "Holiday hours",
              rate: hourlyRate,
              hours: totalLeaveHours,
              amount: leaveHoursEarning,
            },
          ];
          // Add calculated earnings to payslip
          earningsSummary.forEach((s) => earnings.push(s));

          // Calculate total earnings amount
          let earningsTotal = 0;
          earningsTotal += earnings.reduce(
            (sum, { amount }) => (sum += amount),
            0
          );

          let deductions = [];
          // Add deductibles (part of salary structure) to payslip deductions
          deductibles.forEach((s) => deductions.push(s));

          const { taxAmount, taxRate } = computeIncomeTax(earningsTotal);
          const deductionsSummary = [
            { desc: "Income tax", rate: taxRate, amount: taxAmount },
            { desc: "Pension", rate: 0.7, amount: earningsTotal * 0.3 },
          ];
          // Add calculated deductions to payslip
          deductionsSummary.forEach((s) => deductions.push(s));

          // Calculate total deduction amount
          let deductionsTotal = 0;
          deductionsTotal += deductions.reduce(
            (sum, { amount }) => (sum += amount),
            0
          );

          const netPayment = earningsTotal - deductionsTotal;

          totalPayment += netPayment;

          return Object.freeze({
            ...payslipMetadata,
            earnings,
            deductions,
            earningsTotal,
            deductionsTotal,
            netPayment,
          });
        }
      );

      const { insertedId, error } = await PayrollDAO.addPayroll({
        org,
        title,
        employeesCount: payslips.length,
        totalPayment,
        status: "pending",
        ...payrollDetails,
      });

      if (error) throw new Error(error);

      const payrollId = insertedId;
      const result = await PayslipDAO.importPayslips(
        payslips.map(({ employeeId, ...rest }) => ({
          employeeId,
          payrollId,
          ...rest,
        }))
      );

      if (result.error) throw new Error(result.error);

      return payrollId;
    } catch (e) {
      console.error(`Unable to generate payroll {old}, ${e}`);
      return { server: true, error: e };
    }
  }

  static async getReport(filterCriteria) {
    try {
      const result = await this.getPayrolls(filterCriteria);
      console.dir(result);
      let payrollReport = {
        byMonth: {},
        payments: {},
      };

      result.forEach(({ fromDate, totalPayment, payslips }) => {
        // by month
        const month = new Date(fromDate).getMonth();

        payrollReport.byMonth[month] = payrollReport.byMonth[month]
          ? payrollReport.byMonth[month] + totalPayment
          : totalPayment;

        // payments
        Array.from(payslips).forEach(({ _id, employeeId, netPayment }) => {
          const { totalAmount, paystubs } =
            payrollReport.payments[employeeId] || {};
          payrollReport.payments[employeeId] = {
            ...payrollReport.payments[employeeId],
            employeeId,
            totalAmount: totalAmount ? totalAmount + netPayment : netPayment,
            paystubs: [...(paystubs || []), _id],
          };
        });
      });
      return payrollReport;
    } catch (e) {
      console.error(`Unable to generate payroll report, ${e}`);
      return { error: e };
    }
  }
}

module.exports = PayrollDAO;
