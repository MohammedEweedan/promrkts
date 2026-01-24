// backend/src/utils/mailer.ts
import nodemailer from 'nodemailer';
import logger from '../utils/logger';

let mailer: nodemailer.Transporter;

async function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  }

  // No SMTP configured: create an Ethereal test account for local dev
  logger.info('No SMTP config detected — creating Ethereal test account for dev email preview');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAccount.user, pass: testAccount.pass } });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
  fromEmail?: string;
  attachments?: Array<any>;
}) {
  if (!mailer) {
    mailer = await createTransport();
  }

  const from = opts.fromName && opts.fromEmail
    ? `"${opts.fromName}" <${opts.fromEmail}>`
    : process.env.MAIL_FROM || `Support <no-reply@yourdomain.com>`;

  const info = await mailer.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html, attachments: opts.attachments });
  // If Ethereal preview URL is available, log it for dev
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) logger.info(`Email preview URL: ${preview}`);
  return info;
}
