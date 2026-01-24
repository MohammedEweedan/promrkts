export type InvoiceItem = {
  name: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

export type InvoiceData = {
  id: string; // purchase ID
  status: string; // PENDING | CONFIRMED | FAILED
  issuedAt?: string; // ISO string (enrollment date)
  paidAt?: string; // ISO string
  currency?: string; // e.g. USD
  buyer?: { name?: string; email?: string; country?: string };
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paymentMethod?: string; // e.g. STRIPE, USDT, LIBYANA, MADAR
  company?: {
    name?: string;
    address?: string;
    email?: string;
    website?: string;
    logoUrl?: string; // optional override, but we’ll still show logo.png & text-logo.png
  };
};

function fmt(n: number, currency: string = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function printInvoice(data: InvoiceData) {
  const currency = data.currency || "USD";
  const issuedAt = data.issuedAt ? new Date(data.issuedAt) : new Date();
  const paidAt = data.paidAt ? new Date(data.paidAt) : undefined;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const company = {
    name: data.company?.name || "promrkts",
    address: data.company?.address || "",
    email: data.company?.email || "",
    // NOTE: we do NOT show website in the UI anymore
    website: data.company?.website || origin,
    logoIconUrl:
      (data.company?.logoUrl && data.company.logoUrl) ||
      (origin ? `${origin}/logo.png` : "/logo.png"),
    logoTextUrl: origin ? `${origin}/text-logo.png` : "/text-logo.png",
  };

  const title = `Invoice ${data.id ? `#${data.id}` : ""}`.trim();

  const style = `
  <style>
    @page { size: A4; margin: 26mm; }
    :root {
      --brand: #65a8bf;
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

    /* subtle corner accents */
    .container::before,
    .container::after {
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 14px;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
    }
    .logo-stack {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-icon {
      height: 36px;
      width: 36px;
      object-fit: contain;
      border-radius: 12px;
      background: rgba(0,0,0,0.5);
      padding: 4px;
    }
    .logo-text {
      height: 32px;
      object-fit: contain;
      filter: drop-shadow(0 0 8px rgba(104,165,191,0.7));
    }
    .heading {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }
    .muted { color: var(--muted); }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(104,165,191,0.1);
      border: 1px solid rgba(104,165,191,0.7);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--brand-soft);
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

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
      position: relative;
      z-index: 1;
      border-radius: 12px;
      overflow: hidden;
    }
    thead {
      background: rgba(10,17,27,0.95);
    }
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
    tbody tr:nth-child(even) {
      background: rgba(8,13,21,0.55);
    }
    tbody tr:nth-child(odd) {
      background: rgba(5,9,16,0.45);
    }
    .item-name {
      font-weight: 600;
      font-size: 13px;
    }
    .item-desc {
      font-size: 11px;
      color: var(--muted);
      margin-top: 2px;
    }
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
    .totals .row strong {
      font-weight: 700;
    }
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

    .print-hide {
      margin-top: 18px;
      position: relative;
      z-index: 1;
    }
    .print-button {
      padding: 10px 16px;
      border-radius: 999px;
      border: 1px solid var(--brand);
      background: var(--brand);
      color: #050608;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .print-button:hover {
      filter: brightness(1.05);
    }

    @media print {
      html, body { background: #000; }
      .print-hide { display: none; }
      .container {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>`;

  const itemsRows = data.items
    .map(
      (it) => `
      <tr>
        <td>
          <div class="item-name">${it.name}</div>
          ${
            it.description
              ? `<div class="item-desc">${it.description}</div>`
              : ""
          }
        </td>
        <td class="right">${fmt(it.unitPrice, currency)}</td>
        <td class="right">${it.quantity}</td>
        <td class="right">${fmt(it.total, currency)}</td>
      </tr>`
    )
    .join("");

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      ${style}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-stack">
            <img src="${company.logoIconUrl}" alt="logo" class="logo-icon" onerror="this.style.display='none'" />
            <div>
              <img src="${company.logoTextUrl}" alt="promrkts" class="logo-text" onerror="this.style.display='none'" />
            </div>
          </div>
          <div style="text-align:right;">
            <div class="label">Invoice #</div>
            <div class="value" style="margin-bottom:4px;">${data.id || "—"}</div>
            <div class="label">Enrollment Date</div>
            <div class="value" style="margin-bottom:4px;">${issuedAt.toLocaleDateString()}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Student / Account Holder</div>
            <div class="value">${data.buyer?.name || "—"}</div>
            <div class="muted" style="font-size:12px; margin-top:2px;">
              ${data.buyer?.email || ""}
            </div>
            ${
              data.buyer?.country
                ? `<div class="muted" style="font-size:12px; margin-top:2px;">${data.buyer.country}</div>`
                : ""
            }
          </div>

          <div class="card">
            <div class="card-title">Payment Details</div>
            <div style="margin-bottom:4px;">
              <span class="label">Payment Method</span><br/>
              <span class="value">${data.paymentMethod || "—"}</span>
            </div>
            ${
              paidAt
                ? `<div style="margin-bottom:4px;">
                    <span class="label">Paid On</span><br/>
                    <span class="value">${paidAt.toLocaleDateString()}</span>
                  </div>`
                : ""
            }
            ${
              company.email
                ? `<div style="margin-top:4px;">
                    <span class="label">Support Email</span><br/>
                    <span class="value">${company.email}</span>
                  </div>`
                : ""
            }
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
          <div class="row"><span>Subtotal</span><span>${fmt(data.subtotal, currency)}</span></div>
          ${
            typeof data.discount === "number" && data.discount > 0
              ? `<div class="row"><span>Discount</span><span>- ${fmt(
                  data.discount,
                  currency
                )}</span></div>`
              : ""
          }
          ${
            typeof data.tax === "number" && data.tax > 0
              ? `<div class="row"><span>Tax</span><span>${fmt(
                  data.tax,
                  currency
                )}</span></div>`
              : ""
          }
          <div class="row total-row">
            <strong>Total</strong><strong>${fmt(data.total, currency)}</strong>
          </div>
        </div>

        <footer>
          <div style="margin-bottom:8px;">
            Digital educational goods – no physical shipping is required. Keep this invoice for your records.
          </div>

          <div style="margin-top:8px;">
            <div class="section-title">Refunds & Fair-Use Policy</div>
            <div>
              Refund requests (where applicable) are subject to our fair-use policy and must:
            </div>
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

        <div class="print-hide">
          <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
        </div>
      </div>
    </body>
  </html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    URL.revokeObjectURL(url);
    return;
  }
  setTimeout(() => {
    try {
      w.focus();
    } catch {}
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }, 800);
}
