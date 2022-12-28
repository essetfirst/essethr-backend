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

const PayrollDAO = require("../dao/payrollDAO");

// const PayrollValidation = require("../validation/payroll");

/**
 *
 */
class PayrollController {
  static async apiGetPayrolls(req, res) {
    // console.log(req.org)
    const result = await PayrollDAO.getPayrolls({ org: String(req.org) });
    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      total_results: result.length,
      payrolls: result,
    });
  }

  static async apiGetPayrollById(req, res) {
    const result = await PayrollDAO.getPayrollById(req.params.id);
    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      payroll: result,
    });
  }

  static async apiGetPayrollHours(req, res) {
    const result = await PayrollDAO.getPayrollHours({
      org: req.org,
      ...req.body,
      ...req.query,
    });

    if (!result || result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      payrollHours: result,
      message: "Payroll hours generated",
    });
  }

  static async apiGeneratePayroll(req, res) {
    const payrollProcessor = req.body.commissionEnabled
      ? "processPayroll"
      : "generatePayroll";
    console.log(payrollProcessor)
    const result = await PayrollDAO[payrollProcessor]({
      org: req.org,
      ...req.body,
      ...req.query,
    });
    console.log(result)
    if (!result || result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      payroll: result,
      message: "Payroll generated",
    });
  }

  static async apiAddPayroll(req, res) {
    // TODO: payrollInfo validation
    // const { valid, errors } = await Joi.validate(req.body, PayrollValidation);

    // if (!valid || Object.keys(errors).length > 0) {
    //   return res.status(400).json({ success: false, error: errors });
    // }

    const result = await PayrollDAO.addPayroll({ ...req.body, org: req.org });
    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      message: "Payroll added",
    });
  }

  static async apiUpdatePayroll(req, res) {
    const result = await PayrollDAO.updatePayroll({
      _id: req.params.id,
      ...req.body,
    });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      payroll: result,
      message: "Payroll updated",
    });
  }

  static async apiDeletePayroll(req, res) {
    const result = await PayrollDAO.deletePayroll(req.params.id);

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      message: "Payroll deleted",
    });
  }

  static async apiGetReport(req, res) {
    const result = await PayrollDAO.getReport({ org: req.org, ...req.query });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      report: result,
    });
  }

  static async apiGetPayslips(req, res) {}

  static async apiImportPayrolls(req, res) {}
  static async apiExportPayrolls(req, res) {}
}

module.exports = PayrollController;
