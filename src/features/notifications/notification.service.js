const NotificationDAO = require("./notificationDAO");
const UserService = require("../users/user.service");
const { sendEmail } = require("../../lib/email.service");
const { getOrgSettings } = require("../../lib/settingsResolver");

async function sendEmailIfEnabled(org, userId, { subject, text, html }) {
  try {
    const settings = await getOrgSettings(org);
    if (!settings?.notifications?.emailEnabled) return null;

    const user = await UserService.getUserById(String(userId));
    if (!user?.email) return null;

    return sendEmail({ to: user.email, subject, text, html });
  } catch (e) {
    console.error("[notify] email failed:", e.message);
    return null;
  }
}

async function notifyUser({
  org, userId, type, title, message, href, resourceType, resourceId, dedupeKey, emailSubject, emailText,
}) {
  if (!userId) return null;

  const notification = await NotificationDAO.create({
    org,
    userId: String(userId),
    type,
    title,
    message,
    href,
    resourceType,
    resourceId,
    dedupeKey,
  });

  await sendEmailIfEnabled(org, userId, {
    subject: emailSubject || title,
    text: emailText || `${message}${href ? `\n\nOpen: ${href}` : ""}`,
    html: `<p>${message || title}</p>${href ? `<p><a href="${href}">View in Esset HR</a></p>` : ""}`,
  });

  return notification;
}

async function notifyRole({ org, roles, ...payload }) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  const users = await UserService.getUsersByOrg(org);
  const list = Array.isArray(users) ? users : users?.items || [];
  const targets = list.filter((u) => roleList.includes(String(u.role || "").toUpperCase()));
  await Promise.all(
    targets.map((u) =>
      notifyUser({
        org,
        userId: u._id,
        ...payload,
        dedupeKey: payload.dedupeKey ? `${payload.dedupeKey}-${u._id}` : null,
      }),
    ),
  );
}

module.exports = { notifyUser, notifyRole, sendEmailIfEnabled };
