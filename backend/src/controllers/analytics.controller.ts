import { Request, Response } from 'express';
import { authorize } from '../middleware/auth';
import prisma from '../config/prisma';
import db from '../config/database';

const __adminCache: Record<string, { expiresAt: number; value: any }> = {};
function getCached<T>(key: string): T | null {
  const hit = __adminCache[key];
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) return null;
  return hit.value as T;
}
function setCached(key: string, value: any, ttlMs: number) {
  __adminCache[key] = { expiresAt: Date.now() + ttlMs, value };
}

// GET /analytics/traffic (admin)
// If you don't have traffic tracking, return an empty series; frontend has fallbacks
// Ensure analytics tables exist
async function ensureAnalyticsTables() {
  await db.query(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    source TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now()
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS pageviews (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
    path TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  )`);
}

// Public tracking endpoint (no auth). Body: { sessionId, path, referrer, userAgent, source, utm_* }
export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { sessionId, path, referrer, userAgent, source, utm_source, utm_medium, utm_campaign, userId } = req.body || {};
    if (!sessionId || !path) return res.status(400).json({ message: 'sessionId and path are required' });
    await ensureAnalyticsTables();
    // upsert session
    await db.query(
      `INSERT INTO sessions (id, user_id, source, utm_source, utm_medium, utm_campaign)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET last_seen = now(), source = COALESCE(EXCLUDED.source, sessions.source), utm_source = COALESCE(EXCLUDED.utm_source, sessions.utm_source), utm_medium = COALESCE(EXCLUDED.utm_medium, sessions.utm_medium), utm_campaign = COALESCE(EXCLUDED.utm_campaign, sessions.utm_campaign)`,
      [sessionId, userId ?? null, source ?? null, utm_source ?? null, utm_medium ?? null, utm_campaign ?? null]
    );
    // insert pageview
    await db.query(
      `INSERT INTO pageviews (session_id, path, referrer, user_agent) VALUES ($1,$2,$3,$4)`,
      [sessionId, path, referrer ?? null, userAgent ?? (req.headers['user-agent'] || null)]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTraffic = [authorize('admin'), async (_req: Request, res: Response) => {
  const cacheKey = 'analytics_traffic_v1';
  const cached = getCached<any>(cacheKey);
  if (cached) return res.json(cached);

  await ensureAnalyticsTables();
  // Aggregate pageviews and sessions by day (last 90 days)
  const pv = await db.query(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS views,
            COUNT(DISTINCT session_id)::int AS sessions
     FROM pageviews
     WHERE created_at >= now() - interval '90 days'
     GROUP BY 1
     ORDER BY 1 ASC`
  );
  const pvMap: Record<string, { views: number; sessions: number }> = {};
  for (const row of pv.rows) pvMap[row.date] = { views: row.views, sessions: row.sessions };

  // Signups per day
  const su = await db.query(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
     FROM users
     WHERE created_at >= now() - interval '90 days'
     GROUP BY 1
     ORDER BY 1 ASC`
  );
  const suMap: Record<string, number> = {};
  for (const row of su.rows) suMap[row.date] = row.count;

  // Purchases per day (confirmed) - DB-side aggregation (fast, low memory)
  const pr = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
    SELECT to_char(date_trunc('day', p."createdAt"), 'YYYY-MM-DD') AS date,
           COUNT(*)::int AS count
    FROM "Purchase" p
    WHERE p.status = 'CONFIRMED'
      AND p."createdAt" >= now() - interval '90 days'
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  const prMap: Record<string, number> = {};
  for (const row of pr) prMap[String(row.date)] = Number(row.count) || 0;

  // Merge dates
  const dates = Array.from(new Set([...Object.keys(pvMap), ...Object.keys(suMap), ...Object.keys(prMap)])).sort();
  const series = dates.map((date) => ({
    date,
    sessions: pvMap[date]?.sessions || 0,
    uniques: pvMap[date]?.sessions || 0,
    views: pvMap[date]?.views || 0,
    signups: suMap[date] || 0,
    purchases: prMap[date] || 0,
  }));
  setCached(cacheKey, series, 15_000);
  return res.json(series);
}];

// GET /analytics/admin-extras (admin)
// Returns various admin metrics and lists needed by the dashboard
export const getAdminExtras = [authorize('admin'), async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'analytics_admin_extras_v2';
    const cached = getCached<any>(cacheKey);
    if (cached) return res.json(cached);

    await ensureAnalyticsTables();

    // Broker signups (DB-side aggregation)
    const brokerTotalRes = await prisma.$queryRaw<Array<{ c: number }>>`
      SELECT COUNT(*)::int AS c FROM "BrokerSignup"
    `;
    const brokerSignupsTotal = Number(brokerTotalRes?.[0]?.c || 0);
    const brokerByDay = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS date,
             COUNT(*)::int AS count
      FROM "BrokerSignup"
      WHERE "createdAt" >= now() - interval '90 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    // Materials viewed: count pageviews to /learn routes
    const materialsTotalRes = await db.query(`SELECT COUNT(*)::int AS c FROM pageviews WHERE path LIKE '/learn%'`);
    const materialsViewedTotal = materialsTotalRes.rows?.[0]?.c ?? 0;

    // Refresh tokens issued
    const refreshTotalRes = await db.query(`SELECT COUNT(*)::int AS c FROM refresh_tokens`);
    const refreshTokensTotal = refreshTotalRes.rows?.[0]?.c ?? 0;
    const refreshByDayRes = await db.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
       FROM refresh_tokens
       WHERE created_at >= now() - interval '90 days'
       GROUP BY 1 ORDER BY 1 ASC`
    );

    // Average session time (seconds)
    const avgSessRes = await db.query(`SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (last_seen - first_seen))), 0) AS avg_secs FROM sessions`);
    const avgSessionSeconds = Number(avgSessRes.rows?.[0]?.avg_secs || 0);

    // Users lists
    const usersAllRes = await db.query(`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 100`);
    const usersAll = usersAllRes.rows || [];
    // Pending users: users without a confirmed purchase
    const pendingUsersRes = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at
       FROM users u
       LEFT JOIN purchases p ON p.user_id = u.id AND UPPER(p.status) = 'CONFIRMED'
       GROUP BY u.id
       HAVING COUNT(p.id) = 0
       ORDER BY u.created_at DESC
       LIMIT 100`
    );
    const pendingUsers = pendingUsersRes.rows || [];

    // Pending purchases list (bounded + selected fields only)
    const pendingPurchases = await prisma.purchase.findMany({
      where: { status: 'PENDING' as any },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        userId: true,
        tierId: true,
        status: true,
        txnHash: true,
        createdAt: true,
        finalPriceUsd: true,
        tier: { select: { id: true, name: true, price_usdt: true, price_stripe: true, productType: true } },
        user: { select: { id: true, name: true, email: true, phone: true, role: true, created_at: true } },
      },
    }) as any[];

    const payload = {
      brokerSignupsTotal,
      brokerByDay,
      materialsViewedTotal,
      refreshTokensTotal,
      refreshByDay: refreshByDayRes.rows || [],
      avgSessionSeconds,
      usersAll,
      pendingUsers,
      pendingPurchases,
    };

    setCached(cacheKey, payload, 15_000);
    return res.json(payload);
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}];

// GET /analytics/revenue (admin)
// Build a simple daily revenue series from confirmed purchases and tier prices
export const getRevenue = [authorize('admin'), async (_req: Request, res: Response) => {
  const cacheKey = 'analytics_revenue_v2';
  const cached = getCached<any>(cacheKey);
  if (cached) return res.json(cached);

  const series = await prisma.$queryRaw<Array<{ date: string; usdt: number; stripeUsd: number }>>`
    SELECT
      to_char(date_trunc('day', p."createdAt"), 'YYYY-MM-DD') AS date,
      COALESCE(SUM(t.price_usdt), 0)::float8 AS usdt,
      COALESCE(SUM(t.price_stripe), 0)::float8 / 100.0 AS "stripeUsd"
    FROM "Purchase" p
    JOIN "CourseTier" t ON t.id = p."tierId"
    WHERE p.status = 'CONFIRMED'
      AND p."createdAt" >= now() - interval '365 days'
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  setCached(cacheKey, series, 30_000);
  return res.json(series);
}];

