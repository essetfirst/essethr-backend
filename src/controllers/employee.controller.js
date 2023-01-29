const Joi = require("joi");
const { ObjectID, ObjectId } = require("mongodb");
const EmployeeDAO = require("../dao/employeeDAO");
const { parse, stringify, toJSON, fromJSON } = require("flatted");
const { string } = require("joi");
const cors = require("cors")
const fs = require("fs");
// const { path } = require("../app");

// const EmployeeValidation = require("../validation/employee");

class EmployeeController {
  static async apiGetEmployees(req, res) {
    // console.log("Alol");
    const { page = 1, limit = 20, ...rest } = req.query;
    const query = {
      page,
      limit,
      ...rest,
      org: req.query.org || req.query.orgId || req.org,
    };
    // console.log(query);
    const result = await EmployeeDAO.getEmployees(query);
    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

    return res.json({
      success: true,
      total_results: result.length,
      employees: result,
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
    console.log(files);
    // const importedata =
    // console.log(importedata)
    // if (paths.length < 2 && String(String(paths[0]).split(".")[1]).toUpperCase() != "PDF") {
    //   return res.status(500).json({
    //     success: false,
    //     message: "Employee Cv is mandatory!. add as pdf only."
    //   });
    const cv = req.files.cv ? req.files.cv[0].filename : "";
    const image = req.files.image ? req.files.image[0].filename : "";
    // console.log(req.files.cv[0]);
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

    const result = await EmployeeDAO.createEmployee({
      org: String(req.org),
      ...req.body,
      cv,
      image,
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
  
     const cv = req.files.cv ? req.files.cv[0].filename : "";
     const image = req.files.image ? req.files.image[0].filename : "";
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
      req.body.cv = cv;
    }
    if (image) {
      req.body.image = image;
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

      return res.json({
        success: true,
        employee,
        message: "Employee profile updated",
      });
    }
  }

  static async apiDeleteEmployee(req, res) {
    const result = await EmployeeDAO.deleteEmployee(req.params.id);

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

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
  static async apiImportEmployees(req, res) {}
  static async apiExportEmployees(req, res) {}
}

module.exports = EmployeeController;
