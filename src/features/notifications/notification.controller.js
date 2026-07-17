const { ok, fail } = require("../../lib/apiResponse");
const NotificationDAO = require("./notificationDAO");
const { notifyUser, notifyRole } = require("./notification.service");
const { sendEmail, verifySmtpConnection, isEmailConfigured } = require("../../lib/email.service");
const { LeaveDAO } = require("../leaves/leaveDAO");
const AnnouncementDAO = require("../announcements/announcementDAO");
const WorkflowDAO = require("../workflows/workflowDAO");

async function syncOperationalAlerts(req) {
  const org = String(req.org);
  const user = req.user;
  const role = String(user?.role || "").toUpperCase();

  const announcements = await AnnouncementDAO.list(org, { activeOnly: true });
  await Promise.all(
    (announcements || []).slice(0, 3).map((a) =>
      notifyUser({
        org,
        userId: user._id,
        type: "announcement",
        title: a.title,
        message: (a.body || "").slice(0, 120),
        href: "/app/portal",
        resourceType: "announcement",
        resourceId: a._id,
        dedupeKey: `ann-${user._id}-${a._id}`,
      }),
    ),
  );

  if (["ADMIN", "HR_MANAGER", "SUPERVISOR"].includes(role)) {
    const leaves = await LeaveDAO.getLeaves({ org });
    const pending = (leaves?.error ? [] : leaves).filter(
      (l) => l.status === "pending" || !l.approved,
    );
    if (pending.length) {
      await notifyUser({
        org,
        userId: user._id,
        type: "leave",
        title: `${pending.length} leave request(s) pending`,
        message: "Review and approve in Leave Management or Work Inbox.",
        href: "/app/inbox",
        dedupeKey: `leaves-pending-${user._id}-${org}`,
      });
    }
  }

  if (["ADMIN", "HR_MANAGER"].includes(role)) {
    const approvals = await WorkflowDAO.listRequests(org, { status: "pending" });
    const pendingApprovals = (approvals || []).filter((r) => r.status === "pending");
    if (pendingApprovals.length) {
      await notifyUser({
        org,
        userId: user._id,
        type: "approval",
        title: `${pendingApprovals.length} workflow approval(s) waiting`,
        message: "Open Workflows or Work Inbox to action requests.",
        href: "/app/inbox",
        dedupeKey: `wf-pending-${user._id}-${org}`,
      });
    }
  }
}

class NotificationController {
  static async inbox(req, res) {
    try {
      const org = String(req.org);
      const userId = String(req.user._id);

      await syncOperationalAlerts(req);

      const items = await NotificationDAO.listForUser(userId, org, { limit: 50 });
      const unreadCount = await NotificationDAO.countUnread(userId, org);

      const notifications = items.map((n) => ({
        id: String(n._id),
        type: n.type,
        title: n.title,
        message: n.message,
        href: n.href,
        read: !!n.readAt,
        createdOn: n.createdOn,
      }));

      return ok(res, { notifications, unreadCount });
    } catch (e) {
      console.error(e);
      return fail(res, "Could not load notifications.", 500);
    }
  }

  static async markRead(req, res) {
    try {
      const updated = await NotificationDAO.markRead(req.params.id, req.user._id);
      const doc = updated?.value || updated;
      if (!doc) {
        return fail(res, "Notification not found.", 404);
      }
      return ok(res, { success: true });
    } catch (e) {
      console.error(e);
      return fail(res, "Could not mark notification.", 500);
    }
  }

  static async markAllRead(req, res) {
    try {
      await NotificationDAO.markAllRead(req.user._id, req.org);
      return ok(res, { success: true });
    } catch (e) {
      console.error(e);
      return fail(res, "Could not mark notifications.", 500);
    }
  }

  static async testEmail(req, res) {
    try {
      const to = req.body?.email || req.user?.email;
      if (!to) {
        return fail(res, "No email address provided.", 400);
      }

      if (isEmailConfigured()) {
        const verify = await verifySmtpConnection();
        if (!verify.ok) {
          return fail(res, verify.error, 400);
        }
      }

      await sendEmail({
        to,
        subject: "Esset HR — test notification",
        text: "This is a test email from your HR system notification settings.",
        html: "<p>This is a <strong>test email</strong> from your HR system notification settings.</p>",
      });

      const message = isEmailConfigured()
        ? "Test email sent."
        : "SMTP not configured — message logged to server console.";

      return ok(res, { success: true, message });
    } catch (e) {
      console.error(e);
      return fail(res, e.message || "Could not send test email.", 500);
    }
  }
}

NotificationController.notifyUser = notifyUser;
NotificationController.notifyRole = notifyRole;

module.exports = NotificationController;
