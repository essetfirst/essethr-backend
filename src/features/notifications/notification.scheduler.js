const { LeaveDAO } = require("../leaves/leaveDAO");
const { DocumentDAO } = require("../documents/documentDAO");
const UserService = require("../users/user.service");
const EmployeeDAO = require("../employees/employeeDAO");
const { notifyUser } = require("./notification.service");
const SettingsDAO = require("../settings/settingsDAO");

const DAY_MS = 86400000;

function dateOnly(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function daysUntil(dateStr) {
  const target = new Date(dateStr).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.round((target - today) / DAY_MS);
}

async function runNotificationJobs() {
  try {
    const orgs = await SettingsDAO.listOrgIds();
    if (!orgs.length) {
      const fromUsers = await discoverOrgsFromUsers();
      orgs.push(...fromUsers);
    }

    for (const org of [...new Set(orgs)]) {
      await processLeaveReminders(org);
      await processDocumentExpiry(org);
    }
  } catch (e) {
    console.error("[notification-jobs]", e.message);
  }
}

async function discoverOrgsFromUsers() {
  const users = await UserService.getUsers();
  if (!Array.isArray(users)) return [];
  return [...new Set(users.map((u) => u.org).filter(Boolean))];
}

async function processLeaveReminders(org) {
  const settings = await SettingsDAO.getByOrg(org);
  if (!settings?.notifications?.emailEnabled) return;

  const reminderDays = Number(settings.notifications.leaveReminderDays) || 3;
  const leaves = await LeaveDAO.getLeaves({ org });
  const list = leaves?.error ? [] : leaves;

  for (const leave of list) {
    if (leave.status !== "approved" && leave.approved !== true) continue;
    const start = leave.startDate || leave.from;
    if (!start) continue;
    const days = daysUntil(start);
    if (days < 0 || days > reminderDays) continue;

    const user = await UserService.getUserByEmployeeId(String(leave.employeeId));
    if (!user?._id) continue;

    await notifyUser({
      org,
      userId: user._id,
      type: "leave_reminder",
      title: `Leave starts in ${days} day(s)`,
      message: `Your ${leave.leaveType || "leave"} begins on ${dateOnly(start)}.`,
      href: "/app/portal",
      dedupeKey: `leave-reminder-${leave._id}-${days}`,
      emailSubject: `Reminder: leave starting ${dateOnly(start)}`,
    });
  }
}

async function processDocumentExpiry(org) {
  const settings = await SettingsDAO.getByOrg(org);
  if (!settings?.notifications?.emailEnabled) return;

  const alertDays = Number(settings.notifications.documentExpiryDays) || 30;
  const result = await DocumentDAO.list({ org, limit: 500 });
  const docs = result?.items || [];

  const now = Date.now();
  const windowEnd = now + alertDays * DAY_MS;

  for (const doc of docs) {
    if (!doc.expiresOn || !doc.employeeId) continue;
    const exp = new Date(doc.expiresOn).getTime();
    if (exp < now || exp > windowEnd) continue;

    const user = await UserService.getUserByEmployeeId(String(doc.employeeId));
    if (!user?._id) continue;

    const days = Math.max(0, Math.ceil((exp - now) / DAY_MS));
    await notifyUser({
      org,
      userId: user._id,
      type: "document_expiry",
      title: `Document expiring: ${doc.title}`,
      message: `"${doc.title}" expires in ${days} day(s).`,
      href: "/app/portal",
      resourceType: "document",
      resourceId: doc._id,
      dedupeKey: `doc-exp-${doc._id}`,
      emailSubject: `Document expiry: ${doc.title}`,
    });

    const emp = await EmployeeDAO.getEmployeeById({ id: doc.employeeId });
    const empData = Array.isArray(emp) ? emp[0] : emp;
    if (empData?.department) {
      await notifyRoleManagers(org, empData.department, doc, days);
    }
  }
}

async function notifyRoleManagers(org, departmentId, doc, days) {
  const { notifyRole } = require("./notification.service");
  await notifyRole({
    org,
    roles: ["HR_MANAGER", "ADMIN"],
    type: "document_expiry_hr",
    title: `Employee document expiring`,
    message: `"${doc.title}" for employee ${doc.employeeId} expires in ${days} day(s).`,
    href: "/app/employees",
    dedupeKey: `doc-exp-hr-${doc._id}`,
  });
}

function startNotificationScheduler(intervalMs = 6 * 60 * 60 * 1000) {
  setTimeout(runNotificationJobs, 30000);
  setInterval(runNotificationJobs, intervalMs);
  console.log("[notification-jobs] scheduler started");
}

module.exports = { runNotificationJobs, startNotificationScheduler };
