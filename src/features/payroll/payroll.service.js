const computeIncomeTax = require("../../lib/computeIncomeTax");
const computePension = require("../../lib/computePension");
const PayrollDAO = require("./payrollDAO");
const PayslipDAO = require("./payslipDAO");
const PayrollDateDAO = require("./payrollDateDAO");
const { getOrgSettings } = require("../../lib/settingsResolver");

class PayrollService {
  static computeDeductions(grossSalary) {
    const salary = Number(grossSalary) || 0;
    const { taxAmount } = computeIncomeTax(salary);
    const pensionAmount = computePension(salary);
    return {
      grossSalary: salary,
      incomeTax: taxAmount,
      pension: pensionAmount,
      netSalary: salary - taxAmount - pensionAmount,
    };
  }

  static async listPayrolls(orgId) {
    const org = String(orgId);
    const settings = await getOrgSettings(org);
    await PayrollDAO.autoLockStalePayrolls(org, settings.payroll?.lockAfterDays ?? 7);
    return PayrollDAO.getPayrolls({ org });
  }

  static async getPayrollHours(params) {
    return PayrollDAO.getPayrollHours(params);
  }

  static async generatePayroll(params) {
    const processor = params.commissionEnabled ? "processPayroll" : "generatePayroll";
    return PayrollDAO[processor](params);
  }

  static async addPayrollDates(dates) {
    return PayrollDateDAO.addDates(dates);
  }

  static async createPayslip(payslipInfo) {
    return PayslipDAO.createPayslip(payslipInfo);
  }
}

module.exports = PayrollService;
