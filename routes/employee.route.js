const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const EmployeeCtrl = require("../controllers/employee.controller");

router.route("/export").get(EmployeeCtrl.apiExportEmployees);
router.route("/import").get(EmployeeCtrl.apiImportEmployees);
router.route("/report").get(EmployeeCtrl.apiGetReport);
router.route("/search").get(EmployeeCtrl.apiSearchEmployees);

router
  .route("/")
  .get(EmployeeCtrl.apiGetEmployees)
  .post(upload.single("image"), EmployeeCtrl.apiCreateEmployee);
router
  .route("/:id")
  .get(EmployeeCtrl.apiGetEmployeeById)
  .put(upload.single("image"), EmployeeCtrl.apiUpdateEmployee)
  .delete(EmployeeCtrl.apiDeleteEmployee);

router.route("/:id/details").get(EmployeeCtrl.apiGetEmployeeDetailsById);
router
  .route("/:id/upload-image")
  .put(upload.single("image"), EmployeeCtrl.apiUploadEmployeeImage);

module.exports = router;
