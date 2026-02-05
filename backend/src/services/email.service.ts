// Email Service using Resend
// Supports multiple email aliases for different purposes
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
      : fromAlias === 'moe' ? 'Moe from promrkts'
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
// Pre-built email templates
// ============================================

// Welcome email after successful signup
export async function sendWelcomeEmail(user: { email: string; name: string }): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to promrkts</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #65a8bf 0%, #4a8fa6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to promrkts! 🎉</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi <strong>${user.name}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Welcome to the promrkts community! We're thrilled to have you join us on your trading journey.
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Here's what you can do next:
              </p>
              <ul style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 30px; padding-left: 20px;">
                <li>📚 Explore our <strong>free courses</strong> to get started</li>
                <li>🎯 Take on a <strong>prop firm challenge</strong> to prove your skills</li>
                <li>💬 Join our <strong>community</strong> on Telegram & Discord</li>
                <li>🏆 Earn <strong>badges</strong> and climb the leaderboard</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://promrkts.com" style="display: inline-block; background: linear-gradient(135deg, #65a8bf 0%, #4a8fa6 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eee;">
                If you have any questions, just reply to this email or reach out to our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} promrkts. All rights reserved.
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0;">
                <a href="https://promrkts.com" style="color: #65a8bf; text-decoration: none;">Website</a> • 
                <a href="https://t.me/promrkts" style="color: #65a8bf; text-decoration: none;">Telegram</a> • 
                <a href="https://discord.gg/promrkts" style="color: #65a8bf; text-decoration: none;">Discord</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Welcome to promrkts, ${user.name}! 🎉`,
    html,
    from: 'hello',
    replyTo: EMAIL_ALIASES.support,
  });
}

// Upsell email after free course purchase
export async function sendUpsellEmail(user: { email: string; name: string }, courseName: string): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ready for the Next Level?</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #65a8bf 0%, #4a8fa6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Ready for the Next Level? 🚀</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi <strong>${user.name}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Congratulations on enrolling in <strong>"${courseName}"</strong>! 🎉
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Now that you've taken the first step, here's how you can accelerate your trading journey:
              </p>
              
              <!-- Upgrade Card -->
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                <h2 style="color: #65a8bf; margin: 0 0 15px; font-size: 22px;">🏆 Pro Trading Guide</h2>
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Get access to advanced strategies, live signals, and exclusive community features.
                </p>
                <ul style="color: #ffffff; font-size: 14px; line-height: 1.8; text-align: left; margin: 0 0 25px; padding-left: 20px;">
                  <li>✅ Advanced trading strategies & setups</li>
                  <li>✅ Live trading signals on Telegram</li>
                  <li>✅ Private Discord community access</li>
                  <li>✅ Weekly live Q&A sessions</li>
                  <li>✅ Prop firm challenge preparation</li>
                </ul>
                <a href="https://promrkts.com/products" style="display: inline-block; background: #65a8bf; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Explore Pro Guides →
                </a>
              </div>
              
              <!-- Special Offer -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  <strong>🎁 Special Offer:</strong> Use code <strong>UPGRADE20</strong> for 20% off your first paid course!
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eee;">
                Questions? Reply to this email or reach out to our support team anytime.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} promrkts. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: user.email,
    subject: `${user.name}, ready to level up your trading? 🚀`,
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
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong>
        ${item.description ? `<br><span style="color: #666; font-size: 13px;">${item.description}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${invoice.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="color: #65a8bf; margin: 0; font-size: 24px;">promrkts</h1>
                    <p style="color: #ffffff; margin: 5px 0 0; font-size: 14px;">Invoice</p>
                  </td>
                  <td style="text-align: right;">
                    <p style="color: #ffffff; margin: 0; font-size: 14px;">
                      <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
                      <strong>Date:</strong> ${formatDate(invoice.purchaseDate)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Bill To -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <h3 style="color: #333; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Bill To:</h3>
              <p style="color: #333; font-size: 16px; margin: 0;">
                <strong>${user.name}</strong><br>
                ${user.email}
              </p>
            </td>
          </tr>
          
          <!-- Items Table -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase;">Item</th>
                    <th style="padding: 12px; text-align: center; font-size: 13px; color: #666; text-transform: uppercase;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-size: 13px; color: #666; text-transform: uppercase;">Price</th>
                    <th style="padding: 12px; text-align: right; font-size: 13px; color: #666; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 14px;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; font-size: 14px;">${formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  ${invoice.discount ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 14px; color: #28a745;">Discount:</td>
                    <td style="padding: 12px; text-align: right; font-size: 14px; color: #28a745;">-${formatCurrency(invoice.discount)}</td>
                  </tr>
                  ` : ''}
                  ${invoice.tax ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 14px;">Tax:</td>
                    <td style="padding: 12px; text-align: right; font-size: 14px;">${formatCurrency(invoice.tax)}</td>
                  </tr>
                  ` : ''}
                  <tr style="background-color: #f8f9fa;">
                    <td colspan="3" style="padding: 15px 12px; text-align: right; font-size: 18px; font-weight: bold;">Total:</td>
                    <td style="padding: 15px 12px; text-align: right; font-size: 18px; font-weight: bold; color: #65a8bf;">${formatCurrency(invoice.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>
          
          <!-- Payment Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #d4edda; border-radius: 8px; padding: 15px 20px;">
                <p style="color: #155724; font-size: 14px; margin: 0;">
                  <strong>✅ Payment Received</strong><br>
                  Method: ${invoice.paymentMethod}
                  ${invoice.transactionId ? `<br>Transaction ID: ${invoice.transactionId}` : ''}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="color: #666; font-size: 13px; margin: 0 0 10px;">
                Thank you for your purchase! If you have any questions about this invoice,<br>
                please contact us at <a href="mailto:support@promrkts.com" style="color: #65a8bf;">support@promrkts.com</a>
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} promrkts. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Invoice #${invoice.invoiceNumber} - promrkts`,
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
  const resetUrl = `https://promrkts.com/reset-password?token=${resetToken}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #65a8bf 0%, #4a8fa6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi <strong>${user.name}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #65a8bf 0%, #4a8fa6 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
              
              <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eee;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #65a8bf; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} promrkts. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Reset Your promrkts Password',
    html,
    from: 'support',
  });
}

// Email confirmation code
export async function sendConfirmationCodeEmail(
  user: { email: string; name: string },
  code: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #65a8bf 0%, #4a8fa6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Confirm Your Email</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Hi <strong>${user.name}</strong>, use this code to verify your email address:
              </p>
              
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 30px; margin: 20px 0;">
                <p style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #65a8bf; margin: 0;">
                  ${code}
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                This code expires in 15 minutes. If you didn't create an account, you can ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} promrkts. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: user.email,
    subject: `${code} is your promrkts verification code`,
    html,
    from: 'noreply',
  });
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendUpsellEmail,
  sendInvoiceEmail,
  sendPasswordResetEmail,
  sendConfirmationCodeEmail,
  EMAIL_ALIASES,
};
