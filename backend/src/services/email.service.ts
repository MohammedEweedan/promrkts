// Email Service using Resend
// Clean, light-mode email templates with promrkts branding
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Brand colors and assets
const BRAND = {
  primaryColor: '#65a8bf',
  secondaryColor: '#b7a27d',
  logoUrl: 'https://promrkts.com/logo.png',
  websiteUrl: 'https://promrkts.com',
  brokerUrl: 'https://promrkts.com/broker',
};

// Legal disclaimer used across emails
const LEGAL_DISCLAIMER = `
  <p style="color: #999999; font-size: 11px; line-height: 1.5; margin: 0; font-style: italic;">
    promrkts provides educational content only and does not constitute financial advice, investment advice, or trading advice. 
    All trading involves risk and you should only trade with money you can afford to lose. Past performance is not indicative of future results. 
    Any brokerage services referenced are provided by our independent broker partner — all deposits, withdrawals, and fund management are handled exclusively by the broker, not by promrkts.
  </p>
`;

// Clean, light-mode email wrapper
const createEmailTemplate = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>promrkts</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #1a1a1a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 24px 0 32px;">
              <a href="${BRAND.websiteUrl}" style="text-decoration: none;">
                <img src="${BRAND.logoUrl}" alt="promrkts" width="140" style="display: block; max-width: 140px; height: auto;" />
              </a>
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                <!-- Accent bar -->
                <tr>
                  <td style="height: 3px; background: linear-gradient(90deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%);"></td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 36px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 28px 20px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none; font-size: 13px; margin: 0 10px;">Website</a>
                    <span style="color: #d1d5db;">&middot;</span>
                    <a href="https://t.me/promrkts" style="color: ${BRAND.primaryColor}; text-decoration: none; font-size: 13px; margin: 0 10px;">Telegram</a>
                    <span style="color: #d1d5db;">&middot;</span>
                    <a href="https://discord.gg/promrkts" style="color: ${BRAND.primaryColor}; text-decoration: none; font-size: 13px; margin: 0 10px;">Discord</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                      &copy; ${new Date().getFullYear()} promrkts. All rights reserved.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0 20px;">
                    ${LEGAL_DISCLAIMER}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Email aliases for different purposes
export const EMAIL_ALIASES = {
  support: 'support@promrkts.com',
  hello: 'hello@promrkts.com',
  moe: 'moe@promrkts.com',
  admin: 'admin@promrkts.com',
  invoice: 'invoice@promrkts.com',
  noreply: 'noreply@promrkts.com',
} as const;

export type EmailAlias = keyof typeof EMAIL_ALIASES;

