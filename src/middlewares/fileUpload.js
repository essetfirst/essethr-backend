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

exports.importAttendance = multer({ storage: attendanceStorage }).single("file");
