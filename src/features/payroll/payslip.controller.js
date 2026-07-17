const PayslipDAO = require("./payslipDAO");
const EmployeeDAO = require("../employees/employeeDAO");
const PositionDAO = require("../org/positionDAO");
const OrgDAO = require("../org/orgDAO");
const { ok, fail } = require("../../lib/apiResponse");

class PayslipController {
  static async apiGetPayslipById(req, res) {
    try {
      const payslip = await PayslipDAO.getPayslipById(req.params.id);
      if (!payslip) {
        return fail(res, "Payslip not found.", 404);
      }
      if (String(payslip.org) !== String(req.org)) {
        return fail(res, "Payslip not in current branch.", 403);
      }

      let employee = null;
      let positionTitle = "";
      if (payslip.employeeId) {
        employee = await EmployeeDAO.getEmployeeById({ id: String(payslip.employeeId) });
        if (employee?.position) {
          const position = await PositionDAO.getPositionById(employee.position);
          positionTitle = position?.title || "";
        }
      }

      const orgDoc = await OrgDAO.getOrgById(String(payslip.org));
      const branchLabel = orgDoc?.branch || orgDoc?.name || "Organization";

      const earningsTotal = payslip.earningsTotal ?? payslip.netPay ?? 0;
      const deductionsTotal = payslip.deductionsTotal ?? 0;
      const netPayment = payslip.netPayment ?? payslip.netPay ?? earningsTotal - deductionsTotal;

      return ok(res, {
        payslip: {
          ...payslip,
          _id: String(payslip._id),
          organization: branchLabel,
          employeeName: employee
            ? `${employee.firstName || ""} ${employee.surName || employee.lastName || ""}`.trim()
            : "Employee",
          employeePhone: employee?.phone || "",
          employeeImage: employee?.image || "",
          employeePosition: positionTitle,
          employeeGender: employee?.gender,
          payrollId: payslip.payrollId ? String(payslip.payrollId) : "",
          payrollTitle: payslip.payrollTitle || "Payslip",
          earnings: payslip.earnings || [
            { desc: "Base salary", hours: "—", rate: "—", amount: earningsTotal },
          ],
          deductions: payslip.deductions || [
            { desc: "Tax & deductions", rate: "15%", amount: deductionsTotal },
          ],
          earningsTotal,
          deductionsTotal,
          netPayment,
        },
      });
    } catch (e) {
      console.error(e);
      return fail(res, "Failed to load payslip.", 500);
    }
  }
}

module.exports = PayslipController;
