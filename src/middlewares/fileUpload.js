const multer = require("multer");

const attendanceStorage = multer.diskStorage({
  destination: "uploads/attendance",
  filename: (req, file, cb) => {
    console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, `Attendance-${Date.now()}.${ext}`);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(csv|CSV|excel|EXCEL)$/)) {
      return cb(new Error("Please upload a valid file"), false);
    }
    cb(undefined, true);
  },
});

const employeeStorage = multer.diskStorage({
  destination: "uploads/employees",
  filename: (req, file, cb) => {
    console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, `emp--${Date.now()}.${ext}`);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|JPEG|JPG|jpg|gif|GIF|png|PNG)$/)) {
      return cb(new Error("Please upload a valid file"), false);
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

const employeeDegreeStorage = multer.diskStorage({
  destination: "uploads/employees",
  filename: (req, file, cb) => {
    console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, `Bachelor--${Date.now()}.${ext}`);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|JPEG|JPG|jpg|gif|GIF|png|PNG)$/)) {
      return cb(new Error("Please upload a valid file"), false);
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
    console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, `Support--${Date.now()}.${ext}`);
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|JPEG|JPG|jpg|gif|GIF|png|PNG)$/)) {
      return cb(new Error("Please upload a valid file"), false);
    }
    cb(undefined, true);
  },
});

exports.addEmployeeID = multer({ storage: employeeIdStorage }).any("card");
exports.addEmployeeBachelor= multer({ storage: employeeDegreeStorage }).any("degree");
exports.addEmployeeMasters = multer({ storage: employeeMasterStorage }).any("masters");
exports.addEmployeeSupport = multer({ storage: employeeSupportStorage }).any("support");

exports.addEmployeeCredentials = multer({ storage: employeeStorage }).array("images", 5);
exports.importAttendance = multer({ storage: attendanceStorage }).single("file");
