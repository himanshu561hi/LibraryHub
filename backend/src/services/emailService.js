import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { EmailCampaign, EmailRecipientLog } from '../models/index.js';

/**
 * Transporter setup
 * In test or dev mode without valid SMTP credentials, a mock transporter is used.
 */
let transporter = null;

if (!config.email.mockMode && config.email.host && config.email.user && config.email.pass) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure || config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
} else {
  // Safe mock transporter for local development and testing
  transporter = {
    sendMail: async (mailOptions) => {
      logger.info(`[MOCK EMAIL SENT] To: ${mailOptions.to} | Subject: "${mailOptions.subject}"`);
      return { messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}` };
    },
  };
}

/**
 * Replace template variables safely
 */
export function renderTemplate(templateString, variables = {}) {
  let rendered = templateString;
  Object.entries(variables).forEach(([key, val]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, val !== undefined && val !== null ? String(val) : '');
  });
  return rendered;
}

/**
 * Send a single transactional email.
 * Ensures that email failure NEVER breaks the calling database transaction.
 */
export async function sendTransactionalEmail({ to, subject, html, text }) {
  try {
    const from = config.email.from || '"Library Hub Nawalpur" <noreply@libraryhub.in>';
    const mailOptions = {
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Transactional email sent to ${to}: ${subject} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Failed to send transactional email to ${to}: ${err.message}`, { error: err });
    // Soft failure: do not throw to prevent crashing caller operations
    return { success: false, error: err.message };
  }
}

/**
 * Send Attendance IN confirmation email
 */
export async function sendAttendanceInEmail({ user, timeStr, dateStr }) {
  const subject = `Library Hub Nawalpur - Check IN Confirmed (${dateStr})`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-top: 0;">Welcome to Library Hub, ${user.name}!</h2>
      <p style="color: #334155; font-size: 15px;">Your study session check-in has been successfully recorded.</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${dateStr}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Check-In Time:</strong> ${timeStr} (IST)</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> Checked IN (Active Session)</p>
      </div>
      <p style="color: #64748b; font-size: 13px;">Please remember to mark your check-out when leaving. Keep your phone on silent mode inside the study hall.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">Library Hub Nawalpur, Opp. Degree College, Salempur-Deoria Road, Nawalpur, UP</p>
    </div>
  `;
  return sendTransactionalEmail({ to: user.email, subject, html });
}

/**
 * Send Attendance OUT confirmation email
 */
export async function sendAttendanceOutEmail({ user, timeStr, dateStr, durationMinutes }) {
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationFormatted = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

  const subject = `Library Hub Nawalpur - Check OUT Recorded (${dateStr})`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-top: 0;">Session Completed, ${user.name}!</h2>
      <p style="color: #334155; font-size: 15px;">Your check-out has been recorded. Great job dedicating time to your studies today!</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${dateStr}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Check-Out Time:</strong> ${timeStr} (IST)</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Study Duration:</strong> ${durationFormatted}</p>
      </div>
      <p style="color: #64748b; font-size: 13px;">We look forward to seeing you again for your next productive study session.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">Library Hub Nawalpur</p>
    </div>
  `;
  return sendTransactionalEmail({ to: user.email, subject, html });
}

/**
 * Send Payment confirmation receipt email
 */
export async function sendPaymentReceiptEmail({ user, payment, invoice }) {
  const amountRupees = (payment.amountPaise / 100).toFixed(2);
  const remainingRupees = (invoice.balancePaise / 100).toFixed(2);
  const subject = `Library Hub Nawalpur - Payment Receipt #${payment.receiptNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-top: 0;">Payment Receipt</h2>
      <p style="color: #334155; font-size: 15px;">Dear ${user.name}, we have received your payment of <strong>₹${amountRupees}</strong>.</p>
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; margin: 20px 0; border-radius: 6px;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #64748b;">Receipt Number:</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${payment.receiptNumber}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Payment Method:</td><td style="padding: 6px 0; text-align: right; text-transform: uppercase;">${payment.paymentMethod}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Amount Paid:</td><td style="padding: 6px 0; text-align: right; color: #16a34a; font-weight: bold;">₹${amountRupees}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Remaining Invoice Balance:</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">₹${remainingRupees}</td></tr>
        </table>
      </div>
      <p style="color: #64748b; font-size: 13px;">Thank you for keeping your membership dues up to date.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">Library Hub Nawalpur</p>
    </div>
  `;
  return sendTransactionalEmail({ to: user.email, subject, html });
}

export default {
  renderTemplate,
  sendTransactionalEmail,
  sendAttendanceInEmail,
  sendAttendanceOutEmail,
  sendPaymentReceiptEmail,
};

