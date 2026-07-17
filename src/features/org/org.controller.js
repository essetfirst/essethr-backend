const OrgDAO = require("../org/orgDAO");
const BranchService = require("./branch.service");
const DepartmentDAO = require("./departmentDAO");
const PositionDAO = require("./positionDAO");

// const Joi = require("joi");
// const OrgValidation = require("../validation/org");

const { DEFAULT_ATTENDANCE_POLICY } = require("../../constants");

async function ensureBranchBaseline(orgId) {
  const orgStr = String(orgId);
  const departments = await DepartmentDAO.get({ org: orgStr });
  if (Array.isArray(departments) && departments.length > 0) return;

  const deptRes = await DepartmentDAO.create({
    name: "General",
    org: orgStr,
    location: "Branch HQ",
  });
  if (deptRes?.error || !deptRes?.insertedId) return;

  await PositionDAO.createPosition({
    title: "Employee",
    org: orgStr,
    department: deptRes.insertedId,
    level: "",
    manager: "",
    salary: 0,
    allowances: [],
    deductions: [],
  });
}

class OrgController {
  static async apiGetOrgs(req, res) {
    const { companySlug, branchesOnly, ...rest } = req.query;
    let query = { ...rest };

    if (branchesOnly === "true" || branchesOnly === true) {
      const company = companySlug || (await BranchService.getCompanySlugForOrg(req.org));
      if (company) query.companySlug = company;
    }

    const result = await OrgDAO.getOrgs(query);

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

    return res.json({
      success: true,
      total_results: result.length,
      orgs: result,
    });
  }

  static async apiGetBranches(req, res) {
    const orgId = req.query.orgId || req.org;
    const companySlug = await BranchService.getCompanySlugForOrg(orgId);

    if (!companySlug) {
      return res.json({ success: true, total_results: 0, branches: [] });
    }

    const result = await OrgDAO.getOrgs({ companySlug });

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

    const branches = (result || []).sort((a, b) => {
      if (a.isMainBranch && !b.isMainBranch) return -1;
      if (!a.isMainBranch && b.isMainBranch) return 1;
      return String(a.branch || "").localeCompare(String(b.branch || ""));
    });

    return res.json({
      success: true,
      total_results: branches.length,
      branches,
    });
  }

  static async apiGetOrgById(req, res) {
    const result = await OrgDAO.getOrgById(req.params.id);

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }
    console.log(result);
    return res.json({
      success: true,
      org: Array.isArray(result) ? result[0] : result,
    });
  }

  static async apiGetOrgBySlug(req, res) {
    const { slug } = req.params;

    const result = await OrgDAO.getOrgBySlug(slug);

    if (result && result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

    console.log(result);

    return res.json({ success: true, org: result });
  }

  static async apiCreateOrg(req, res) {
    // Org validation
    // const { valid, errors } = await OrgValidation.validate(req.body);
    // console.error(valid, errors);
    // if (!valid || Object.keys(errors).length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     error: Object.values(errors || {}).join(", "),
    //   });
    // }
    // let defaultAttendancePolicy = {};
    // for (let i = 0; i < 6; i++) {
    //   defaultAttendancePolicy[i] = {
    //     workStartTime: "08:30 AM",
    //     workEndTime: "05:30 PM",
    //     breakStartTime: "12:30 AM",
    //     breakEndTime: "02:00 PM",
    //   };
    // }
    // const attendancePolicy = {
    //   ...defaultAttendancePolicy,
    //   5: {
    //     workStartTime: "08:30 AM",
    //     workEndTime: "12:30 AM",
    //   },
    // };

    const orgInfo = {
      ...req.body,
      createdBy: req.body.createdBy || req.user?.email,
      attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
    };

    if (req.body.parentOrgId) {
      orgInfo.parentOrgId = req.body.parentOrgId;
    } else if (!orgInfo.companySlug && req.org) {
      const home = await BranchService.getOrgById(req.org);
      if (home && req.body.branch && req.body.branch !== home.branch) {
        orgInfo.parentOrgId = req.org;
      }
    }

    const result = await OrgDAO.createOrg(orgInfo);

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

    if (orgInfo.parentOrgId && result.org?._id) {
      await ensureBranchBaseline(result.org._id);
      const refreshed = await OrgDAO.getOrgById(result.org._id);
      if (refreshed && !refreshed.error) {
        result.org = refreshed;
      }
    }

    return res.status(201).json({
      success: true,
      message: orgInfo.parentOrgId
        ? "New branch created"
        : "New organization registered",
      org: result.org,
    });
  }

  static async apiGetLeaveTypes(req, res) {
    const result = await OrgDAO.getOrgById(req.params.id);

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }
    console.log(result);
    return res.json({
      success: true,
      leaveTypes: ((Array.isArray(result) ? result[0] : result) || {})
        .leaveTypes,
    });
  }

  static async apiAddLeaveType(req, res) {
    const result = await OrgDAO.updateOrg({
      _id: req.params.id,
      ...req.body,
    });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({ success: true, message: "Leave type added!" });
  }

  static async apiUpdateLeaveType(req, res) {
    const result = await OrgDAO.updateOrg({
      _id: req.params.id,
      ...req.body,
    });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({ success: true, message: "Leave type updated!" });
  }

  // v1: Efficiency problem: getOrgById more time
  // static async apiGetAttendancePolicy(req, res) {
  //   const result = await OrgDAO.getOrgById(req.params.id);

  //   if (result.error) {
  //     return res
  //       .status(result.server ? 500 : 400)
  //       .json({ success: false, error: result.server ? null : result.error });
  //   }
  //   console.log(result);
  //   return res.json({
  //     success: true,
  //     attendancePolicy: ((Array.isArray(result) ? result[0] : result) || {})
  //       .attendancePolicy,
  //   });
  // }

  // v2: using a dedicated getAttendanePolicy

  static async apiGetAttendancePolicy(req, res) {
    const result = await OrgDAO.getAttendancePolicy(req.params.id || req.org);

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      attendancePolicy: result,
    });
  }

  static async apiUpdateAttendancePolicy(req, res) {
    const result = await OrgDAO.updateAttendancePolicy(req.params.id, {
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
      message: "Organization attendance policy updated!",
    });
  }

  static async apiResetAttendancePolicy(req, res) {
    const result = await OrgDAO.updateAttendancePolicy(req.params.id, {});

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({
      success: true,
      message: "Organization attendance policy updated!",
    });
  }

  static async apiUpdateOrg(req, res) {
    const result = await OrgDAO.updateOrg({
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
      message: "Organization updated!",
      org: { _id: req.params.id, ...req.body },
    });
  }

  static async apiDeleteOrg(req, res) {
    const result = await OrgDAO.deleteOrg(req.params.id);

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong" : result.error,
      });
    }

    return res.json({ success: true, message: "Organization deleted!" });
  }
}

module.exports = OrgController;