// GET /analytics/courses (admin)
// Aggregate per course: sales count and revenue sums from confirmed purchases
export const getCoursesAgg = [authorize('admin'), async (_req: Request, res: Response) => {
  const cacheKey = 'analytics_courses_v2';
  const cached = getCached<any>(cacheKey);
  if (cached) return res.json(cached);

  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      sales: number;
      revenue_usdt: number;
      revenue_stripe_cents: number;
    }>
  >`
    SELECT
      t.id::text AS id,
      t.name AS name,
      COUNT(p.id)::int AS sales,
      COALESCE(SUM(t.price_usdt), 0)::float8 AS revenue_usdt,
      COALESCE(SUM(t.price_stripe), 0)::bigint AS revenue_stripe_cents
    FROM "Purchase" p
    JOIN "CourseTier" t ON t.id = p."tierId"
    WHERE p.status = 'CONFIRMED'
    GROUP BY t.id, t.name
    ORDER BY sales DESC
  `;

  // Keep response contract compatible with existing frontend
  const payload = rows.map((r: { id: string; name: string; sales: number; revenue_usdt: number; revenue_stripe_cents: number }) => ({
    id: String(r.id),
    name: String(r.name),
    sales: Number(r.sales) || 0,
    views: 0,
    revenue_usdt: Number(r.revenue_usdt) || 0,
    revenue_stripe_cents: Number(r.revenue_stripe_cents) || 0,
  }));

  setCached(cacheKey, payload, 30_000);
  return res.json(payload);
}];

