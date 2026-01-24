const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('express').json;
const { chatOllama } = require('./core/llm');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Minimal feedback endpoint (JSONL storage)
const getUserId = (req) => {
  try {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.headers['token'] || '');
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded?.sub || decoded?.id || decoded?.userId || null;
  } catch { return null; }
};

const requireActiveAiSubscription = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: String(userId),
        status: 'CONFIRMED',
        tier: { is: { productType: 'SUBSCRIPTION_AI' } },
      },
      include: { tier: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!purchase) {
      return res.status(402).json({ ok: false, error: 'AI subscription required' });
    }

    const createdAt = new Date(purchase.createdAt).getTime();
    const durationDays = 30;
    const active = Date.now() - createdAt <= durationDays * 24 * 60 * 60 * 1000;
    if (!active) {
      return res.status(402).json({ ok: false, error: 'AI subscription expired' });
    }

    req.aiUserId = String(userId);
    return next();
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Subscription check failed' });
  }
};

app.use('/web', requireActiveAiSubscription, require('./channels/web'));
app.use('/telegram', require('./channels/telegram'));
app.use('/meta', require('./channels/meta'));

app.post('/feedback', bodyParser({ limit: '200kb' }), async (req, res) => {
  try {
    const userId = getUserId(req);
    const { messageId, feedback, page, context } = req.body || {};
    await prisma.botFeedback.create({
      data: {
        userId: userId || undefined,
        messageId: messageId ? String(messageId) : null,
        feedback: feedback === 'up' ? 'up' : 'down',
        context: context ? context : { page: page || 'web' },
      },
    });
    return res.json({ ok: true });
  } catch (e) {
    console.error('[FEEDBACK ERROR]', e);
    return res.status(500).json({ ok: false, error: 'Feedback error' });
  }
});

// Simple TA endpoint: POST { symbol, timeframe, candles: [{t,o,h,l,c,v}] }
// Returns { symbol, timeframe, ema: {20,50,200}, rsi, macd: {hist, signal, macd}, levels: {support:[], resistance:[]} }
app.post('/ta', requireActiveAiSubscription, bodyParser({ limit: '1mb' }), async (req, res) => {
  try {
    const { symbol = '', timeframe = '60', candles = [] } = req.body || {};
    if (!Array.isArray(candles) || candles.length < 50) {
      return res.status(400).json({ ok: false, error: 'Provide at least 50 candles' });
    }
    const closes = candles.map(c => Number(c.c || c.close)).filter(n => Number.isFinite(n));
    const highs  = candles.map(c => Number(c.h || c.high)).filter(n => Number.isFinite(n));
    const lows   = candles.map(c => Number(c.l || c.low)).filter(n => Number.isFinite(n));

    const ema = (period) => {
      const k = 2 / (period + 1);
      let prev = closes[0];
      const out = [];
      for (let i = 0; i < closes.length; i++) {
        const val = i === 0 ? closes[i] : (closes[i] * k + prev * (1 - k));
        out.push(val); prev = val;
      }
      return out[out.length - 1];
    };

    const ema20 = ema(20), ema50 = ema(50), ema200 = ema(200);

    // RSI(14)
    const rsi = (() => {
      const period = 14; if (closes.length <= period) return null;
      let gains = 0, losses = 0;
      for (let i = 1; i <= period; i++) {
        const ch = closes[i] - closes[i-1];
        if (ch >= 0) gains += ch; else losses -= ch;
      }
      let avgGain = gains / period; let avgLoss = losses / period;
      for (let i = period + 1; i < closes.length; i++) {
        const ch = closes[i] - closes[i-1];
        avgGain = (avgGain * (period - 1) + Math.max(0, ch)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.max(0, -ch)) / period;
      }
      if (avgLoss === 0) return 100;
      const rs = avgGain / avgLoss;
      return 100 - 100 / (1 + rs);
    })();

    // MACD(12,26,9)
    const macd = (() => {
      const emaN = (arr, p) => {
        const k = 2 / (p + 1); let prev = arr[0]; const out = [];
        for (let i = 0; i < arr.length; i++) { const v = i===0?arr[i]:(arr[i]*k + prev*(1-k)); out.push(v); prev = v; }
        return out;
      };
      const ema12 = emaN(closes, 12); const ema26 = emaN(closes, 26);
      const macdLine = ema12.map((v,i) => v - ema26[i]);
      const signal = emaN(macdLine.slice(26), 9); // align start rough
      const hist = macdLine.slice(macdLine.length - signal.length).map((v,i) => v - signal[i]);
      return { macd: macdLine[macdLine.length - 1], signal: signal[signal.length - 1], hist: hist[hist.length - 1] };
    })();

    // Simple support/resistance: recent N swing highs/lows (very naive)
    const N = Math.min(50, highs.length);
    const recentHighs = []; const recentLows = [];
    for (let i = closes.length - N; i < closes.length - 1; i++) {
      const h = highs[i], l = lows[i];
      if (h > highs[i-1] && h > highs[i+1]) recentHighs.push(h);
      if (l < lows[i-1] && l < lows[i+1]) recentLows.push(l);
    }
    recentHighs.sort((a,b)=>b-a); recentLows.sort((a,b)=>a-b);

    return res.json({
      ok: true,
      symbol,
      timeframe,
      ema: { 20: Number(ema20?.toFixed?.(2) || ema20), 50: Number(ema50?.toFixed?.(2) || ema50), 200: Number(ema200?.toFixed?.(2) || ema200) },
      rsi: rsi != null ? Number(rsi.toFixed(2)) : null,
      macd,
      levels: {
        support: recentLows.slice(0, 3).map(v => Number(v.toFixed(2))),
        resistance: recentHighs.slice(0, 3).map(v => Number(v.toFixed(2)))
      }
    });
  } catch (e) {
    console.error('[TA ERROR]', e);
    return res.status(500).json({ ok: false, error: 'TA error' });
  }
});

