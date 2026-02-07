// Email Service using Resend
// Supports multiple email aliases for different purposes
// Premium email templates with gradient branding (#65a8bf to #b7a27d)
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Brand colors and assets
const BRAND = {
  primaryColor: '#65a8bf',
  secondaryColor: '#b7a27d',
  darkBg: '#0a0f1a',
  logoUrl: 'https://promrkts.com/logo.png',
  websiteUrl: 'https://promrkts.com',
};

// Premium email wrapper template
const createPremiumEmailTemplate = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>promrkts</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#0a0f1a;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0f1a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 32px 0;">
              <a href="${BRAND.websiteUrl}" style="text-decoration: none;">
                <img src="${BRAND.logoUrl}" alt="promrkts" width="160" style="display: block; max-width: 160px; height: auto;" />
              </a>
            </td>
          </tr>
          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, #111827 0%, #0f172a 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(101, 168, 191, 0.15);">
                <!-- Gradient Top Border -->
                <tr>
                  <td style="height: 4px; background: linear-gradient(90deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%);"></td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 20px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none; font-size: 14px; margin: 0 12px;">Website</a>
                    <span style="color: #374151;">•</span>
                    <a href="https://t.me/promrkts" style="color: ${BRAND.primaryColor}; text-decoration: none; font-size: 14px; margin: 0 12px;">Telegram</a>
                    <span style="color: #374151;">•</span>
                    <a href="https://discord.gg/promrkts" style="color: ${BRAND.primaryColor}; text-decoration: none; font-size: 14px; margin: 0 12px;">Discord</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
                      © ${new Date().getFullYear()} promrkts. All rights reserved.<br>
                      <span style="color: #475569;">Premium Trading Education</span>
                    </p>
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

// Welcome email - now calls the premium version after verification
export async function sendWelcomeEmail(user: { email: string; name: string }): Promise<{ success: boolean; error?: string }> {
  return sendWelcomeEmailAfterVerification(user);
}

