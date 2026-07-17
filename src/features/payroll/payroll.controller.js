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

const PayrollDAO = require("../payroll/payrollDAO");
const AuditService = require("../audit/audit.service");
const { getOrgSettings } = require("../../lib/settingsResolver");

// const PayrollValidation = require("../validation/payroll");

/**
 *
 */
class PayrollController {
  static async apiGetPayrolls(req, res) {
    const org = String(req.org);
    const settings = await getOrgSettings(org);
    await PayrollDAO.autoLockStalePayrolls(org, settings.payroll?.lockAfterDays ?? 7);

    const result = await PayrollDAO.getPayrolls({ org });
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
    const org = String(req.org);
    const settings = await getOrgSettings(org);
    await PayrollDAO.autoLockStalePayrolls(org, settings.payroll?.lockAfterDays ?? 7);

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
    const result = await PayrollDAO[payrollProcessor]({
      org:String(req.org),
      ...req.body,
      ...req.query,
    });
    if (!result || result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    await AuditService.log(req, { action: "payroll.generate", resource: "payroll", summary: "Payroll generated" });

    return res.json({
      success: true,
      payroll: result,
      message: "Payroll generated",
    });
  }

  static async apiLockPayroll(req, res) {
    const result = await PayrollDAO.lockPayroll(req.params.id, req.user._id);
    if (!result || result.error) {
      return res.status(400).json({ success: false, error: result?.error || "Cannot lock payroll." });
    }
    await AuditService.log(req, { action: "payroll.lock", resource: "payroll", resourceId: req.params.id });
    return res.json({ success: true, payroll: result, message: "Payroll locked." });
  }

  static async apiFinalizePayroll(req, res) {
    const result = await PayrollDAO.finalizePayroll(req.params.id, req.user._id);
    if (!result || result.error) {
      return res.status(400).json({ success: false, error: result?.error || "Cannot finalize." });
    }
    await AuditService.log(req, { action: "payroll.finalize", resource: "payroll", resourceId: req.params.id });
    return res.json({ success: true, payroll: result, message: "Payroll finalized." });
  }

  static async apiAddAdjustment(req, res) {
    const result = await PayrollDAO.addAdjustment(req.params.id, req.body);
    if (!result || result.error) {
      return res.status(400).json({ success: false, error: result?.error || "Cannot add adjustment." });
    }
    await AuditService.log(req, {
      action: "payroll.adjustment", resource: "payroll", resourceId: req.params.id,
      metadata: req.body,
    });
    return res.json({ success: true, payroll: result, message: "Adjustment added." });
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

    await AuditService.log(req, { action: "payroll.update", resource: "payroll", resourceId: req.params.id });

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

    await AuditService.log(req, { action: "payroll.delete", resource: "payroll", resourceId: req.params.id });

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

  static async apiValidatePayroll(req, res) {
    try {
      const payroll = await PayrollDAO.getPayrollById(req.params.id);
      if (!payroll || payroll.error) {
        return res.status(404).json({ success: false, error: "Payroll not found." });
      }
      if (String(payroll.org) !== String(req.org)) {
        return res.status(403).json({ success: false, error: "Access denied." });
      }

      const warnings = [];
      const errors = [];
      const payslips = payroll.payslips || [];

      if (!payslips.length) {
        errors.push({ code: "NO_PAYSLIPS", message: "No payslips generated for this run." });
      }

      payslips.forEach((ps) => {
        if (!ps.employeeId) {
          warnings.push({ code: "MISSING_EMPLOYEE", message: "Payslip missing employee reference." });
        }
        if (Number(ps.netPay) < 0) {
          errors.push({
            code: "NEGATIVE_NET",
            message: `Negative net pay detected for employee ${ps.employeeId || "unknown"}.`,
          });
        }
        if (Number(ps.grossPay) === 0 && Number(ps.netPay) === 0) {
          warnings.push({
            code: "ZERO_PAY",
            message: `Zero pay for employee ${ps.employeeId || "unknown"}.`,
          });
        }
      });

      const duplicateEmployees = payslips
        .map((p) => String(p.employeeId))
        .filter(Boolean);
      const dupSet = duplicateEmployees.filter(
        (id, idx) => duplicateEmployees.indexOf(id) !== idx,
      );
      if (dupSet.length) {
        errors.push({ code: "DUPLICATE_PAYSLIPS", message: "Duplicate payslips for same employee." });
      }

      if (payroll.status === "finalized") {
        warnings.push({ code: "ALREADY_FINALIZED", message: "Payroll is already finalized." });
      }

      const valid = errors.length === 0;

      await AuditService.log(req, {
        action: "payroll.validate",
        resource: "payroll",
        resourceId: String(req.params.id),
        summary: valid ? "Payroll validation passed" : "Payroll validation found issues",
        metadata: { errorCount: errors.length, warningCount: warnings.length },
      });

      return res.json({
        success: true,
        validation: { valid, errors, warnings, payslipCount: payslips.length, status: payroll.status },
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Validation failed." });
    }
  }

  static async apiComparePayroll(req, res) {
    try {
      const result = await PayrollDAO.compareWithPrevious(req.params.id, req.org);
      if (result?.error) {
        return res.status(404).json({ success: false, error: result.error });
      }
      return res.json({ success: true, comparison: result });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Comparison failed." });
    }
  }

  static async apiGetPayslips(req, res) {}

  static async apiImportPayrolls(req, res) {}
  static async apiExportPayrolls(req, res) {}
}

module.exports = PayrollController;
