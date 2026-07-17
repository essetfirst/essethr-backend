const nodemailer = require("nodemailer");

let transporter = null;

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

function getTransporter() {
  if (transporter) return transporter;
  if (!isEmailConfigured()) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  if (!to) return { skipped: true, reason: "no_recipient" };

  const transport = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@essethr.local";

  if (!transport) {
    console.log("[email:dev]", { to, subject, text: (text || "").slice(0, 200) });
    return { dev: true, logged: true };
  }

  const info = await transport.sendMail({
    from,
    to,
    subject,
    text: text || subject,
    html: html || `<p>${text || subject}</p>`,
  });

  return { messageId: info.messageId };
}

async function verifySmtpConnection() {
  const transport = getTransporter();
  if (!transport) {
    return { ok: false, error: "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env" };
  }
  await transport.verify();
  return { ok: true };
}

module.exports = { sendEmail, isEmailConfigured, verifySmtpConnection };
