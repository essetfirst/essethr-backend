const chalk = require("chalk");
const app = require("./app");
const { startDb } = require("./db");
const { validateEnv } = require("./config/env");
const { startNotificationScheduler } = require("./features/notifications/notification.scheduler");
const { startReportScheduleRunner } = require("./features/reports/report.scheduler");
require("dotenv").config();

async function startServer() {
  try {
    validateEnv();
    await startDb();
    const { connectRedis } = require("./lib/redis");
    await connectRedis();
    startNotificationScheduler();
    startReportScheduleRunner();
    const port = process.env.PORT || 4001;
    app.listen(port, () => {
      console.log(`  Server running on port  ${port} \n`);
    });
  } catch (e) {
    console.error(chalk.red(`Couldn't start server: ${e.message}`));
    process.exit(1);
  }
}

startServer();
