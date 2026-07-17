// const OrgDAO = require("../org/orgDAO");
const { ObjectID,ObjectId } = require("mongodb");
const AttendanceDAO = require("../attendance/attendanceDAO");
const EmployeeDAO = require("../employees/employeeDAO");
const AuditService = require("../audit/audit.service");
const { getOrgSettings } = require("../../lib/settingsResolver");


class AttendanceController {
  static async apiGetAttendances(req, res) {
    const today = new Date().toISOString().slice(0, 10);
    const filter = {
      orgId: req.org,
      fromDate: req.query.fromDate || req.query.from || today,
      toDate: req.query.toDate || req.query.to || today,
      employees: req.query.employees ? String(req.query.employees).split(",") : [],
    };
    const result = await AttendanceDAO.getAttendances(filter);
    // console.log(result)
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
  static async apiGetAllAttendances(req, res) {
    // if (req.body) {
    const date = new Date();
    const filter = {
      orgId: req.org
      // checkin:{$exists:true}
    };
    console.log(filter);
    const result = await AttendanceDAO.getAllAttendances(filter);
    // console.log(result)
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
  static async apiGetTodayAttendance(req, res) {
    const filter = {
      orgId: req.org,
    };
    const result = await AttendanceDAO.getTodayAttendances(filter);
    console.log(result);

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
    const settings = await getOrgSettings(req.org);
    const gracePeriodMinutes = settings.attendance?.gracePeriodMinutes ?? 15;

    const result = await AttendanceDAO.checkin({
      orgId: req.org,
      gracePeriodMinutes,
      ...req.body,
    });

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
    const result = await AttendanceDAO.checkout({
      orgId: req.org,
      ...req.body,
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

    await AuditService.log(req, { action: "attendance.approve", resource: "attendance", summary: `Approved ${employees.length} records` });

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

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    await AuditService.log(req, {
      action: "attendance.update",
      resource: "attendance",
      resourceId: String(req.body.employeeId),
      summary: `Updated attendance ${req.body.date}`,
    });

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

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    await AuditService.log(req, { action: "attendance.delete", resource: "attendance", resourceId: String(id) });

    res.status(201).json({
      success: true,
      message: `Deleted ${result.deletedCount} attendance entries !`,
    });
  }

  static async apiGetReport(req, res) {
    const result = await AttendanceDAO.getReport({
      orgId: new ObjectId(req.org),
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
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
  static async apiGetDailyReport(req, res) {
          const today = new Date().toJSON().slice(0, 10).replace(/-/g, "-");

    let result = await AttendanceDAO.getReport({
      orgId: new ObjectId(req.org),
      fromDate: today,
      toDate:today
    });
    console.log(result)
    // const empCount = await EmployeeDAO.getEmployees({ org: String(req.org) });
    // const resultLength = result.map((item) => item.count).reduce((prev, next) => prev + next);
    // const absentCount = empCount.length > resultLength ? empCount.length - resultLength : 0;
    // const absent = { "_id": "absent", "count": absentCount };
    // result.push(absent)

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }
    return res.json({
      success: true,
      // total:result.map((item) => item.count).reduce((prev, next) => prev + next),
      report: result
    });
  }
  static async apiImportAttendace(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, error: "No file uploaded." });
      }

      const result = await AttendanceDAO.importAttendance({
        filename: file,
        orgId: req.org,
      });

      if (result?.error) {
        return res.status(result.server ? 500 : 400).json({
          success: false,
          error: result.error,
          imported: result.inserted || 0,
          errors: result.errors || [],
        });
      }

      await AuditService.log(req, {
        action: "attendance.import",
        resource: "attendance",
        summary: `Imported ${result.inserted} attendance row(s)`,
        metadata: { imported: result.inserted, failed: result.errors?.length || 0 },
      });

      return res.status(201).json({
        success: true,
        imported: result.inserted,
        errors: result.errors || [],
        message: `Imported ${result.inserted} attendance row(s).`,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Import failed." });
    }
  }
  static async apiExportAttendace(req, res) {
    const result = await AttendanceDAO.exportAttendance({
      orgId: req.org,
      employees: [],
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
    });

    console.log(result);

    if (!result) {
      return res.status(result ? 500 : 400).json({
        success: false,
        error: "Something went wrong.",
      });
    }

    res.status(201).json({
      success: true,
      message: ` Attendace  Exported Successfully !`,
    });
  }
}

module.exports = AttendanceController;
