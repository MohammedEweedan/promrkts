// backend/src/utils/whatsapp.ts
// Use Node 18+ global fetch (no dependency on node-fetch to avoid ESM require issues)
const WA_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WA_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

export async function sendWhatsAppText(toE164: string, body: string) {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) {
    console.warn('[WhatsApp] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID');
    return { ok: false, skipped: true } as const;
  }
  const url = `https://graph.facebook.com/v20.0/${WA_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: toE164.replace(/\s+/g, ''),
    type: 'text',
    text: { body },
  };
  const resp = await (globalThis as any).fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`[WhatsApp] Send failed: ${resp.status} ${txt}`);
  }
  return { ok: true } as const;
}