// ---------------------------------------------------------------------------
// Shared Ollama helpers for AI analytics
// ---------------------------------------------------------------------------

async function callOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  const model = process.env.OLLAMA_MODEL || 'llama3.1';
  const base =
    process.env.OLLAMA_URL ||
    (process.env.OLLAMA_BASE_URL
      ? `${process.env.OLLAMA_BASE_URL.replace(/\/?$/, '')}/api/chat`
      : null) ||
    `http://127.0.0.1:${process.env.OLLAMA_PORT || '11435'}/api/chat`;

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: false,
  } as const;

  const resp = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`ollama ${resp.status}: ${text || 'request failed'}`);
  }

  const data: any = await resp.json();
  let content = String(data?.message?.content || '').trim();

  // Extract JSON from ```json ... ``` blocks if present
  const fenceMatch = content.match(/```json([\s\S]*?)```/i);
  if (fenceMatch) {
    content = fenceMatch[1].trim();
  }

  return content;
}

const toNum = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ---------------------------------------------------------------------------
// Finnhub helpers (real-market OHLC / quotes for FX & indices)
// ---------------------------------------------------------------------------

type FinnhubCandleResponse = {
  s: string;
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
};

type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
};

const FINNHUB_API_BASE = process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1';

const mapSymbolToFinnhub = (symbol: string): string => {
  const upper = symbol.toUpperCase();
  const manual: Record<string, string> = {
    XAUUSD: 'OANDA:XAU_USD',
    EURUSD: 'OANDA:EUR_USD',
    GBPUSD: 'OANDA:GBP_USD',
    US500: 'OANDA:SPX500_USD',
  };
  if (manual[upper]) return manual[upper];
  if (upper.length === 6) {
    return `OANDA:${upper.slice(0, 3)}_${upper.slice(3)}`;
  }
  return upper;
};

const timeframeToResolution = (
  tfRaw: string | undefined
): { resolution: string; seconds: number } => {
  const tf = String(tfRaw || '4H').toUpperCase();
  switch (tf) {
    case '1H':
    case '60':
      return { resolution: '60', seconds: 60 * 60 };
    case '4H':
    case '240':
      return { resolution: '240', seconds: 4 * 60 * 60 };
    case 'D':
    case '1D':
    case 'D1':
      return { resolution: 'D', seconds: 24 * 60 * 60 };
    default:
      return { resolution: '240', seconds: 4 * 60 * 60 };
  }
};