// Base email options
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: EmailAlias;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Send email using Resend
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const fromAlias = options.from || 'hello';
    const fromEmail = EMAIL_ALIASES[fromAlias];
    const fromName = fromAlias === 'invoice' ? 'promrkts Billing'
      : fromAlias === 'support' ? 'promrkts Support'
      : fromAlias === 'admin' ? 'promrkts Admin'
      : fromAlias === 'moe' ? 'Moe Ali'
      : 'promrkts';

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
    });

    if (error) {
      console.error('[Email Service] Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Email Service] Email sent successfully: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error('[Email Service] Exception sending email:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// Email Templates
// ============================================

// Welcome email — ONLY call this after email verification is confirmed
// This is a personal letter from the CEO
export async function sendWelcomeEmail(user: { email: string; name: string }): Promise<{ success: boolean; error?: string }> {
  return sendWelcomeEmailAfterVerification(user);
}

export async function sendWelcomeEmailAfterVerification(user: { email: string; name: string }): Promise<{ success: boolean; error?: string }> {
  const content = `
    <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
      Hi ${user.name},
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      I'm Moe Ali, the founder of promrkts — and I wanted to personally welcome you.
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Your account is verified and ready to go. I built promrkts because I believe every trader deserves access to clear, honest education — no fluff, no hype, just the real strategies and frameworks that actually work in the markets.
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
      Here's what you now have access to:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px; background-color: #f9fafb; border-radius: 10px; border-left: 3px solid ${BRAND.primaryColor}; margin-bottom: 10px;">
          <p style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Trading Guides</p>
          <p style="color: #6b7280; font-size: 13px; margin: 0;">Step-by-step guides covering everything from the basics to advanced strategies and setups.</p>
        </td>
      </tr>
      <tr><td style="height: 10px;"></td></tr>
      <tr>
        <td style="padding: 16px; background-color: #f9fafb; border-radius: 10px; border-left: 3px solid ${BRAND.secondaryColor};">
          <p style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Trading Communities</p>
          <p style="color: #6b7280; font-size: 13px; margin: 0;">Join our private Telegram and Discord groups to learn alongside other serious traders.</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td align="center">
          <a href="${BRAND.websiteUrl}/products" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 15px;">
            Explore Our Guides &amp; Communities
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      If you ever have questions, just reply to this email — it comes straight to me.
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 4px;">
      Welcome aboard,
    </p>
    <p style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin: 0 0 2px;">
      Moe Ali
    </p>
    <p style="color: #6b7280; font-size: 13px; margin: 0;">
      Founder &amp; CEO, promrkts
    </p>
  `;

  const html = createEmailTemplate(content, `Welcome to promrkts, ${user.name} — your trading journey starts now.`);

  return sendEmail({
    to: user.email,
    subject: `Welcome to promrkts, ${user.name}`,
    html,
    from: 'moe',
    replyTo: EMAIL_ALIASES.moe,
  });
}

// Upsell email after free course enrollment
export async function sendUpsellEmail(user: { email: string; name: string }, courseName: string): Promise<{ success: boolean; error?: string }> {
  const content = `
    <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
      Hi ${user.name},
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Great move enrolling in <strong>"${courseName}"</strong> — you're already ahead of most traders just by investing in your education.
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
      When you're ready to go deeper, here's what our premium offerings include:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px; background-color: #f9fafb; border-radius: 10px; border-left: 3px solid ${BRAND.primaryColor};">
          <p style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Premium Guides</p>
          <p style="color: #6b7280; font-size: 13px; margin: 0;">Advanced strategies, real trade breakdowns, and structured learning paths built for serious traders.</p>
        </td>
      </tr>
      <tr><td style="height: 10px;"></td></tr>
      <tr>
        <td style="padding: 16px; background-color: #f9fafb; border-radius: 10px; border-left: 3px solid ${BRAND.secondaryColor};">
          <p style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Private Communities</p>
          <p style="color: #6b7280; font-size: 13px; margin: 0;">Live signals, weekly Q&amp;A sessions, and direct access to mentors on Telegram &amp; Discord.</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td align="center">
          <a href="${BRAND.websiteUrl}/products" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 15px;">
            Browse Premium Plans
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Questions? Just reply to this email — we're happy to help.
    </p>
  `;

  const html = createEmailTemplate(content, `${user.name}, ready to take your trading to the next level?`);

  return sendEmail({
    to: user.email,
    subject: `${user.name}, ready to level up your trading?`,
    html,
    from: 'hello',
    replyTo: EMAIL_ALIASES.support,
  });
}

// Invoice email after purchase
export interface InvoiceData {
  invoiceNumber: string;
  purchaseDate: Date;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  transactionId?: string;
}

export async function sendInvoiceEmail(
  user: { email: string; name: string },
  invoice: InvoiceData
): Promise<{ success: boolean; error?: string }> {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemsHtml = invoice.items.map(item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
        <p style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0 0 2px;">${item.name}</p>
        ${item.description ? `<p style="color: #6b7280; font-size: 12px; margin: 0;">${item.description}</p>` : ''}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #6b7280; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #6b7280; font-size: 14px;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #1a1a1a; font-size: 14px; font-weight: 600;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const content = `
    <!-- Invoice Header -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td>
          <p style="color: ${BRAND.primaryColor}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 6px;">Invoice</p>
          <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700; margin: 0;">#${invoice.invoiceNumber}</h1>
        </td>
        <td style="text-align: right;">
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 6px;">${formatDate(invoice.purchaseDate)}</p>
          <span style="display: inline-block; background-color: #ecfdf5; color: #059669; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px;">Paid</span>
        </td>
      </tr>
    </table>

    <!-- Bill To -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td style="padding: 16px; background-color: #f9fafb; border-radius: 10px;">
          <p style="color: #9ca3af; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">Billed To</p>
          <p style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin: 0 0 2px;">${user.name}</p>
          <p style="color: #6b7280; font-size: 13px; margin: 0;">${user.email}</p>
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border: 1px solid #f3f4f6; border-radius: 10px; overflow: hidden;">
      <thead>
        <tr style="background-color: #f9fafb;">
          <th style="padding: 10px 16px; text-align: left; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Item</th>
          <th style="padding: 10px 16px; text-align: center; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Qty</th>
          <th style="padding: 10px 16px; text-align: right; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Price</th>
          <th style="padding: 10px 16px; text-align: right; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td width="50%"></td>
        <td width="50%">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
              <td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${formatCurrency(invoice.subtotal)}</td>
            </tr>
            ${invoice.discount ? `
            <tr>
              <td style="padding: 6px 0; color: #059669; font-size: 14px;">Discount</td>
              <td style="padding: 6px 0; color: #059669; font-size: 14px; text-align: right;">-${formatCurrency(invoice.discount)}</td>
            </tr>` : ''}
            ${invoice.tax ? `
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Tax</td>
              <td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${formatCurrency(invoice.tax)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 12px 0 0; border-top: 2px solid #e5e7eb; color: #1a1a1a; font-size: 16px; font-weight: 700;">Total</td>
              <td style="padding: 12px 0 0; border-top: 2px solid #e5e7eb; text-align: right; color: ${BRAND.primaryColor}; font-size: 20px; font-weight: 700;">${formatCurrency(invoice.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Payment Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td style="padding: 14px 16px; background-color: #ecfdf5; border-radius: 10px;">
          <p style="color: #059669; font-size: 13px; font-weight: 600; margin: 0 0 2px;">Payment Successful</p>
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            ${invoice.paymentMethod}${invoice.transactionId ? ` &middot; ${invoice.transactionId}` : ''}
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${BRAND.websiteUrl}/purchases" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); color: #ffffff; text-decoration: none; padding: 12px 36px; border-radius: 10px; font-weight: 600; font-size: 14px;">
            View Your Purchases
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 24px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      Questions about this invoice? Contact <a href="mailto:support@promrkts.com" style="color: ${BRAND.primaryColor}; text-decoration: none;">support@promrkts.com</a>
    </p>
  `;

  const html = createEmailTemplate(content, `Invoice #${invoice.invoiceNumber} — Thank you for your purchase!`);

  return sendEmail({
    to: user.email,
    subject: `Invoice #${invoice.invoiceNumber} — promrkts`,
    html,
    from: 'invoice',
    replyTo: EMAIL_ALIASES.support,
  });
}

// Password reset email
export async function sendPasswordResetEmail(
  user: { email: string; name: string },
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${BRAND.websiteUrl}/reset-password?token=${resetToken}`;

  const content = `
    <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
      Hi ${user.name},
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      We received a request to reset your password. Click the button below to create a new one:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 15px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>

    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 20px 0 0; padding-top: 16px; border-top: 1px solid #e5e7eb;">
      If the button doesn't work, copy and paste this link:<br>
      <a href="${resetUrl}" style="color: ${BRAND.primaryColor}; word-break: break-all; font-size: 12px;">${resetUrl}</a>
    </p>
  `;

  const html = createEmailTemplate(content, 'Reset your promrkts password');

  return sendEmail({
    to: user.email,
    subject: 'Reset Your promrkts Password',
    html,
    from: 'support',
  });
}

// Verification code email — single copyable code block
export async function sendConfirmationCodeEmail(
  user: { email: string; name: string },
  code: string
): Promise<{ success: boolean; error?: string }> {
  const content = `
    <div style="text-align: center;">
      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700; margin: 0 0 8px;">
        Verify Your Email
      </h1>
      <p style="color: #6b7280; font-size: 15px; margin: 0 0 28px;">
        Hi <strong style="color: #1a1a1a;">${user.name}</strong>, use this code to verify your account:
      </p>

      <!-- Single copyable code block -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
        <tr>
          <td style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 18px 40px; text-align: center;">
            <span style="font-size: 36px; font-weight: 700; color: #1a1a1a; font-family: 'SF Mono', 'Courier New', monospace; letter-spacing: 8px;">${code}</span>
          </td>
        </tr>
      </table>

      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 24px;">
        This code expires in 15 minutes.
      </p>

      <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `;

  const html = createEmailTemplate(content, `${code} is your promrkts verification code`);

  return sendEmail({
    to: user.email,
    subject: `${code} — promrkts verification code`,
    html,
    from: 'noreply',
  });
}

// Purchase confirmation email — sent immediately after successful payment
export async function sendPurchaseConfirmationEmail(
  user: { email: string; name: string },
  purchase: {
    productName: string;
    productDescription?: string;
    amount: number;
    invoiceNumber: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const content = `
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 56px; height: 56px; background-color: #ecfdf5; border-radius: 50%; line-height: 56px; font-size: 28px; margin-bottom: 16px;">&#10003;</div>
      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700; margin: 0 0 6px;">
        Purchase Confirmed
      </h1>
      <p style="color: #6b7280; font-size: 15px; margin: 0;">
        Thank you for your purchase, <strong style="color: #1a1a1a;">${user.name}</strong>
      </p>
    </div>

    <!-- Purchase Details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td style="padding: 20px; background-color: #f9fafb; border-radius: 10px; border: 1px solid #f3f4f6;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="color: #9ca3af; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">You purchased</p>
                <p style="color: #1a1a1a; font-size: 18px; font-weight: 700; margin: 0 0 4px;">${purchase.productName}</p>
                ${purchase.productDescription ? `<p style="color: #6b7280; font-size: 13px; margin: 0;">${purchase.productDescription}</p>` : ''}
              </td>
              <td style="text-align: right; vertical-align: top;">
                <p style="color: ${BRAND.primaryColor}; font-size: 20px; font-weight: 700; margin: 0;">${formatCurrency(purchase.amount)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- What's Next -->
    <p style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin: 0 0 12px;">What's next?</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 8px;">
          <p style="color: #1a1a1a; font-size: 14px; margin: 0;"><strong>1.</strong> Head to your dashboard and start learning right away.</p>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 8px;">
          <p style="color: #1a1a1a; font-size: 14px; margin: 0;"><strong>2.</strong> Join our Telegram &amp; Discord communities to connect with other traders.</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <a href="${BRAND.websiteUrl}/learn" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 15px;">
            Start Learning
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      Invoice #${purchase.invoiceNumber} &middot; A detailed invoice has been sent separately.
    </p>
  `;

  const html = createEmailTemplate(content, `Your purchase of ${purchase.productName} is confirmed!`);

  return sendEmail({
    to: user.email,
    subject: `Purchase Confirmed: ${purchase.productName}`,
    html,
    from: 'hello',
    replyTo: EMAIL_ALIASES.support,
  });
}

// Post-purchase congratulations email — sent after invoice, includes IB broker link
export async function sendPostPurchaseCongratulationsEmail(
  user: { email: string; name: string },
  productName: string
): Promise<{ success: boolean; error?: string }> {
  const content = `
    <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
      Hi ${user.name},
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Congratulations on investing in your trading journey with <strong>"${productName}"</strong>. This is one of the best decisions you can make — and I'm genuinely excited for you.
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Take your time going through the material. Learn the strategies, understand the reasoning behind each setup, and practice on a demo account until you feel confident.
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
      When you're ready to start applying what you've learned with real capital, you can open a live trading account with our preferred broker partner below. They offer tight spreads, fast execution, and reliable withdrawals:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td align="center">
          <a href="${BRAND.brokerUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 15px;">
            Open a Live Trading Account
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Remember — there's no rush. The markets will always be there. Focus on learning first, and the results will follow.
    </p>
    <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 4px;">
      Rooting for you,
    </p>
    <p style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin: 0 0 2px;">
      Moe Ali
    </p>
    <p style="color: #6b7280; font-size: 13px; margin: 0 0 24px;">
      Founder &amp; CEO, promrkts
    </p>

    <!-- Disclaimer -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 16px; background-color: #f9fafb; border-radius: 10px; border: 1px solid #f3f4f6;">
          <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 0; font-style: italic;">
            <strong style="color: #6b7280;">Important:</strong> promrkts is an educational platform. We do not provide financial advice, manage funds, or execute trades on your behalf. 
            All brokerage services, including deposits, withdrawals, and fund management, are provided exclusively by our independent broker partner. 
            Trading involves substantial risk of loss and is not suitable for every investor. Only trade with capital you can afford to lose. Past performance does not guarantee future results.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = createEmailTemplate(content, `Congratulations on your investment in "${productName}" — here's what's next.`);

  return sendEmail({
    to: user.email,
    subject: `Congratulations, ${user.name} — your trading journey just levelled up`,
    html,
    from: 'moe',
    replyTo: EMAIL_ALIASES.moe,
  });
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendWelcomeEmailAfterVerification,
  sendUpsellEmail,
  sendInvoiceEmail,
  sendPasswordResetEmail,
  sendConfirmationCodeEmail,
  sendPurchaseConfirmationEmail,
  sendPostPurchaseCongratulationsEmail,
  EMAIL_ALIASES,
};
