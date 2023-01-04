const { LeaveTypeDAO } = require("../dao");

class LeaveTypeController {
  static async apiGetLeaveTypes(req, res) {
    const result = await LeaveTypeDAO.get({
      org: req.params.org,
      ...req.query,
    });

    console.log(result, req.params.org)

   if (!(result && result !== "null" && result !== "undefined")) {
     return res.status(500).json({
       success: false,
       error: "Something went wrong.",
     });
   }

    return res.status(200).json({
      success: true,
      total_results: result.length,
      leaveTypes: result,
    });
  }

  static async apiGetLeaveTypeById(req, res) {
    const { id } = req.params;
    const result = await LeaveTypeDAO.getById(id);
    console.log(result)
    if (!(result && result !== "null" && result !== "undefined")) {
      return res.status(500).json({
        success: false,
        error: "Something went wrong.",
      });
    }

    return res.status(200).json({
      success: true,
      leaveType: result,
    });
  }

  static async apiAddLeaveType(req, res) {
    const result = await LeaveTypeDAO.add({
      ...req.body,
      org: req.params.org || req.body.org || req.org,
    });

    if (!(result && result !== "null" && result !== "undefined")) {
      return res.status(500).json({
        success: false,
        error: "Something went wrong.",
      });
    }


    return res.status(201).json({
      success: true,
      leaveType: result.ops ? result.ops : result,
      message: "New leave type added!",
    });
  }

  static async apiUpdateLeaveType(req, res) {
    const result = await LeaveTypeDAO.update({
      _id: req.params.id,
      ...req.body,
    });

    if (!(result && result !== "null" && result !== "undefined")) {
      return res.status(500).json({
        success: false,
        error: "Something went wrong.",
      });
    }

    console.log(result);
    return res.status(200).json({
      success: true,
      leaveType: result,
      message: "Leave type updated!",
    });
  }

  static async apiDeleteLeaveType(req, res) {
    const result = await LeaveTypeDAO.delete({ _id: req.params.id });
    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Leave type deleted!",
    });
  }
}

module.exports = LeaveTypeController;
