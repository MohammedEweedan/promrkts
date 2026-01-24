import { Request, Response } from "express";
import prisma from "../config/prisma"; // adjust if your prisma client path differs
import type { TradeJournalEntry } from "@prisma/client";

function getUserId(req: any): string | null {
  return req?.user?.id || req?.userId || null;
}

function parseDate(s: any): Date | null {
  if (!s) return null;
  const d = new Date(String(s));
  return isNaN(d.getTime()) ? null : d;
}

export async function createTrade(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const {
    pair,
    side,
    entryPrice,
    exitPrice,
    slPrice,
    tpPrice,
    result,
    pnl,
    accountBalance,
    leverage,
    openedAt,
    notes,
  } = req.body || {};

  if (!pair || typeof pair !== "string") {
    return res.status(400).json({ message: "pair is required" });
  }
  if (side !== "BUY" && side !== "SELL") {
    return res.status(400).json({ message: "side must be BUY or SELL" });
  }

  const openedAtDate = parseDate(openedAt);

  const created = await prisma.tradeJournalEntry.create({
    data: {
      userId,
      pair: pair.trim().toUpperCase(),
      side,
      entryPrice: entryPrice != null ? Number(entryPrice) : undefined,
      exitPrice: exitPrice != null ? Number(exitPrice) : undefined,
      slPrice: slPrice != null ? Number(slPrice) : undefined,
      tpPrice: tpPrice != null ? Number(tpPrice) : undefined,
      result: result || "OPEN",
      pnl: pnl != null ? Number(pnl) : undefined,
      accountBalance: accountBalance != null ? Number(accountBalance) : undefined,
      leverage: leverage != null ? Math.trunc(Number(leverage)) : undefined,
      openedAt: openedAtDate ?? undefined,
      notes: notes ? String(notes) : undefined,
    },
  });

  return res.status(201).json(created);
}

export async function listTrades(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { pair, result, from, to, take, skip } = req.query;

  const where: any = { userId };

  if (pair) where.pair = String(pair).trim().toUpperCase();
  if (result) where.result = String(result).toUpperCase();

  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) where.createdAt.lte = toDate;
  }

  const rows = await prisma.tradeJournalEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: take ? Math.min(200, Math.max(1, Number(take))) : 50,
    skip: skip ? Math.max(0, Number(skip)) : 0,
  });

  return res.json(rows);
}

export async function getTradeStats(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const trades: TradeJournalEntry[] = await prisma.tradeJournalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const closed = trades.filter((t: TradeJournalEntry) => t.result !== "OPEN");
  const wins = closed.filter((t: TradeJournalEntry) => t.result === "WIN").length;
  const losses = closed.filter((t: TradeJournalEntry) => t.result === "LOSS").length;
  const breakeven = closed.filter((t: TradeJournalEntry) => t.result === "BREAKEVEN").length;

  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0;

  const grossWins = closed.reduce((a: number, t: TradeJournalEntry) => {
    const v = t.pnl ?? 0;
    return a + (v > 0 ? v : 0);
  }, 0);

  const grossLossAbs = closed.reduce((a: number, t: TradeJournalEntry) => {
    const v = t.pnl ?? 0;
    return a + (v < 0 ? Math.abs(v) : 0);
  }, 0);

  const profitFactor = grossLossAbs > 0 ? grossWins / grossLossAbs : grossWins > 0 ? 999 : 0;

  const byPair: Record<string, { count: number; wins: number; losses: number; pnl: number }> = {};
  for (const t of trades) {
    const k = (t.pair || "UNKNOWN").toUpperCase();
    if (!byPair[k]) byPair[k] = { count: 0, wins: 0, losses: 0, pnl: 0 };
    byPair[k].count += 1;
    if (t.result === "WIN") byPair[k].wins += 1;
    if (t.result === "LOSS") byPair[k].losses += 1;
    byPair[k].pnl += t.pnl ?? 0;
  }

  return res.json({
    totals: {
      totalTrades: trades.length,
      closedTrades: closed.length,
      wins,
      losses,
      breakeven,
      winRate: Number(winRate.toFixed(2)),
      profitFactor: Number(profitFactor.toFixed(2)),
    },
    byPair,
    trades,
  });
}

export async function updateTrade(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;
  const body = req.body || {};

  // ensure user owns it
  const existing = await prisma.tradeJournalEntry.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ message: "Trade not found" });

  const openedAtDate = body.openedAt !== undefined ? parseDate(body.openedAt) : undefined;
  const closedAtDate = body.closedAt !== undefined ? parseDate(body.closedAt) : undefined;

  const updated = await prisma.tradeJournalEntry.update({
    where: { id },
    data: {
      pair: body.pair ? String(body.pair).trim().toUpperCase() : undefined,
      side: body.side === "BUY" || body.side === "SELL" ? body.side : undefined,
      result: body.result ? String(body.result).toUpperCase() : undefined,
      pnl: body.pnl != null ? Number(body.pnl) : undefined,
      entryPrice: body.entryPrice != null ? Number(body.entryPrice) : undefined,
      exitPrice: body.exitPrice != null ? Number(body.exitPrice) : undefined,
      slPrice: body.slPrice != null ? Number(body.slPrice) : undefined,
      tpPrice: body.tpPrice != null ? Number(body.tpPrice) : undefined,
      size: body.size != null ? Number(body.size) : undefined,
      accountBalance: body.accountBalance != null ? Number(body.accountBalance) : undefined,
      leverage: body.leverage != null ? Math.trunc(Number(body.leverage)) : undefined,
      openedAt: openedAtDate === undefined ? undefined : openedAtDate,
      closedAt: closedAtDate === undefined ? undefined : closedAtDate,
      notes: body.notes != null ? String(body.notes) : undefined,
    },
  });

  return res.json(updated);
}

export async function deleteTrade(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;

  const existing = await prisma.tradeJournalEntry.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ message: "Trade not found" });

  await prisma.tradeJournalEntry.delete({ where: { id } });
  return res.json({ ok: true });
}
