const nodemailer = require('nodemailer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const FROM_EMAIL = process.env.EMAIL_FROM || '"FitPulse Team" <no-reply@fitpulse.internal>';

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Dispatches email via Nodemailer if SMTP configured, otherwise safely simulates in dev
 */
async function sendEmail({ to, subject, html, text }) {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        text,
        html,
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EmailService] SMTP delivery failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Development simulation mode: safe, non-blocking, logs token link for testing
  console.log('----------------------------------------------------');
  console.log(`[EmailService] Simulated Email to: ${to}`);
  console.log(`[EmailService] Subject: ${subject}`);
  if (text) console.log(`[EmailService] Text: ${text.slice(0, 160)}...`);
  console.log('----------------------------------------------------');
  return { success: true, simulated: true };
}

/**
 * Sends account verification email
 */
async function sendVerificationEmail(user, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
  const subject = 'Verify your FitPulse account ✉️';
  const text = `Hi ${user.name},\n\nPlease verify your email address by visiting: ${verifyUrl}\n\nThis link will expire in 24 hours.\n\nBest,\nThe FitPulse Team`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
      <h2 style="color: #f97316; margin-bottom: 8px;">Welcome to FitPulse! 👋</h2>
      <p style="color: #94a3b8; font-size: 14px;">Hi ${user.name}, please verify your email address to secure your account and enable email notifications.</p>
      <div style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background: #f97316; color: #020617; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px;">Or copy and paste this link in your browser:<br/><a href="${verifyUrl}" style="color: #38bdf8;">${verifyUrl}</a></p>
      <p style="color: #64748b; font-size: 11px; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 12px;">This link will expire in 24 hours. If you did not create this account, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject, html, text });
}

/**
 * Sends single-use password reset link
 */
async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  const subject = 'Reset your FitPulse password 🔑';
  const text = `Hi ${user.name},\n\nYou requested a password reset. Reset your password by visiting: ${resetUrl}\n\nThis link will expire in 1 hour. If you did not request this, you can safely ignore this email.\n\nBest,\nThe FitPulse Team`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
      <h2 style="color: #f97316; margin-bottom: 8px;">Password Reset Request</h2>
      <p style="color: #94a3b8; font-size: 14px;">Hi ${user.name}, we received a request to reset your FitPulse password. Click the button below to set a new password:</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #f97316; color: #020617; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px;">Or paste this link into your browser:<br/><a href="${resetUrl}" style="color: #38bdf8;">${resetUrl}</a></p>
      <p style="color: #64748b; font-size: 11px; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 12px;">This single-use link will expire in 1 hour. If you did not request a password reset, no further action is required.</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject, html, text });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
