const router = require("express").Router();

const authenticate = require("../middlewares/authenticate");

const healthRoutes = require("./health.route");
const signupRoutes = require("./signup.route");
const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");

const orgRoutes = require("./org.route");
const employeeRoutes = require("./employee.route");
const attendanceRoutes = require("./attendance.route");
const leaveRoutes = require("./leaves.route");
const payrollRoutes = require("./payroll.route");

router.use("/", signupRoutes);
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/orgs", authenticate, orgRoutes);
router.use("/employees", authenticate, employeeRoutes);
router.use("/attendance", authenticate, attendanceRoutes);
router.use("/leaves", authenticate, leaveRoutes);
router.use("/payrolls", authenticate, payrollRoutes);

module.exports = router;
