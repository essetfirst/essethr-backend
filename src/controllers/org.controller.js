const { OrgDAO } = require("../dao");

// const Joi = require("joi");
// const OrgValidation = require("../validation/org");

const { DEFAULT_ATTENDANCE_POLICY } = require("../constants");

class OrgController {
  static async apiGetOrgs(req, res) {
    const result = await OrgDAO.getOrgs({ ...req.query });

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
      attendancePolicy: DEFAULT_ATTENDANCE_POLICY,
      // leaveTypes: DEFAULT_LEAVE_TYPES,
    };
    const result = await OrgDAO.createOrg(orgInfo);

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: result.server ? null : result.error });
    }

    return res
      .status(201)
      .json({ success: true, message: "New organization registered" });
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

    return res.json({ success: true, message: "Organization updated!" });
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
