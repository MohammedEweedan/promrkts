// backend/src/utils/invoiceEmail.ts
import puppeteer from 'puppeteer';
import prisma from '../config/prisma';
import { sendMail } from './mailer';
import axios from 'axios';

export type ReceiptRequest = {
  purchaseId: string;
};

function fmt(n: number, currency: string = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export async function buildInvoiceHtml(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { tier: true, user: true },
  } as any);
  if (!purchase) throw new Error('Purchase not found');

  const currency = 'USD';
  const issuedAt = new Date(purchase.createdAt); // enrollment date
  const paidAt = new Date();

  const origin = (process.env.FRONTEND_URL || '').replace(/\/$/, '') || '';
  const company = {
    name: process.env.COMPANY_NAME || 'promrkts',
    address: process.env.COMPANY_ADDRESS || '',
    email: process.env.SUPPORT_EMAIL || 'support@promrkts.com',
    website: origin,
    // we only really care about text-logo for display now
    logoTextUrl: origin ? `${origin}/text-logo.png` : '/text-logo.png',
  };

  // USDT-only pricing logic
  let baseAmount = Number(purchase.finalPriceUsd ?? 0);
  let discount = Number(purchase.discountUsd || 0);
  const unitUsdt = Number((purchase as any).tier?.price_usdt ?? 0);
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    baseAmount = Number.isFinite(unitUsdt) ? unitUsdt : 0;
  }

  const tax = 0;
  const subtotal = baseAmount;
  const total = Math.max(0, subtotal - discount + tax);

  const itemsRows = `
      <tr>
        <td>
          <div class="item-name">${purchase.tier?.name || 'Product'}</div>
          ${purchase.tier?.description ? `<div class="item-desc">${purchase.tier.description}</div>` : ''}
        </td>
        <td class="right">${fmt(subtotal, currency)}</td>
        <td class="right">1</td>
        <td class="right">${fmt(subtotal, currency)}</td>
      </tr>
  `;

  const paymentMethodLabel = 'USDT (TRC20)';

  // ========= PDF HTML (dark, text-logo centered) =========
  const pdfHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice ${purchase.id}</title>
    <style>
      @page { size: A4; margin: 26mm; }
      :root {
        --brand: #68a5bf;
        --brand-soft: #93c4d8;
        --ink: #f5f7fb;
        --muted: #8ea5c2;
        --bg: #050608;
        --card-bg: #0b0f16;
        --border-subtle: rgba(255,255,255,0.08);
      }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        background: var(--bg);
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        color: var(--ink);
      }
      .container {
        max-width: 820px;
        margin: 0 auto;
        padding: 18px 20px 24px;
        background: radial-gradient(circle at top left, #141a24 0, #050608 50%, #020308 100%);
        border-radius: 18px;
        border: 1px solid rgba(104,165,191,0.4);
        box-shadow: 0 12px 40px rgba(0,0,0,0.8);
        position: relative;
        overflow: hidden;
      }
      .container::before, .container::after {
        content: "";
        position: absolute;
        border-radius: 999px;
        filter: blur(26px);
        opacity: 0.25;
        pointer-events: none;
      }
      .container::before {
        width: 180px;
        height: 180px;
        background: rgba(104,165,191,0.9);
        top: -60px;
        left: -60px;
      }
      .container::after {
        width: 200px;
        height: 200px;
        background: rgba(104,165,191,0.6);
        bottom: -80px;
        right: -80px;
      }

      .header {
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: 14px;
        margin-bottom: 10px;
        position: relative;
        z-index: 1;
      }

      .logo-row {
        text-align: center;
        margin-bottom: 10px;
      }

      /* text-logo, centered, 1280×315 aspect */
      .logo-text {
        max-width: 100%;
        width: 200px; /* scaled down for page width but keeps aspect */
        aspect-ratio: 1280 / 315;
        height: auto;
        object-fit: contain;
        filter: drop-shadow(0 0 8px rgba(104,165,191,0.7));
        display: inline-block;
      }

      .meta-row {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
      }
      .label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--muted);
      }
      .value {
        font-size: 13px;
        font-weight: 500;
      }

      .grid {
        display: grid;
        grid-template-columns: minmax(0,1.3fr) minmax(0,1fr);
        gap: 16px;
        margin-top: 18px;
        position: relative;
        z-index: 1;
      }
      .card {
        border-radius: 14px;
        padding: 12px 12px 10px;
        background: linear-gradient(135deg, rgba(12,18,27,0.9), rgba(6,9,15,0.95));
        border: 1px solid var(--border-subtle);
      }
      .card-title {
        font-weight: 700;
        margin-bottom: 6px;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--brand-soft);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 18px;
        position: relative;
        z-index: 1;
        border-radius: 12px;
        overflow: hidden;
      }
      thead { background: rgba(10,17,27,0.95); }
      th, td {
        text-align: left;
        padding: 10px 9px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        font-size: 12px;
      }
      th {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
      }
      tbody tr:nth-child(even) { background: rgba(8,13,21,0.55); }
      tbody tr:nth-child(odd) { background: rgba(5,9,16,0.45); }
      .item-name { font-weight: 600; font-size: 13px; }
      .item-desc { font-size: 11px; color: var(--muted); margin-top: 2px; }
      .right { text-align: right; }

      .totals {
        margin-top: 14px;
        width: 100%;
        position: relative;
        z-index: 1;
      }
      .totals .row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 13px;
      }
      .totals .row strong { font-weight: 700; }
      .totals .row.total-row {
        border-top: 1px solid rgba(255,255,255,0.1);
        margin-top: 6px;
        padding-top: 8px;
        font-size: 14px;
      }

      footer {
        margin-top: 20px;
        font-size: 11px;
        color: var(--muted);
        line-height: 1.5;
        position: relative;
        z-index: 1;
      }
      footer .section-title {
        font-weight: 600;
        color: var(--brand-soft);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 10px;
        margin-bottom: 4px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-row">
          <img src="${company.logoTextUrl}" alt="${company.name}" class="logo-text" />
        </div>
        <div class="meta-row">
          <div style="text-align:right;">
            <div class="label">Invoice #</div>
            <div class="value" style="margin-bottom:4px;">${purchase.id}</div>
            <div class="label">Enrollment Date</div>
            <div class="value" style="margin-bottom:4px;">${issuedAt.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-title">Student / Account Holder</div>
          <div class="value">${purchase.user?.name || '—'}</div>
          <div class="muted" style="font-size:12px; margin-top:2px;">${purchase.user?.email || ''}</div>
          ${purchase.user?.phone ? `<div class="muted" style="font-size:12px; margin-top:2px;">${purchase.user.phone}</div>` : ''}
        </div>
        <div class="card">
          <div class="card-title">Payment Details</div>
          <div style="margin-bottom:4px;">
            <span class="label">Payment Method</span><br/>
            <span class="value">${paymentMethodLabel}</span>
          </div>
          <div style="margin-bottom:4px;">
            <span class="label">Paid On</span><br/>
            <span class="value">${paidAt.toLocaleDateString()}</span>
          </div>
          <div style="margin-top:4px;">
            <span class="label">Support Email</span><br/>
            <span class="value">${company.email}</span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="right">Unit Price</th>
            <th class="right">Qty</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="row total-row">
          <strong>Total</strong>
          <strong>${fmt(total, currency)}</strong>
        </div>
      </div>

      <footer>
        <div style="margin-bottom:8px;">Digital educational goods – no physical shipping is required. Keep this invoice for your records.</div>
        <div style="margin-top:8px;">
          <div class="section-title">Refunds & Fair-Use Policy</div>
          <div>Refund requests (where applicable) are subject to our fair-use policy and must:</div>
          <ul style="margin:4px 0 0 18px; padding:0; list-style:disc;">
            <li>Be submitted within <strong>7 days</strong> of enrollment.</li>
            <li>Relate to the <strong>first purchase</strong> of the relevant product or membership tier with us.</li>
            <li>Not involve excessive downloading, sharing, or misuse of course materials.</li>
          </ul>
          <div style="margin-top:4px;">We reserve the right to decline or prorate refunds if substantial content has been consumed or if abuse of the policy is suspected.</div>
        </div>
      </footer>
    </div>
  </body>
  </html>
  `;

  // ========= EMAIL HTML (white, text-logo centered, CID) =========
  const emailHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice ${purchase.id}</title>
    <style>
      body {
        margin: 0;
        padding: 24px 0;
        background: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        color: #111827;
      }
      .wrapper { width: 100%; }
      .container {
        max-width: 720px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        padding: 20px 22px 24px;
      }
      .header {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 12px;
        margin-bottom: 12px;
      }
      .logo-row {
        text-align: center;
        margin-bottom: 10px;
      }
      /* text-logo, centered, 1280×315 aspect */
      .logo-text {
        max-width: 100%;
        width: 200px;
        aspect-ratio: 1280 / 315;
        height: auto;
        object-fit: contain;
        display: inline-block;
      }
      .meta-row {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
      }
      .label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #6b7280;
      }
      .value {
        font-size: 13px;
        font-weight: 500;
      }
      .pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid #60a5fa;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-left: 4px;
      }
      .grid {
        display: grid;
        grid-template-columns: minmax(0,1.3fr) minmax(0,1fr);
        gap: 16px;
        margin-top: 16px;
      }
      .card {
        border-radius: 10px;
        border: 1px solid #e5e7eb;
        padding: 10px 10px 8px;
        background: #f9fafb;
      }
      .card-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #6b7280;
        margin-bottom: 6px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 18px;
        font-size: 12px;
      }
      thead { background: #f9fafb; }
      th, td {
        padding: 8px 7px;
        border-bottom: 1px solid #e5e7eb;
      }
      th {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #6b7280;
        text-align: left;
      }
      .right { text-align: right; }
      .item-name {
        font-weight: 600;
        font-size: 13px;
      }
      .item-desc {
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
      }
      .totals {
        margin-top: 10px;
        width: 100%;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 13px;
      }
      .totals-row.total {
        border-top: 1px solid #e5e7eb;
        margin-top: 4px;
        padding-top: 8px;
        font-weight: 700;
      }
      footer {
        margin-top: 18px;
        font-size: 11px;
        color: #6b7280;
        line-height: 1.5;
      }
      footer .section-title {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 10px;
        color: #4b5563;
        margin-bottom: 4px;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <div class="logo-row">
            <img src="cid:promrkts.text" alt="${company.name}" class="logo-text" />
          </div>
          <div class="meta-row">
            <div style="text-align:right;">
              <div class="label">Invoice #</div>
              <div class="value" style="margin-bottom:4px;">${purchase.id}</div>
              <div class="label">Enrollment Date</div>
              <div class="value" style="margin-bottom:4px;">${issuedAt.toLocaleDateString()}</div>
              <div class="label">
                Status
                <span class="pill">CONFIRMED</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Student</div>
            <div class="value">${purchase.user?.name || '—'}</div>
            ${purchase.user?.email ? `<div class="muted" style="margin-top:2px;">${purchase.user.email}</div>` : ''}
            ${purchase.user?.phone ? `<div class="muted" style="margin-top:2px;">${purchase.user.phone}</div>` : ''}
          </div>
          <div class="card">
            <div class="card-title">Payment Details</div>
            <div style="margin-bottom:4px;">
              <span class="label">Payment Method</span><br/>
              <span class="value">${paymentMethodLabel}</span>
            </div>
            <div style="margin-bottom:4px;">
              <span class="label">Paid On</span><br/>
              <span class="value">${paidAt.toLocaleDateString()}</span>
            </div>
            <div style="margin-top:4px;">
              <span class="label">Support Email</span><br/>
              <span class="value">${company.email}</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="right">Price</th>
              <th class="right">Qty</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row total">
            <span>Total</span>
            <span>${fmt(total, currency)}</span>
          </div>
        </div>

        <footer>
          <div style="margin-bottom:8px;">
            This invoice confirms your enrollment in a digital educational product. No physical shipping is required.
          </div>
          <div style="margin-top:8px;">
            <div class="section-title">Refunds & Fair-Use Policy</div>
            <div>Refund requests (where applicable) are subject to our fair-use policy and must:</div>
            <ul style="margin:4px 0 0 18px; padding:0; list-style:disc;">
              <li>Be submitted within <strong>7 days</strong> of enrollment.</li>
              <li>Relate to the <strong>first purchase</strong> of the relevant product or membership tier with us.</li>
              <li>Not involve excessive downloading, sharing, or misuse of course materials.</li>
            </ul>
            <div style="margin-top:4px;">
              We reserve the right to decline or prorate refunds if substantial content has been consumed or if abuse of the policy is suspected.
            </div>
          </div>
        </footer>
      </div>
    </div>
  </body>
  </html>
  `;

  return { emailHtml, pdfHtml, company, issuedAt, paidAt };
}

export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  } as any);
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '26mm', right: '26mm', bottom: '26mm', left: '26mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function sendReceiptEmail(purchaseId: string) {
  const full = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { user: true },
  } as any);
  if (!full) throw new Error('Purchase not found');
  const to = full.user?.email;
  if (!to) return;

  const { emailHtml, pdfHtml } = await buildInvoiceHtml(purchaseId);
  const pdf = await generatePdfFromHtml(pdfHtml);
  const subject = `Your receipt for ${full.id}`;

  const origin = (process.env.FRONTEND_URL || '').replace(/\/$/, '') || '';
  let attachments: any[] = [
    { filename: `invoice-${full.id}.pdf`, content: pdf, contentType: 'application/pdf' },
  ];

  // Only text-logo attached (for cid:promrkts.text)
  try {
    if (origin) {
      const textRes = await axios.get(`${origin}/text-logo.png`, { responseType: 'arraybuffer' });
      attachments = [
        { filename: 'text-logo.png', content: Buffer.from(textRes.data), cid: 'promrkts.text' },
        ...attachments,
      ];
    }
  } catch {
    // ignore logo fetch failures silently
  }

  await sendMail({
    to,
    subject,
    html: emailHtml,
    text: 'Your receipt is attached as a PDF.',
    attachments,
  });
}

