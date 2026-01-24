// Simple analytics tracker for pageviews and sessions

import { resolveBackendOrigin } from './utils/backendOrigin';

const API_BASE = resolveBackendOrigin();

function uuidv4() {
  // RFC4122-ish UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSessionId(): string {
  let sid = localStorage.getItem('session_id');
  if (!sid) {
    sid = uuidv4();
    localStorage.setItem('session_id', sid);
  }
  return sid;
}

function getUtmParams(url: URL) {
  const params = url.searchParams;
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}

export async function trackPageview(pathnameWithSearch?: string) {
  try {
    const url = new URL(window.location.href);
    const sessionId = getSessionId();
    const path = pathnameWithSearch || (url.pathname + url.search);
    const referrer = document.referrer || undefined;
    const userAgent = navigator.userAgent;
    const source = (referrer ? (() => { try { return new URL(referrer).host; } catch { return 'referrer'; } })() : 'direct');
    const utm = getUtmParams(url);
    const userId = localStorage.getItem('user_id') || undefined; // optional if you store it

    await fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, path, referrer, userAgent, source, ...utm, userId }),
      keepalive: true,
      credentials: 'include',
    });
  } catch {
    // best-effort; ignore failures
  }
}