// Premium welcome email - sent AFTER email verification is confirmed
export async function sendWelcomeEmailAfterVerification(user: { email: string; name: string }): Promise<{ success: boolean; error?: string }> {
  const content = `
    <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px;">
      Welcome to promrkts
    </h1>
    <p style="color: ${BRAND.primaryColor}; font-size: 16px; margin: 0 0 32px; font-weight: 500;">
      Your trading journey starts now
    </p>
    
    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
      Hi <strong style="color: #ffffff;">${user.name}</strong>,
    </p>
    
    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">
      Welcome to the promrkts community! Your email has been verified and your account is now fully activated. We're excited to have you join thousands of traders on their path to mastery.
    </p>
    
    <!-- Feature Cards -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 20px; background: rgba(101, 168, 191, 0.08); border-radius: 16px; border: 1px solid rgba(101, 168, 191, 0.15);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="48" valign="top">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">📚</div>
              </td>
              <td style="padding-left: 16px;">
                <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 4px;">Expert-Led Courses</p>
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">Structured learning paths from fundamentals to advanced strategies</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height: 12px;"></td></tr>
      <tr>
        <td style="padding: 20px; background: rgba(183, 162, 125, 0.08); border-radius: 16px; border: 1px solid rgba(183, 162, 125, 0.15);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="48" valign="top">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${BRAND.secondaryColor} 0%, ${BRAND.primaryColor} 100%); border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">🏆</div>
              </td>
              <td style="padding-left: 16px;">
                <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 4px;">Prop Firm Challenges</p>
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">Prove your skills and get funded to trade real capital</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height: 12px;"></td></tr>
      <tr>
        <td style="padding: 20px; background: rgba(101, 168, 191, 0.08); border-radius: 16px; border: 1px solid rgba(101, 168, 191, 0.15);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="48" valign="top">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">💬</div>
              </td>
              <td style="padding-left: 16px;">
                <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 4px;">Premium Community</p>
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">Connect with traders worldwide on Telegram & Discord</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 8px 0 32px;">
          <a href="${BRAND.websiteUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); color: #0a0f1a; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px;">
            Start Learning Now
          </a>
        </td>
      </tr>
    </table>
    
    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08);">
      Questions? Simply reply to this email — we're here to help.
    </p>
  `;

  const html = createPremiumEmailTemplate(content, `Welcome ${user.name}! Your trading journey starts now.`);

  return sendEmail({
    to: user.email,
    subject: `Welcome to promrkts, ${user.name}!`,
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

// Premium invoice email with gradient branding
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
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06);">
        <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 4px;">${item.name}</p>
        ${item.description ? `<p style="color: #64748b; font-size: 13px; margin: 0;">${item.description}</p>` : ''}
      </td>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: center; color: #94a3b8; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: right; color: #94a3b8; font-size: 14px;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: right; color: #ffffff; font-size: 14px; font-weight: 600;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const content = `
    <!-- Invoice Header -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td>
          <p style="color: ${BRAND.primaryColor}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Invoice</p>
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">#${invoice.invoiceNumber}</h1>
        </td>
        <td style="text-align: right;">
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 4px;">${formatDate(invoice.purchaseDate)}</p>
          <div style="display: inline-block; background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 100px; padding: 6px 16px;">
            <span style="color: #22c55e; font-size: 13px; font-weight: 600;">✓ Paid</span>
          </div>
        </td>
      </tr>
    </table>
    
    <!-- Bill To -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 20px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
          <p style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Billed To</p>
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px;">${user.name}</p>
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">${user.email}</p>
        </td>
      </tr>
    </table>
    
    <!-- Items Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden;">
      <thead>
        <tr style="background: rgba(255,255,255,0.03);">
          <th style="padding: 14px 16px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Item</th>
          <th style="padding: 14px 16px; text-align: center; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Qty</th>
          <th style="padding: 14px 16px; text-align: right; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Price</th>
          <th style="padding: 14px 16px; text-align: right; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <!-- Totals -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td width="50%"></td>
        <td width="50%">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Subtotal</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">${formatCurrency(invoice.subtotal)}</td>
            </tr>
            ${invoice.discount ? `
            <tr>
              <td style="padding: 8px 0; color: #22c55e; font-size: 14px;">Discount</td>
              <td style="padding: 8px 0; color: #22c55e; font-size: 14px; text-align: right;">-${formatCurrency(invoice.discount)}</td>
            </tr>
            ` : ''}
            ${invoice.tax ? `
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Tax</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">${formatCurrency(invoice.tax)}</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="2" style="padding: 16px 0 0; border-top: 1px solid rgba(255,255,255,0.1);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color: #ffffff; font-size: 16px; font-weight: 700;">Total</td>
                    <td style="text-align: right;">
                      <span style="background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: 700;">${formatCurrency(invoice.total)}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Payment Details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 20px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%); border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.2);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" valign="top">
                <div style="width: 36px; height: 36px; background: rgba(34, 197, 94, 0.15); border-radius: 10px; text-align: center; line-height: 36px; font-size: 18px;">✓</div>
              </td>
              <td style="padding-left: 12px;">
                <p style="color: #22c55e; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Payment Successful</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                  ${invoice.paymentMethod}${invoice.transactionId ? ` • ${invoice.transactionId}` : ''}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${BRAND.websiteUrl}/purchases" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); color: #0a0f1a; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-weight: 700; font-size: 15px;">
            View Your Purchases
          </a>
        </td>
      </tr>
    </table>
    
    <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 32px 0 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
      Questions about this invoice? Contact us at <a href="mailto:support@promrkts.com" style="color: ${BRAND.primaryColor}; text-decoration: none;">support@promrkts.com</a>
    </p>
  `;

  const html = createPremiumEmailTemplate(content, `Invoice #${invoice.invoiceNumber} - Thank you for your purchase!`);

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

// Premium verification code email
export async function sendConfirmationCodeEmail(
  user: { email: string; name: string },
  code: string
): Promise<{ success: boolean; error?: string }> {
  const codeDigits = code.split('');
  const digitBoxes = codeDigits.map(digit => `
    <td style="width: 48px; height: 60px; background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; text-align: center; vertical-align: middle; border: 2px solid rgba(101, 168, 191, 0.3);">
      <span style="font-size: 28px; font-weight: 700; color: #ffffff; font-family: 'SF Mono', Monaco, monospace;">${digit}</span>
    </td>
  `).join('<td style="width: 8px;"></td>');

  const content = `
    <div style="text-align: center;">
      <!-- Icon -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
        <tr>
          <td style="width: 72px; height: 72px; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); border-radius: 20px; text-align: center; vertical-align: middle; font-size: 32px;">🔐</td>
        </tr>
      </table>
      
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px;">
        Verify Your Email
      </h1>
      <p style="color: #94a3b8; font-size: 16px; margin: 0 0 32px;">
        Hi <strong style="color: #ffffff;">${user.name}</strong>, enter this code to continue
      </p>
      
      <!-- Code Display -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px;">
        <tr>
          ${digitBoxes}
        </tr>
      </table>
      
      <!-- Timer Badge -->
      <div style="display: inline-block; background: rgba(101, 168, 191, 0.1); border: 1px solid rgba(101, 168, 191, 0.2); border-radius: 100px; padding: 8px 20px; margin-bottom: 32px;">
        <span style="color: ${BRAND.primaryColor}; font-size: 13px; font-weight: 500;">⏱ Expires in 15 minutes</span>
      </div>
      
      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `;

  const html = createPremiumEmailTemplate(content, `${code} is your promrkts verification code`);

  return sendEmail({
    to: user.email,
    subject: `${code} is your promrkts verification code`,
    html,
    from: 'noreply',
  });
}

// Purchase confirmation email - sent immediately after successful payment
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
    <div style="text-align: center;">
      <!-- Success Icon -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
        <tr>
          <td style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%); border-radius: 50%; text-align: center; vertical-align: middle; font-size: 40px;">✓</td>
        </tr>
      </table>
      
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px;">
        Purchase Confirmed!
      </h1>
      <p style="color: #94a3b8; font-size: 16px; margin: 0 0 32px;">
        Thank you for your purchase, <strong style="color: #ffffff;">${user.name}</strong>
      </p>
    </div>
    
    <!-- Purchase Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 24px; background: linear-gradient(145deg, rgba(101, 168, 191, 0.1) 0%, rgba(183, 162, 125, 0.05) 100%); border-radius: 16px; border: 1px solid rgba(101, 168, 191, 0.2);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">You purchased</p>
                <p style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 8px;">${purchase.productName}</p>
                ${purchase.productDescription ? `<p style="color: #94a3b8; font-size: 14px; margin: 0;">${purchase.productDescription}</p>` : ''}
              </td>
              <td style="text-align: right; vertical-align: top;">
                <p style="background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: 700; margin: 0;">${formatCurrency(purchase.amount)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- What's Next -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td>
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px;">What's next?</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" valign="top">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); border-radius: 8px; text-align: center; line-height: 32px; color: #0a0f1a; font-weight: 700; font-size: 14px;">1</div>
              </td>
              <td style="padding-left: 12px;">
                <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 2px;">Access your content</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">Your purchase is ready in your dashboard</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" valign="top">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, ${BRAND.secondaryColor} 0%, ${BRAND.primaryColor} 100%); border-radius: 8px; text-align: center; line-height: 32px; color: #0a0f1a; font-weight: 700; font-size: 14px;">2</div>
              </td>
              <td style="padding-left: 12px;">
                <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 2px;">Join the community</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">Connect with fellow traders on Discord & Telegram</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 8px 0 24px;">
          <a href="${BRAND.websiteUrl}/learn" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%); color: #0a0f1a; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px;">
            Start Learning
          </a>
        </td>
      </tr>
    </table>
    
    <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
      Invoice #${purchase.invoiceNumber} • A detailed invoice has been sent separately
    </p>
  `;

  const html = createPremiumEmailTemplate(content, `Your purchase of ${purchase.productName} is confirmed!`);

  return sendEmail({
    to: user.email,
    subject: `Purchase Confirmed: ${purchase.productName}`,
    html,
    from: 'hello',
    replyTo: EMAIL_ALIASES.support,
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
  EMAIL_ALIASES,
};
