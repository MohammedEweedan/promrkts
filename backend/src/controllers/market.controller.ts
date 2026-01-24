import { Request, Response } from 'express';
import axios from 'axios';

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: any;
  };
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizePairToYahooSymbol(pairRaw: string): string {
  const p = String(pairRaw || '').trim().toUpperCase();
  if (!p) return 'EURUSD=X';

  // Allow passing raw Yahoo symbol
  if (p.includes('=X') || p.includes('-USD') || p.includes('^')) return p;

  const cleaned = p.replace(/[^A-Z0-9]/g, '');

  // FX pairs like EURUSD
  if (/^[A-Z]{6}$/.test(cleaned)) {
    return `${cleaned}=X`;
  }

  // Crypto like BTCUSDT / ETHUSDT -> BTC-USD
  if (/^[A-Z0-9]{2,10}USDT$/.test(cleaned)) {
    const base = cleaned.replace(/USDT$/, '');
    return `${base}-USD`;
  }

  // Crypto like BTCUSD -> BTC-USD
  if (/^[A-Z0-9]{2,10}USD$/.test(cleaned)) {
    const base = cleaned.replace(/USD$/, '');
    return `${base}-USD`;
  }

  return cleaned;
}

function normalizeInterval(intervalRaw: any): string {
  const raw = String(intervalRaw || '').trim();
  // Yahoo supports: 1m,2m,5m,15m,30m,60m,90m,1h,1d,1wk,1mo
  const allowed = new Set(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '1wk', '1mo']);
  if (allowed.has(raw)) return raw;
  return '5m';
}

function normalizeRange(rangeRaw: any): string {
  const raw = String(rangeRaw || '').trim();
  // Yahoo ranges: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
  const allowed = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']);
  if (allowed.has(raw)) return raw;
  return '5d';
}

export const getCandles = async (req: Request, res: Response) => {
  try {
    const pair = String((req.query.pair as string) || (req.query.symbol as string) || 'EURUSD');
    const yahooSymbol = normalizePairToYahooSymbol(pair);
    const interval = normalizeInterval(req.query.interval);
    const range = normalizeRange(req.query.range);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      yahooSymbol
    )}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`;

    const resp = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json,text/plain,*/*',
      },
      timeout: 15000,
    });

    const data = resp.data as YahooChartResponse;
    const result = data?.chart?.result?.[0];
    const ts = result?.timestamp || [];
    const q = result?.indicators?.quote?.[0];

    const o = q?.open || [];
    const h = q?.high || [];
    const l = q?.low || [];
    const c = q?.close || [];

    const len = clamp(
      Math.min(ts.length, o.length, h.length, l.length, c.length),
      0,
      5000
    );

    const candles: Array<{ t: number; o: number; h: number; l: number; c: number }> = [];
    for (let i = 0; i < len; i += 1) {
      const ti = Number(ts[i]);
      const oi = Number(o[i]);
      const hi = Number(h[i]);
      const li = Number(l[i]);
      const ci = Number(c[i]);
      if (!Number.isFinite(ti) || !Number.isFinite(oi) || !Number.isFinite(hi) || !Number.isFinite(li) || !Number.isFinite(ci)) continue;
      candles.push({ t: ti, o: oi, h: hi, l: li, c: ci });
    }

    return res.json({
      pair,
      yahooSymbol,
      interval,
      range,
      candles,
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Failed to load candles' });
  }
};

export const getQuote = async (req: Request, res: Response) => {
  try {
    const pair = String((req.query.pair as string) || (req.query.symbol as string) || 'EURUSD');
    const yahooSymbol = normalizePairToYahooSymbol(pair);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      yahooSymbol
    )}?interval=1m&range=1d`;

    const resp = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json,text/plain,*/*',
      },
      timeout: 15000,
    });

    const data = resp.data as YahooChartResponse;
    const result = data?.chart?.result?.[0];
    const ts = result?.timestamp || [];
    const q = result?.indicators?.quote?.[0];
    const closes = q?.close || [];

    // Use last finite close
    for (let i = Math.min(ts.length, closes.length) - 1; i >= 0; i -= 1) {
      const price = Number(closes[i]);
      const t = Number(ts[i]);
      if (Number.isFinite(price) && Number.isFinite(t)) {
        return res.json({ pair, yahooSymbol, price, t });
      }
    }

    return res.status(404).json({ message: 'No quote available' });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Failed to load quote' });
  }
};
