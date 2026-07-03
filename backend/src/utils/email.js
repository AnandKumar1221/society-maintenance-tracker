const nodemailer = require("nodemailer");
require("dotenv").config();

// Builds a transporter from env vars. If SMTP isn't configured (e.g. local
// dev or grading without setting up an email account), emails are simply
// logged to the console instead of failing the request.
function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const transporter = buildTransporter();

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log(`[email:skipped - no SMTP configured] to=${to} subject="${subject}"`);
    return { skipped: true };
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "Society Maintenance <no-reply@society.com>",
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send email:", err.message);
    return { sent: false, error: err.message };
  }
}

function statusChangeEmail({ resident, complaint, status, note }) {
  return sendEmail({
    to: resident.email,
    subject: `Complaint #${complaint.id} status updated: ${status}`,
    html: `
      <p>Hi ${resident.name},</p>
      <p>Your complaint <strong>#${complaint.id} (${complaint.category})</strong> status has changed to
      <strong>${status}</strong>.</p>
      ${note ? `<p>Note from admin: ${note}</p>` : ""}
      <p>You can view the full history in the Society Maintenance Tracker app.</p>
    `,
  });
}

function noticeEmail({ resident, notice }) {
  return sendEmail({
    to: resident.email,
    subject: `[Important Notice] ${notice.title}`,
    html: `
      <p>Hi ${resident.name},</p>
      <p>A new important notice has been posted:</p>
      <h3>${notice.title}</h3>
      <p>${notice.body}</p>
    `,
  });
}

module.exports = { sendEmail, statusChangeEmail, noticeEmail };
