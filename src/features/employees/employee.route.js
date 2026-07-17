const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fileUpload = require("../../middlewares/fileUpload");
const cors = require("cors");
const requirePermission = require("../../middlewares/requirePermission");
const validate = require("../../middlewares/validate");
const { PERMISSIONS } = require("../../constants/permissions");
const EmployeeCtrl = require("./employee.controller");
const {
  createEmployeeSchema,
  updateEmployeeSchema,
  transferEmployeeSchema,
  employeeListQuerySchema,
  employeeIdParamSchema,
} = require("./employee.schema");

router
  .route("/export")
  .get(requirePermission(PERMISSIONS.EMPLOYEES_EXPORT), EmployeeCtrl.apiExportEmployees);

router
  .route("/import")
  .post(requirePermission(PERMISSIONS.EMPLOYEES_IMPORT), EmployeeCtrl.apiImportEmployees);

router
  .route("/report")
  .get(requirePermission(PERMISSIONS.EMPLOYEES_READ), EmployeeCtrl.apiGetReport);

router
  .route("/search")
  .get(requirePermission(PERMISSIONS.EMPLOYEES_READ), EmployeeCtrl.apiSearchEmployees);

router
  .route("/filter")
  .get(requirePermission(PERMISSIONS.EMPLOYEES_READ), EmployeeCtrl.apiFilterEmployees);

router.route("/download").get(
  cors({ exposedHeaders: ["Content-Disposition"] }),
  requirePermission(PERMISSIONS.EMPLOYEES_READ),
  EmployeeCtrl.downloadFile,
);

router
  .route("/")
  .get(
    requirePermission(PERMISSIONS.EMPLOYEES_READ),
    validate(employeeListQuerySchema, { source: "query" }),
    EmployeeCtrl.apiGetEmployees,
  )
  .post(
    requirePermission(PERMISSIONS.EMPLOYEES_WRITE),
    fileUpload.addEmployeeMultiple,
    validate(createEmployeeSchema),
    EmployeeCtrl.apiCreateEmployee,
  );

router
  .route("/:id/transfer")
  .post(
    requirePermission(PERMISSIONS.EMPLOYEES_WRITE),
    validate(employeeIdParamSchema, { source: "params" }),
    validate(transferEmployeeSchema),
    EmployeeCtrl.apiTransferEmployee,
  );

router
  .route("/:id")
  .get(
    requirePermission(PERMISSIONS.EMPLOYEES_READ),
    validate(employeeIdParamSchema, { source: "params" }),
    EmployeeCtrl.apiGetEmployeeById,
  )
  .put(
    requirePermission(PERMISSIONS.EMPLOYEES_WRITE),
    validate(employeeIdParamSchema, { source: "params" }),
    fileUpload.addEmployeeMultiple,
    validate(updateEmployeeSchema),
    EmployeeCtrl.apiUpdateEmployee,
  )
  .delete(
    requirePermission(PERMISSIONS.EMPLOYEES_DELETE),
    validate(employeeIdParamSchema, { source: "params" }),
    EmployeeCtrl.apiDeleteEmployee,
  );

router
  .route("/:id/details")
  .get(
    requirePermission(PERMISSIONS.EMPLOYEES_READ),
    validate(employeeIdParamSchema, { source: "params" }),
    EmployeeCtrl.apiGetEmployeeDetailsById,
  );

router
  .route("/:id/activity")
  .get(
    requirePermission(PERMISSIONS.EMPLOYEES_READ),
    validate(employeeIdParamSchema, { source: "params" }),
    EmployeeCtrl.apiGetEmployeeActivity,
  );

router
  .route("/:id/profile-completion")
  .get(
    requirePermission(PERMISSIONS.EMPLOYEES_READ),
    validate(employeeIdParamSchema, { source: "params" }),
    EmployeeCtrl.apiGetEmployeeProfileCompletion,
  );

router
  .route("/:id/upload-image")
  .put(
    requirePermission(PERMISSIONS.EMPLOYEES_WRITE),
    validate(employeeIdParamSchema, { source: "params" }),
    fileUpload.addEmployeeProfile,
    EmployeeCtrl.apiUploadEmployeeImage,
  );

module.exports = router;
