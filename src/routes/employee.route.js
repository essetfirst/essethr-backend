const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const authenticate = require("../middlewares/authenticate");
const fileUpload = require("../middlewares/fileUpload");
const cors = require("cors");
const EmployeeCtrl = require("../controllers/employee.controller");

router.route("/export").get(EmployeeCtrl.apiExportEmployees);
router.route("/import").get(EmployeeCtrl.apiImportEmployees);
router.route("/report").get(EmployeeCtrl.apiGetReport);
router.route("/search").get(EmployeeCtrl.apiSearchEmployees);
router.route("/filter").get(EmployeeCtrl.apiFilterEmployees);
router.route("/download").get(
  cors({
    exposedHeaders: ["Content-Disposition"],
  }),
  EmployeeCtrl.downloadFile
);
router
  .route("/")
  .get(authenticate, EmployeeCtrl.apiGetEmployees)
  .post(authenticate,fileUpload.addEmployeeMultiple,EmployeeCtrl.apiCreateEmployee);
      
router
  .route("/:id")
  .get(EmployeeCtrl.apiGetEmployeeById)
  .put(fileUpload.addEmployeeMultiple, EmployeeCtrl.apiUpdateEmployee)
  .delete(EmployeeCtrl.apiDeleteEmployee);

router.route("/:id/details").get(EmployeeCtrl.apiGetEmployeeDetailsById);
router
  .route("/:id/upload-image")
  .put(fileUpload.addEmployeeProfile, EmployeeCtrl.apiUploadEmployeeImage);

module.exports = router;
