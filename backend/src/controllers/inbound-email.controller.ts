import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// Gmail SMTP transporter for forwarding inbound emails
const GMAIL_USER = 'moeawidan99@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_APP_PASSWORD) {
  logger.warn('[Inbound Email] GMAIL_APP_PASSWORD is not set — inbound forwarding will fail.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

/**
 * Resend inbound webhook handler.
 * Receives all incoming emails to *@promrkts.com and forwards them to Gmail.
 *
 * Resend webhook payload shape (email.received):
 * {
 *   type: "email.received",
 *   data: {
 *     from: "sender@example.com",
 *     to: ["hello@promrkts.com"],
 *     subject: "...",
 *     text: "...",
 *     html: "...",
 *     headers: [...],
 *     attachments: [...]
 *   }
 * }
 */
export const handleInboundEmail = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // Resend wraps the email data in a `data` key for webhook events
    const email = payload?.data || payload;

    const from = email.from || 'unknown@promrkts.com';
    const to = Array.isArray(email.to) ? email.to.join(', ') : (email.to || 'unknown');
    const subject = email.subject || '(no subject)';
    const textBody = email.text || '';
    const htmlBody = email.html || '';

    logger.info(`[Inbound Email] Received: from=${from}, to=${to}, subject="${subject}"`);

    if (!GMAIL_APP_PASSWORD) {
      logger.error('[Inbound Email] Cannot forward — GMAIL_APP_PASSWORD not set');
      return res.sendStatus(200); // Still return 200 so Resend doesn't retry
    }

    // Build forwarded subject with original recipient for easy filtering
    const forwardedSubject = `[${to}] ${subject}`;

    // Forward attachments if present
    const attachments = (email.attachments || []).map((att: any) => ({
      filename: att.filename || att.name || 'attachment',
      content: att.content ? Buffer.from(att.content, 'base64') : undefined,
      contentType: att.content_type || att.contentType,
    })).filter((a: any) => a.content);

    await transporter.sendMail({
      from: `"promrkts Inbox" <${GMAIL_USER}>`,
      replyTo: from,
      to: GMAIL_USER,
      subject: forwardedSubject,
      text: `--- Forwarded from ${from} to ${to} ---\n\n${textBody}`,
      html: htmlBody
        ? `<div style="padding:8px 12px;margin-bottom:12px;background:#f0f4f8;border-radius:8px;font-size:13px;color:#555;">
            <strong>From:</strong> ${from}<br/>
            <strong>To:</strong> ${to}
           </div>${htmlBody}`
        : undefined,
      ...(attachments.length > 0 ? { attachments } : {}),
    });

    logger.info(`[Inbound Email] Forwarded to ${GMAIL_USER}: "${forwardedSubject}"`);
    return res.sendStatus(200);
  } catch (error: any) {
    logger.error('[Inbound Email] Forward failed:', error?.message || error);
    // Return 200 anyway to prevent Resend from retrying endlessly
    return res.sendStatus(200);
  }
};