// Fundamental analysis from recent news/calendar
// POST { symbol, lang, articles: [{title, summary, url, ts}], calendar: [{title, ts, importance, currency}] }
app.post('/fa', requireActiveAiSubscription, bodyParser({ limit: '1mb' }), async (req, res) => {
  try {
    const { symbol = '', lang = 'en', articles = [], calendar = [] } = req.body || {};
    const sys = `You are a trading assistant. Produce a short, structured fundamental analysis for the given symbol based on recent headlines and calendar events.\n- Focus on catalysts, risks, and tone (bullish/bearish/neutral).\n- Mention time relevance.\n- Do NOT give financial advice.\n- Output in ${lang}.\n- Keep it under 180 words.`;
    const content = JSON.stringify({ symbol, articles: (articles||[]).slice(-10), calendar: (calendar||[]).slice(-10) });
    const resp = await chatOllama({ system: sys, messages: [{ role: 'user', content }], model: process.env.OLLAMA_MODEL || 'llama3.1', stream: false });
    const text = resp?.message?.content || resp?.choices?.[0]?.message?.content || '';
    return res.json({ ok: true, symbol, summary: text });
  } catch (e) {
    console.error('[FA ERROR]', e);
    return res.status(500).json({ ok: false, error: 'FA error' });
  }
});

app.get('/symbols/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    const lang = String(req.query.lang || 'en').toLowerCase();
    if (!query) return res.json([]);
    const url = `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(query)}&lang=${encodeURIComponent(lang)}&domain=production`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('tv search failed');
    const data = await response.json();
    const arr = Array.isArray(data) ? data : [];
    const symbols = arr.slice(0, 20).map((it) => {
      const exch = String(it.exchange || it.exch || '').toUpperCase();
      const sym = String(it.symbol || it.ticker || '').toUpperCase();
      const prefixed = exch && sym ? `${exch}:${sym}` : sym;
      const desc = String(it.description || it.full_name || sym);
      return { symbol: prefixed, description: desc };
    }).filter(x => x.symbol);
    return res.json(symbols);
  } catch (e) {
    console.error('[SYMBOL SEARCH ERROR]', e);
    return res.status(500).json({ ok: false, error: 'Symbol search error' });
  }
});

module.exports = app;
