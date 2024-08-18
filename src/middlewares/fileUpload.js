const multer = require("multer");
const path = require("path");
const cloudnary = require("../config/cloudnary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");


const storage = new CloudinaryStorage({
  cloudinary: cloudnary,
  params: {
    folder: "DEV",
  },
  allowedFormats: ["jpg", "png", "jpeg", "JPG", "PNG", "JPEG"],
}); 

const attendanceStorage = multer.diskStorage({
  destination: "uploads/attendance",
  filename: (req, file, cb) => {
    // console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, `attend--${Date.now()}.${ext}`);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(xlsx|XLSX)$/)) {
      return cb(new Error("Please upload a valid file like excel only"), false);
    }
    cb(undefined, true);
  },
});

const employeeStorage = multer.diskStorage({
  destination: "uploads/employees",
  filename: (req, file, cb) => {
    // console.log(file);
    // const ext = file.mimetype.split("/")[1];
    cb(null, file.originalname);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf|PDF)$/)) {
      return cb(
        new Error("Please upload a valid file, only pdf files allowed."),
        false
      );
    }
    cb(undefined, true);
  },
});

const employeeIdStorage = multer.diskStorage({
  destination: "uploads/employees",
  filename: (req, file, cb) => {
    console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, `Id-Passport--${Date.now()}.${ext}`);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|JPEG|JPG|jpg|gif|GIF|png|PNG)$/)) {
      return cb(new Error("Please upload a valid file"), false);
    }
    cb(undefined, true);
  },
});

const employeeProfileStorage = multer.diskStorage({
  destination: "uploads/employees",
  filename: (req, file, cb) => {
    console.log("Destination");
    // console.log(file);
    // cb(null, file);
    cb(null, file.originalname);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|JPEG|JPG|jpg|gif|png|GIF|PNG)$/)) {
      return cb(new Error("Please upload a valid file"), false);
    }
    cb(undefined, true);
  },
});

const employeeDegreeStorage = multer.diskStorage({
  destination: "public",
  filename: (req, file, cb) => {
    // console.log(file);
    // const ext = file.mimetype.split("/")[1];
    console.log(file);
    cb(null,file.originalname);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|JPEG|JPG|jpg|gif|GIF|png|PNG|pdf|PDF)$/)) {
      return cb(
        new Error("Please upload a valid file, only pdf or image files allowed"),
        false
      );
    }
    cb(undefined, true);
  },
});

const employeeMasterStorage = multer.diskStorage({
  destination: "uploads/employees",
  filename: (req, file, cb) => {
    console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, `Masters--${Date.now()}.${ext}`);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|JPEG|JPG|jpg|gif|GIF|png|PNG)$/)) {
      return cb(new Error("Please upload a valid file"), false);
    }
    cb(undefined, true);
  },
});

const employeeSupportStorage = multer.diskStorage({
  destination: "uploads/employees",
  filename: (req, file, cb) => {
    // console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, file.originalname);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|JPEG|JPG|jpg|gif|GIF|png|PNG)$/)) {
      return cb(new Error("Please upload a valid file"), false);
    }
    cb(undefined, true);
  },
});

exports.addEmployeeID = multer({ storage: employeeIdStorage }).any("card");
exports.addEmployeeMultiple = multer({
  storage: employeeDegreeStorage,
  limits: { fileSize: 1024 * 1024 * 5 },
}).fields([
  {
    name: "cv",
    maxCount: 1,
  },
  {
    name: "image",
    maxCount: 1,
  },
]);
exports.addEmployeeMasters = multer({ storage: employeeMasterStorage }).any("masters");
exports.addEmployeeSupport = multer({ storage: employeeSupportStorage }).any("image");
exports.addEmployeeProfile = multer({ storage: employeeProfileStorage }).single("image");

exports.addEmployeeCredentials = multer({ storage: employeeStorage }).single("file");
exports.importAttendance = multer({ storage: attendanceStorage }).single("file");
