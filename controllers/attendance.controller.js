// const { OrgDAO } = require("../dao");
const AttendanceDAO = require("../dao/attendanceDAO");

class AttendanceController {
  static async apiGetAttendances(req, res) {
    const filter = req.query;
    const result = await AttendanceDAO.getAttendances({
      ...filter,
      orgId: req.org,
    });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    res.status(200).json({
      success: true,
      total_results: result.length,
      attendance: result,
    });
  }

  static async apiSwipe(req, res) {
    const result = await AttendanceDAO.swipe({ orgId: req.org, ...req.body });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    res.status(201).json({ success: true, ...result });
  }

  static async apiCheckin(req, res) {
    const result = await AttendanceDAO.checkin({ orgId: req.org, ...req.body });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    res.status(201).json({
      success: true,
      message: result.message || "Employee checked in!",
    });
  }

  static async apiCheckout(req, res) {
    const result = await AttendanceDAO.checkout(req.body);

    // console.log(result);

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    res.status(201).json({
      success: true,
      message: result.message || "Employee checked out!",
    });
  }

  static async apiApproveAttendance(req, res) {
    const { employees, date } = req.body;

    if (!employees) {
      return res.status(400).json({
        success: false,
        error: "Employee id list 'employees' is required",
      });
    }

    if (
      !Array.isArray(employees) ||
      Object.values(employees).some((eId) => typeof eId !== "string")
    ) {
      return res.status(400).json({
        success: false,
        error: "Employee id list 'employees' is not properly formatted.",
      });
    }

    if (!employees.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Employee id list 'employees' needs to have at least one id.",
      });
    }

    if (!date) {
      return res
        .status(400)
        .json({ success: false, error: "Attendance 'date' is required" });
    }

    const result = await AttendanceDAO.approveAttendance({
      ...req.body,
      orgId: req.org,
    });

    console.log(result);

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    res.status(200).json({
      success: true,
      ...result,
    });
  }

  static async apiUpdateAttendance(req, res) {
    if (!req.body.employeeId) {
      return res.status(400).json({
        success: false,
        error: "Employee id 'employeeId' is required",
      });
    }

    if (!req.body.date) {
      return res
        .status(400)
        .json({ success: false, error: "Attendance 'date' is required" });
    }

    const result = await AttendanceDAO.updateAttendance({
      ...req.body,
      orgId: req.org,
    });

    // console.log(result);

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    res.status(200).json({
      success: true,

      message: "Employee attendance updated!",
    });
  }

  static async apiDeleteAttendance(req, res) {
    const id = req.params.id;
    const result = await AttendanceDAO.deleteAllAttendance({
      _id: id,
      ...req.query,
      ...req.body,
      orgId: req.org,
    });

    // console.log(result);

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    res.status(201).json({
      success: true,
      message: `Deleted ${result.deletedCount} attendance entries !`,
    });
  }

  static async apiGetReport(req, res) {
    const result = await AttendanceDAO.getReport({
      ...req.query,
      org: req.org,
    });

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
}

module.exports = AttendanceController;
