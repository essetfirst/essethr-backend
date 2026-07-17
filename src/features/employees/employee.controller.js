const { ObjectID, ObjectId } = require("mongodb");
const EmployeeService = require("./employee.service");
const EmployeeDAO = require("./employeeDAO");
const AuditService = require("../audit/audit.service");
const BranchService = require("../org/branch.service");
const AuditDAO = require("../audit/auditDAO");
const UserService = require("../users/user.service");
const DepartmentDAO = require("../org/departmentDAO");
const PositionDAO = require("../org/positionDAO");
const { normalizeRoleKey } = require("../../constants/systemRoles");
const fs = require("fs");
const uploadCloud = require("../../config/cloudnary");

// const { path } = require("../app");

// const EmployeeValidation = require("../validation/employee");

class EmployeeController {
  static async apiGetEmployees(req, res) {
    const result = await EmployeeService.listEmployees({ user: req.user, query: req.query });
    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

    return res.json({
      success: true,
      total_results: result.pagination.total,
      employees: result.data,
      pagination: result.pagination,
    });
  }

  static async apiGetEmployeeById(req, res) {
    const result = await EmployeeDAO.getEmployeeById({ id: req.params.id });
    if (!(result && result !== "null" && result !== "undefined")) {
      return res
        .status(500)
        .json({ success: false, error: "something went wrong" });
    }
    return res.json({
      success: true,
      employee: Array.isArray(result) ? result[0] : result,
    });
  }