async function fetchFinnhubCandles(
  symbol: string,
  timeframe?: string
): Promise<Candle[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY is not configured');
  }

  const mapped = mapSymbolToFinnhub(symbol);
  const { resolution, seconds } = timeframeToResolution(timeframe);

  const nowSec = Math.floor(Date.now() / 1000);
  const lookbackCandles = 60; // last ~60 candles on that timeframe
  const from = nowSec - lookbackCandles * seconds;
  const to = nowSec;

  const url = `${FINNHUB_API_BASE}/forex/candle?symbol=${encodeURIComponent(
    mapped
  )}&resolution=${encodeURIComponent(resolution)}&from=${from}&to=${to}&token=${encodeURIComponent(
    apiKey
  )}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`finnhub ${resp.status}: ${text || 'request failed'}`);
  }

  const data: FinnhubCandleResponse = (await resp.json()) as FinnhubCandleResponse;
  if (!data || data.s !== 'ok' || !data.t || !data.c) return [];

  const candles: Candle[] = [];
  const len = Math.min(
    data.t?.length || 0,
    data.o?.length || 0,
    data.h?.length || 0,
    data.l?.length || 0,
    data.c?.length || 0
  );
  for (let i = 0; i < len; i += 1) {
    candles.push({
      t: data.t![i],
      o: data.o![i],
      h: data.h![i],
      l: data.l![i],
      c: data.c![i],
    });
  }
  return candles;
}

// GET /analytics/ai/movers (public)
// Uses Finnhub OHLC to derive top movers and lets Ollama
// annotate / enrich the rows. Returns
// { symbol, lastPrice, changePct, session } objects.
export const getAiMovers = async (req: Request, res: Response) => {
  type AiMoverRow = {
    symbol: string;
    lastPrice: number;
    changePct: number;
    session?: string;
  };

  try {
    const symbolsParam = String(req.query.symbols || '').toUpperCase();
    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const timeframe = String(req.query.tf || req.query.timeframe || '4H');

    if (!symbols.length) {
      return res.status(400).json({ message: 'symbols query param is required, e.g. ?symbols=XAUUSD,US500,EURUSD' });
    }

    const perSymbolData = await Promise.all(
      symbols.map(async (sym) => {
        try {
          const candles = await fetchFinnhubCandles(sym, timeframe);
          if (!candles.length) return null;
          const first = candles[0];
          const last = candles[candles.length - 1];
          if (!first || !last || !first.c || !last.c) return null;
          const lastPrice = toNum(last.c);
          const changePct = ((last.c - first.c) / first.c) * 100;
          return {
            symbol: sym,
            lastPrice,
            changePct,
            candles,
          };
        } catch (e) {
          return null;
        }
      })
    );

    const usable = perSymbolData.filter(Boolean) as Array<{
      symbol: string;
      lastPrice: number;
      changePct: number;
      candles: Candle[];
    }>;

    if (!usable.length) {
      return res.status(500).json({ message: 'No usable Finnhub data for requested symbols' });
    }

    // Sort by absolute percent move and take top few
    usable.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
    const top = usable.slice(0, 10);

    const systemPrompt =
      'You are a trading analytics engine. You output ONLY JSON. No prose. ' +
      'You are given real OHLC candles for several FX / indices / gold symbols over a timeframe and must return a short list of movers. ' +
      'The timeframe is expressed like 4H or 1D and candles are strictly chronological.';

    const userPayload = {
      timeframe,
      rows: top.map((r) => ({
        symbol: r.symbol,
        lastPrice: r.lastPrice,
        changePct: r.changePct,
        candles: r.candles.map((c) => ({ t: c.t, o: c.o, h: c.h, l: c.l, c: c.c })),
      })),
      instructions:
        'Using the candles and price changes, return JSON object {"movers":[{"symbol": string, "lastPrice": number, "changePct": number, "session": string}]}. ' +
        'session can be a short human label like "London", "New York" or "Asia" or a simple regime label. Do NOT output explanations, only JSON.',
    };

    const content = await callOllama(systemPrompt, JSON.stringify(userPayload));

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({ message: 'Failed to parse Ollama JSON', raw: content });
    }

    const moversRaw: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.movers)
      ? parsed.movers
      : [];

    const payload: AiMoverRow[] = moversRaw
      .map((m: any) => {
        const symbol = String(m?.symbol || '').toUpperCase().slice(0, 20);
        if (!symbol) return null;
        const lastPrice = toNum(m?.lastPrice ?? m?.price ?? m?.last);
        const changePct = toNum(m?.changePct ?? m?.change_percent ?? m?.change);
        const session = m?.session ? String(m.session) : undefined;
        return { symbol, lastPrice, changePct, session };
      })
      .filter(Boolean) as AiMoverRow[];

    if (!payload.length) {
      return res.status(500).json({ message: 'Ollama returned no usable movers', raw: parsed });
    }

    return res.json(payload);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: 'Internal error in AI movers endpoint', error: e?.message || String(e) });
  }
};

// GET /analytics/ai/momentum (public)
// Returns a simple momentum snapshot per symbol using real OHLC data.
export const getAiMomentum = async (req: Request, res: Response) => {
  try {
    const symbolsParam = String(req.query.symbols || '').toUpperCase();
    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const timeframe = String(req.query.tf || req.query.timeframe || '4H');

    if (!symbols.length) {
      return res.status(400).json({ message: 'symbols query param is required, e.g. ?symbols=XAUUSD,US500,EURUSD' });
    }

    const perSymbolData = await Promise.all(
      symbols.map(async (sym) => {
        try {
          const candles = await fetchFinnhubCandles(sym, timeframe);
          if (!candles.length) return null;
          const first = candles[0];
          const last = candles[candles.length - 1];
          if (!first || !last || !first.c || !last.c) return null;
          const lastPrice = toNum(last.c);
          const changePct = ((last.c - first.c) / first.c) * 100;
          return {
            symbol: sym,
            lastPrice,
            changePct,
            candles,
          };
        } catch (e) {
          return null;
        }
      })
    );

    const usable = perSymbolData.filter(Boolean) as Array<{
      symbol: string;
      lastPrice: number;
      changePct: number;
      candles: Candle[];
    }>;

    if (!usable.length) {
      return res.status(500).json({ message: 'No usable Finnhub data for requested symbols' });
    }

    const systemPrompt =
      'You are a trading analytics engine. You output ONLY JSON. No prose. ' +
      'You are given real OHLC candles for several FX / indices / gold symbols over a timeframe and must summarize intraday momentum. ' +
      'The timeframe is expressed like 4H or 1D and candles are strictly chronological.';

    const userPayload = {
      timeframe,
      rows: usable.map((r) => ({
        symbol: r.symbol,
        lastPrice: r.lastPrice,
        changePct: r.changePct,
        candles: r.candles.map((c) => ({ t: c.t, o: c.o, h: c.h, l: c.l, c: c.c })),
      })),
      instructions:
        'Return JSON object {"rows":[{"symbol": string, "bias": "bullish"|"bearish"|"neutral", "score": number, "lastPrice": number, "changePct": number}]}. ' +
        'score is a 0-100 momentum score (higher = stronger trend). Do NOT output explanations, only JSON.',
    };

    const content = await callOllama(systemPrompt, JSON.stringify(userPayload));

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({ message: 'Failed to parse Ollama JSON', raw: content });
    }

    const raw: any[] = Array.isArray(parsed?.rows) ? parsed.rows : [];

    const payload = raw
      .map((r: any) => ({
        symbol: String(r?.symbol || '').toUpperCase().slice(0, 20),
        bias: (String(r?.bias || 'neutral').toLowerCase() as 'bullish' | 'bearish' | 'neutral'),
        score: toNum(r?.score),
        lastPrice: toNum(r?.lastPrice ?? r?.price ?? r?.last),
        changePct: toNum(r?.changePct ?? r?.change_percent ?? r?.change),
      }))
      .filter((r: any) => r.symbol);

    if (!payload.length) {
      return res.status(500).json({ message: 'Ollama returned no usable momentum rows', raw: parsed });
    }

    return res.json(payload);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: 'Internal error in AI momentum endpoint', error: e?.message || String(e) });
  }
};

// GET /analytics/ai/news (public)
// Returns a lightweight macro / news calendar view.
export const getAiNews = async (_req: Request, res: Response) => {
  try {
    const systemPrompt =
      'You are a trading macro calendar engine. You output ONLY JSON. No prose. ' +
      'Summarize a few relevant upcoming or recent macro events.';

    const userPrompt =
      'Return JSON object {"events":[{"time": string, "currency": string, "impact": "low"|"medium"|"high", "title": string}]}. ' +
      'Use realistic style values but you may approximate; this is for educational dashboards.';

    const content = await callOllama(systemPrompt, userPrompt);

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({ message: 'Failed to parse Ollama JSON', raw: content });
    }

    const raw: any[] = Array.isArray(parsed?.events) ? parsed.events : [];

    const payload = raw
      .map((e: any) => ({
        time: String(e?.time || ''),
        currency: String(e?.currency || '').toUpperCase().slice(0, 6),
        impact: (String(e?.impact || 'low').toLowerCase() as 'low' | 'medium' | 'high'),
        title: String(e?.title || ''),
      }))
      .filter((e: any) => e.title);

    if (!payload.length) {
      return res.status(500).json({ message: 'Ollama returned no usable news events', raw: parsed });
    }

    return res.json(payload);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: 'Internal error in AI news endpoint', error: e?.message || String(e) });
  }
};

// GET /analytics/ai/liveQuotes (public)
// Lightweight real-time style quotes based on latest Finnhub candles
export const getAiLiveQuotes = async (req: Request, res: Response) => {
  try {
    const symbolsParam = String(req.query.symbols || '').toUpperCase();
    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const timeframe = String(req.query.tf || req.query.timeframe || '4H');

    if (!symbols.length) {
      return res.status(400).json({ message: 'symbols query param is required, e.g. ?symbols=XAUUSD,EURUSD,GBPUSD' });
    }

    const rows = await Promise.all(
      symbols.map(async (sym) => {
        try {
          const candles = await fetchFinnhubCandles(sym, timeframe);
          if (!candles.length) return null;
          const first = candles[0];
          const last = candles[candles.length - 1];
          if (!first || !last || !first.c || !last.c) return null;
          const lastPrice = toNum(last.c);
          const changePct = ((last.c - first.c) / first.c) * 100;
          // We do not have direct bid/ask from candles, so approximate
          const bid = lastPrice;
          const ask = lastPrice;
          return {
            symbol: sym,
            bid,
            ask,
            changePct,
          };
        } catch {
          return null;
        }
      })
    );

    const payload = rows.filter(Boolean);
    if (!payload.length) {
      return res.status(500).json({ message: 'No usable Finnhub data for requested symbols' });
    }

    return res.json(payload);
  } catch (e: any) {
    return res.status(500).json({ message: 'Internal error in AI liveQuotes endpoint', error: e?.message || String(e) });
  }
};

// GET /analytics/ai/feargreed (public)
// Aggregated sentiment index (0-100) across symbols / timeframe
export const getAiFearGreed = async (req: Request, res: Response) => {
  try {
    const symbolsParam = String(req.query.symbols || '').toUpperCase();
    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const timeframe = String(req.query.tf || req.query.timeframe || '4H');

    if (!symbols.length) {
      return res.status(400).json({ message: 'symbols query param is required, e.g. ?symbols=XAUUSD,US500,EURUSD' });
    }

    const perSymbolData = await Promise.all(
      symbols.map(async (sym) => {
        try {
          const candles = await fetchFinnhubCandles(sym, timeframe);
          if (!candles.length) return null;
          const first = candles[0];
          const last = candles[candles.length - 1];
          if (!first || !last || !first.c || !last.c) return null;
          const lastPrice = toNum(last.c);
          const changePct = ((last.c - first.c) / first.c) * 100;
          return {
            symbol: sym,
            lastPrice,
            changePct,
            candles,
          };
        } catch {
          return null;
        }
      })
    );

    const usable = perSymbolData.filter(Boolean) as Array<{
      symbol: string;
      lastPrice: number;
      changePct: number;
      candles: Candle[];
    }>;

    if (!usable.length) {
      return res.status(500).json({ message: 'No usable Finnhub data for requested symbols' });
    }

    const systemPrompt =
      'You are a trading risk sentiment engine. You output ONLY JSON. No prose. ' +
      'You are given real OHLC candles and short-term performance for a basket of symbols and must compute a fear/greed style index.';

    const userPayload = {
      timeframe,
      rows: usable.map((r) => ({
        symbol: r.symbol,
        lastPrice: r.lastPrice,
        changePct: r.changePct,
        candles: r.candles.map((c) => ({ t: c.t, o: c.o, h: c.h, l: c.l, c: c.c })),
      })),
      instructions:
        'Return JSON object {"score": number, "label": string, "note": string}. ' +
        'score must be 0-100 where 0 is max fear and 100 is max greed. label is a short regime description like "Extreme Fear" or "Greedy". note is a one-sentence explanation. Do NOT output explanations outside JSON.',
    };

    const content = await callOllama(systemPrompt, JSON.stringify(userPayload));

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({ message: 'Failed to parse Ollama JSON', raw: content });
    }

    const score = toNum(parsed?.score);
    const label = String(parsed?.label || '').slice(0, 80);
    const note = String(parsed?.note || '').slice(0, 400);

    if (!Number.isFinite(score)) {
      return res.status(500).json({ message: 'Ollama returned invalid fear/greed payload', raw: parsed });
    }

    return res.json({ score, label, note });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: 'Internal error in AI feargreed endpoint', error: e?.message || String(e) });
  }
};

// GET /analytics/ai/momentumIndex (public)
// Aggregated momentum index (-100..100) for a basket of symbols
export const getAiMomentumIndex = async (req: Request, res: Response) => {
  try {
    const symbolsParam = String(req.query.symbols || '').toUpperCase();
    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const timeframe = String(req.query.tf || req.query.timeframe || '4H');

    if (!symbols.length) {
      return res.status(400).json({ message: 'symbols query param is required, e.g. ?symbols=XAUUSD,US500,EURUSD' });
    }

    const perSymbolData = await Promise.all(
      symbols.map(async (sym) => {
        try {
          const candles = await fetchFinnhubCandles(sym, timeframe);
          if (!candles.length) return null;
          const first = candles[0];
          const last = candles[candles.length - 1];
          if (!first || !last || !first.c || !last.c) return null;
          const lastPrice = toNum(last.c);
          const changePct = ((last.c - first.c) / first.c) * 100;
          return {
            symbol: sym,
            lastPrice,
            changePct,
            candles,
          };
        } catch {
          return null;
        }
      })
    );

    const usable = perSymbolData.filter(Boolean) as Array<{
      symbol: string;
      lastPrice: number;
      changePct: number;
      candles: Candle[];
    }>;

    if (!usable.length) {
      return res.status(500).json({ message: 'No usable Finnhub data for requested symbols' });
    }

    const systemPrompt =
      'You are a trading momentum regime engine. You output ONLY JSON. No prose. ' +
      'You are given real OHLC candles and short-term performance for a basket of symbols and must compute a momentum index.';

    const userPayload = {
      timeframe,
      rows: usable.map((r) => ({
        symbol: r.symbol,
        lastPrice: r.lastPrice,
        changePct: r.changePct,
        candles: r.candles.map((c) => ({ t: c.t, o: c.o, h: c.h, l: c.l, c: c.c })),
      })),
      instructions:
        'Return JSON object {"value": number, "note": string}. ' +
        'value must be between -100 and 100 where -100 is max distribution / downtrend and 100 is max uptrend / strong impulse. note is a one-sentence explanation. Do NOT output explanations outside JSON.',
    };

    const content = await callOllama(systemPrompt, JSON.stringify(userPayload));

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({ message: 'Failed to parse Ollama JSON', raw: content });
    }

    const value = toNum(parsed?.value);
    const note = String(parsed?.note || '').slice(0, 400);

    if (!Number.isFinite(value)) {
      return res.status(500).json({ message: 'Ollama returned invalid momentumIndex payload', raw: parsed });
    }

    // Clamp to -100..100
    const clamped = Math.max(-100, Math.min(100, value));

    return res.json({ value: clamped, note });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: 'Internal error in AI momentumIndex endpoint', error: e?.message || String(e) });
  }
};
