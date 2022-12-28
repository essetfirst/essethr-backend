const { DepartmentDAO } = require("../dao");

class DepartmentController {
  static async apiGetDepartments(req, res) {
    const result = await DepartmentDAO.get({
      org: req.params.org,
      ...req.query,
    });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    return res.status(200).json({
      success: true,
      total_results: result.length,
      departments: result,
    });
  }

  static async apiGetDepartmentById(req, res) {
    const { id } = req.params;
    const result = await DepartmentDAO.getById(id);
    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    return res.status(200).json({
      success: true,
      department: result,
    });
  }

  static async apiCreateDepartment(req, res) {
    const result = await DepartmentDAO.create({
      ...req.body,
      org: req.params.org || req.body.org,
    });

    console.log("We have requested for dept create: ", result && result.ops);

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    console.log("We have jumped to return result: ");

    return res.status(201).json({
      success: true,
      department: result.ops[0],
      message: "New department created!",
    });
  }

  static async apiUpdateDepartment(req, res) {
    const result = await DepartmentDAO.update({
      _id: req.params.id,
      ...req.body,
    });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    console.log(result);
    return res.status(200).json({
      success: true,
      department: result,
      message: "New department updated!",
    });
  }

  static async apiDeleteDepartment(req, res) {
    const result = await DepartmentDAO.delete({ _id: req.params.id });
    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department deleted!",
    });
  }
}

module.exports = DepartmentController;
