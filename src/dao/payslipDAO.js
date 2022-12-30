const { ObjectID } = require("mongodb");

let payslips;

/**
 * @typedef EarningInfo
 * @property {String} description
 * @property {number} unit
 * @property {number} ratePerUnit
 * @property {number} amount
 */

/**
 * @typedef DeductionInfo
 * @property {String} description
 * @property {number} rate
 * @property {number} amount
 */

/**
 * @typedef PayslipInfo type representation of a payslip instance
 * @property {number} employeeId The employee for this payslip
 * @property {number} payrollId The payroll with which this payslip is associated
 * @property {Date} fromDate
 * @property {Date} toDate
 * @property {String} payDate
 * @property {String["Weekly", "Bi-Weekly", "Monthly"]} frequency
 * @property {Array<EarningInfo>} earnings
 * @property {Array<DeductionInfo>} deductions
 * @property {number} earningsTotal
 * @property {number} deductionsTotal
 *
 */
class PayslipDAO {
  static async injectDB(db) {
    try {
      payslips = await db.collection("payslips");
      await payslips.createIndex({ employeeId: 1, payrollId: 1 });
    } catch (e) {
      console.error(`Unable to establish handle for PayslipDAO, ${e}`);
      return { error: e };
    }
  }

  /**
   * Saves a new payslip record in the database
   * @param {PayslipInfo} payslipInfo
   */
  static async createPayslip(payslipInfo) {
    try {
      return await payslips.insertOne(payslipInfo);
    } catch (e) {
      console.error(`Unable to create payslip record, ${e}`);
      return { error: e };
    }
  }

  /**
   * Imports payslip records into the database
   * @param {Array<PayslipInfo>} payslips
   */
  static async importPayslips(payslipList) {
    try {
      return await payslips.insertMany(payslipList);
    } catch (e) {
      console.error(`Unable to import payslip records, ${e}`);
      return { error: e };
    }
  }

  /**
   * Returns filtered payslip record results from the database
   * @param {Object} filterCriteria filter parameters
   */
  static async getPayslips(filterCriteria = {}) {
    try {
      const { employees, from, to } = filterCriteria;
      let query = {};
      if (employees && Array.isArray(employees)) {
        query = { employeeId: { $in: employees } };
      }
      if (from && Date.parse(from) === typeof Date) {
        query = { ...query, fromDate: { $gte: from } };
      }
      if (to && Date.parse(to) === typeof Date) {
        query = { ...query, toDate: { $lte: to } };
      }
      return await payslips.find(query).toArray();
    } catch (e) {
      console.error(`Unable to fetch payslip records, ${e}`);
      return { error: e };
    }
  }

  static async getPayslipById(payslipId) {
    try {
      let query = { _id: ObjectID(payslipId) };
      return await payslips.findOne(query);
    } catch (e) {
      console.error(`Unable to delete payslip record by Id, ${e}`);
      return { error: e };
    }
  }

  static async getPayrollPayslips(payrollId) {
    try {
      let query = { payrollId: ObjectID(payrollId) };
      return await payslips.find(query).toArray();
    } catch (e) {
      console.error(`Unable to fetch payroll batch payslip records, ${e}`);
      return { error: e };
    }
  }

  static async deletePayslipById(payslipId) {
    try {
      let query = { _id: ObjectID(payslipId) };
      return await payslips.deleteMany(query);
    } catch (e) {
      console.error(`Unable to delete payslip record by Id, ${e}`);
      return { error: e };
    }
  }

  static async deletePayrollPayslips(payrollId) {
    try {
      let query = { payrollId: ObjectID(payrollId) };
      return await payslips.deleteMany(query);
    } catch (e) {
      console.error(`Unable to delete payroll payslip records, ${e}`);
      return { error: e };
    }
  }

  static async deleteAllPayslips() {
    try {
      return await payslips.deleteMany();
    } catch (e) {
      console.error(`Unable to delete all payslip records, ${e}`);
      return { error: e };
    }
  }
}

module.exports = PayslipDAO;