  static async apiGetEmployeeDetailsById(req, res) {
    const result = await EmployeeDAO.getEmployeeDetailsById(req.params.id);
    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }
    return res.json({
      success: true,
      employee: Array.isArray(result) ? result[0] : result,
    });
  }

  static async apiCreateEmployee(req, res) {
    const { isAttendanceRequired, deductCostShare } = req.body;
    const files = req.files;
    // const paths = files.map(file => file.path);
    // var importedata = paths.length > 1 ? {
    //   cv: String(String(paths[0]).split(".")[1]).toUpperCase() == "PDF" ? paths[0] : paths[1],
    //   image: String(String(paths[0]).split(".")[1]).toUpperCase() == "PDF" ? paths[1] : paths[0],
    // } : paths[0];
    // console.log(files);
    // const importedata =
    // console.log(importedata)
    // if (paths.length < 2 && String(String(paths[0]).split(".")[1]).toUpperCase() != "PDF") {
    //   return res.status(500).json({
    //     success: false,
    //     message: "Employee Cv is mandatory!. add as pdf only."
    //   });
    // ProductData.image = uploadCheck.url;
    const cv = req.files.cv ? req.files.cv[0].filename : "";
    const image = req.files.image ? req.files.image[0].filename : "";
    console.log(cv,image);
    if (!cv) {
      return res.status(500).json({
        success: false,
        message: "Employee Cv is mandatory!.",
      });
    }
    const isPDF = cv ? cv.split(".")[1].toUpperCase() : false;
    const isImage = image ? image.split(".")[1].toUpperCase() : false;
    if (isPDF != "PDF") {
      return res.status(500).json({
        success: false,
        message: "Employee Cv is pdf only!",
      });
    }
    const imageTypes = ["PNG", "JPEG", "GIF", "JPG"];
    if (isImage && !imageTypes.includes(isImage)) {
      return res.status(500).json({
        success: false,
        message: "Employee profile is valid image files only!",
      });
    }
    
    const uploadCV = await uploadCloud(cv);
    const uploadImage = await uploadCloud(image);
    console.log(uploadCV,cv,uploadImage,image)

    if (!req.org) {
      return res.status(400).json({ success: false, error: "Organization context is required." });
    }
    const result = await EmployeeDAO.createEmployee({
      org: String(req.org),
      ...req.body,
      cv:uploadCV.url? uploadCV.url :"",
      image:uploadImage.url? uploadImage.url:"",
      isAttendanceRequired: req.body.isAttendanceRequired
        ? req.body.isAttendanceRequired
        : true,
      deductCostShare: req.body.deductCostShare
        ? req.body.deductCostShare
        : false,
    });

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    } else {
      const employee = await EmployeeDAO.getEmployeeById(result.insertedId);
      await AuditService.log(req, {
        action: "employee.create",
        resource: "employee",
        resourceId: String(result.insertedId),
        summary: `Created employee ${req.body.firstName || ""} ${req.body.lastName || ""}`.trim(),
      });
      return res.status(201).json({
        success: true,
        message: "New employee profile created",
        employee,
      });
    }
  }

  static async apiUploadEmployeeImage(req, res) {
    // console.log(req.file);
    const vb = req.file;
    console.log(vb);
    const result = await EmployeeDAO.uploadEmployeeImage({
      _id: req.params.id,
      ...req.body,
      image: vb.path,
    });

    console.log(result);
    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    } else {
      const employee = await EmployeeDAO.getEmployeeById(req.params.id);

      return res.json({
        success: true,
        employee,
        message: "Employee profile image updated",
      });
    }
  }

  static async apiUpdateEmployee(req, res) {
  
     const cv = req.files?.cv ? req.files.cv[0].filename : "";
     const image = req.files?.image ? req.files.image[0].filename : "";
     // console.log(req.files.cv[0]);
     const isPDF = cv ? cv.split(".")[1].toUpperCase() : false;
     const isImage = image ? image.split(".")[1].toUpperCase() : false;
     if (isPDF && isPDF != "PDF") {
       return res.status(500).json({
         success: false,
         message: "Employee Cv is pdf only!",
       });
     }
     const imageTypes = ["PNG", "JPEG", "GIF", "JPG"];
     if (isImage && !imageTypes.includes(isImage)) {
       return res.status(500).json({
         success: false,
         message: "Employee profile is valid image files only!",
       });
     }
    // const cvChange = { "cv": cv };
    // const imageChange = { "image": image };
    console.log(cv, image);
    if (cv) {
      const uploadCV = await uploadCloud(cv);
      console.log(uploadCV)
      req.body.cv = uploadCV.url?uploadCV.url:"";
    }
    if (image) {
      const uploadImage = await uploadCloud(image);
      console.log(uploadImage);
      req.body.image = uploadImage.url? uploadImage.url :"";
    }
    const result = await EmployeeDAO.updateEmployee({
      _id: req.params.id,
      ...req.body,
    });

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    } else {
      const employee = await EmployeeDAO.getEmployeeById(req.params.id);

      await AuditService.log(req, {
        action: "employee.update",
        resource: "employee",
        resourceId: String(req.params.id),
        summary: "Updated employee profile",
      });

      return res.json({
        success: true,
        employee,
        message: "Employee profile updated",
      });
    }
  }

  static async apiTransferEmployee(req, res) {
    const employeeId = req.params.id;
    const { org: destinationOrg, department, position, effectiveDate, notes } =
      req.body;

    if (!destinationOrg || !department || !position) {
      return res.status(400).json({
        success: false,
        error: "Destination branch, department, and position are required.",
      });
    }

    const employee = await EmployeeDAO.getEmployeeById({ id: employeeId });
    if (!employee || employee.error) {
      return res.status(404).json({ success: false, error: "Employee not found." });
    }

    try {
      await BranchService.assertOrgAccess(req.homeOrg || req.user.org, employee.org);
      await BranchService.assertOrgAccess(req.homeOrg || req.user.org, destinationOrg);
    } catch (e) {
      return res.status(e.status || 403).json({ success: false, error: e.message });
    }

    const [fromOrg, toOrg, dept, pos] = await Promise.all([
      BranchService.getOrgById(employee.org),
      BranchService.getOrgById(destinationOrg),
      DepartmentDAO.getById(department),
      PositionDAO.getPositionById(position),
    ]);

    const jobHistoryEntry = {
      effectiveDate: effectiveDate || new Date().toISOString().slice(0, 10),
      type: "branch_transfer",
      previousOrg: String(employee.org),
      previousBranch: BranchService.resolveBranchLabel(fromOrg),
      previousDepartment: employee.department,
      previousPosition: employee.position,
      org: String(destinationOrg),
      branch: BranchService.resolveBranchLabel(toOrg),
      department: dept?.name || String(department),
      position: pos?.title || String(position),
      jobTitle: pos?.title || "",
      location: toOrg?.address?.city || "",
      notes: notes || "Branch transfer",
    };

    const result = await EmployeeDAO.transferEmployee({
      _id: employeeId,
      org: destinationOrg,
      department,
      position,
      jobHistoryEntry,
    });

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.error });
    }

    const linkedUser = await UserService.getUserByEmployeeId(String(employeeId));
    if (linkedUser?._id) {
      await UserService.updateUser({
        _id: linkedUser._id,
        org: String(destinationOrg),
      });
    }

    const updated = await EmployeeDAO.getEmployeeById({ id: employeeId });

    await AuditService.log(req, {
      action: "employee.transfer",
      resource: "employee",
      resourceId: String(employeeId),
      summary: `Transferred employee from ${BranchService.resolveBranchLabel(fromOrg)} to ${BranchService.resolveBranchLabel(toOrg)}`,
      metadata: {
        fromOrg: String(employee.org),
        toOrg: String(destinationOrg),
      },
    });

    return res.json({
      success: true,
      employee: updated,
      message: "Employee transferred successfully.",
    });
  }

  static async apiDeleteEmployee(req, res) {
    const result = await EmployeeDAO.deleteEmployee(req.params.id);

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

    await AuditService.log(req, {
      action: "employee.delete",
      resource: "employee",
      resourceId: String(req.params.id),
      summary: `Deleted employee ${req.params.id}`,
    });

    return res.json({
      success: true,
      employee: req.params.id,
      message: "Employee profile deleted",
    });
  }

  static async apiGetReport(req, res) {
    const result = await EmployeeDAO.getReport(req.query);

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

    return res.json({
      success: true,
      report: result,
    });
  }

  static async apiSearchEmployees(req, res) {
    const name = req.query.name;
    const nameUpper = name[0]
      .toUpperCase()
      .concat("", name.slice(1, name.length));
    const nameLower = name[0]
      .toLowerCase()
      .concat("", name.slice(1, name.length));

    const info = {
      firstName: { $in: [nameLower, nameUpper] },
      org: req.org,
    };
    console.log(info);
    const result = await EmployeeDAO.getEmployee(info);
    console.log(result);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Employee Not Found" });
    }
    return res.json({
      success: true,
      employee: result,
    });
  }
  static async apiFilterEmployees(req, res) {
    const data = req.query;
    let info = { org: String(req.org) };
    for (let i in data) {
      if (data[i]) {
        info[i] = data[i];
      }
    }
    // console.log(info)
    const result = await EmployeeDAO.filterEmployee(info);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Employee Not Found" });
    }

    console.log(Array.isArray(result));

    return res.json({
      success: true,
      employee: Array.isArray(result) ? result[0] : result,
    });
    // // return result
  }

  static async downloadFile(req, res) {
    // const data = req.query;
    // 
    try {
      const filename = 'Resume.pdf';
      const filepath = 'public/employees/Resume.pdf';
      console.log(filename, filepath);
      const stream = fs.createReadStream(filepath);
      console.log(stream)
      const headerST = {
        "Content-Disposition": "attachment; filename=Resume.pdf",
        "Content/type": "application/json"
      };
      console.log(headerST);
      res.set(headerST);
      
      console.log('--')
      console.log(res);
      stream.pipe(res);
      console.log("Done")
    } catch (err) {
      console.log("WEF",err); // // // return result
    }
  }
  static async apiImportEmployees(req, res) {
    try {
      const rows = req.body?.employees ?? req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Request body must be a non-empty JSON array of employees.",
        });
      }

      const org = String(req.org);
      const created = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const result = await EmployeeDAO.createEmployee({
            org,
            ...row,
            isAttendanceRequired: row.isAttendanceRequired ?? true,
            deductCostShare: row.deductCostShare ?? false,
          });
          if (result?.error) {
            errors.push({ index: i, error: String(result.error?.message || result.error) });
          } else {
            created.push(result.insertedId);
          }
        } catch (e) {
          errors.push({ index: i, error: e.message });
        }
      }

      await AuditService.log(req, {
        action: "employee.import",
        resource: "employee",
        summary: `Imported ${created.length} of ${rows.length} employees`,
        metadata: { created: created.length, failed: errors.length, errors },
      });

      return res.status(201).json({
        success: true,
        imported: created.length,
        failed: errors.length,
        employeeIds: created,
        errors,
        message: `Imported ${created.length} employee(s).`,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: "Import failed." });
    }
  }

  static async apiExportEmployees(req, res) {
    try {
      const result = await EmployeeDAO.getEmployees({ org: String(req.org) });
      if (result?.error) {
        return res.status(result.server ? 500 : 400).json({
          success: false,
          error: result.server ? "Something went wrong." : result.error,
        });
      }

      const employees = Array.isArray(result) ? result : result.items || [];
      const columns = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "department",
        "position",
        "status",
        "gender",
        "dateOfBirth",
      ];

      const escapeCsv = (val) => {
        const str = val == null ? "" : String(val);
        if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
        return str;
      };

      const header = columns.join(",");
      const lines = employees.map((emp) =>
        columns.map((col) => escapeCsv(emp[col])).join(","),
      );
      const csv = [header, ...lines].join("\n");

      await AuditService.log(req, {
        action: "employee.export",
        resource: "employee",
        summary: `Exported ${employees.length} employees as CSV`,
      });

      res.set("Content-Type", "text/csv; charset=utf-8");
      res.set("Content-Disposition", `attachment; filename="employees-${req.org}.csv"`);
      return res.send(csv);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: "Export failed." });
    }
  }

  static async apiGetEmployeeActivity(req, res) {
    try {
      const employeeId = String(req.params.id);
      const result = await AuditDAO.queryByResource({
        org: req.org,
        resourceId: employeeId,
        resource: "employee",
        limit: Number(req.query.limit) || 40,
      });
      if (result?.error) {
        return res.status(500).json({ success: false, error: "Failed to load activity." });
      }
      return res.json({ success: true, activity: result.items || [] });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Something went wrong." });
    }
  }

  static async apiGetEmployeeProfileCompletion(req, res) {
    try {
      const employee = await EmployeeDAO.getEmployeeById({ id: req.params.id });
      const emp = Array.isArray(employee) ? employee[0] : employee;
      if (!emp || emp.error) {
        return res.status(404).json({ success: false, error: "Employee not found." });
      }
      const fields = [
        { key: "firstName", label: "First name" },
        { key: "surName", label: "Surname" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "department", label: "Department" },
        { key: "position", label: "Position" },
        { key: "dateOfBirth", label: "Date of birth" },
        { key: "gender", label: "Gender" },
      ];
      const missing = fields.filter((f) => !emp[f.key] || String(emp[f.key]).trim() === "");
      const completion = Math.round(((fields.length - missing.length) / fields.length) * 100);
      return res.json({
        success: true,
        completion: { percent: completion, missing: missing.map((f) => f.label) },
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: "Something went wrong." });
    }
  }
}

module.exports = EmployeeController;
