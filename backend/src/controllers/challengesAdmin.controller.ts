import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { markEvaluating, markFunded, recordPayoutEvent } from '../services/journey.service';
import { refreshEntitlements } from '../services/entitlements.service';

const toDateKey = (input: any) => {
  try {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    // Normalize to UTC midnight
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
  } catch {
    return null;
  }
};

export const listChallengeAccounts = async (_req: Request, res: Response) => {
  const accounts = await (prisma as any).challengeAccount.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      tier: true,
      purchase: { select: { id: true, status: true, createdAt: true } },
      daily: { orderBy: { date: 'desc' }, take: 1 },
    },
  });

  const shaped = (accounts || []).map((a: any) => ({
    ...a,
    latestDaily: Array.isArray(a.daily) && a.daily.length ? a.daily[0] : null,
    daily: undefined,
  }));

  return res.json({ data: shaped });
};

export const listChallengeTiers = async (_req: Request, res: Response) => {
  const tiers = await prisma.courseTier.findMany({
    where: { productType: 'CHALLENGE' as any },
    orderBy: { price_stripe: 'asc' },
  });
  return res.json({ data: tiers });
};

export const updateChallengeTier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) return res.status(400).json({ message: 'Missing id' });

    const {
      name,
      description,
      price_usdt,
      price_stripe,
      level,
      challengePlatform,
      challengeMeta,
    } = req.body || {};

    const existing = await prisma.courseTier.findFirst({ where: { id, productType: 'CHALLENGE' as any } });
    if (!existing) return res.status(404).json({ message: 'Challenge tier not found' });

    let meta: any = undefined;
    if (challengeMeta != null) {
      if (typeof challengeMeta === 'string') {
        try {
          meta = JSON.parse(challengeMeta);
        } catch {
          return res.status(400).json({ message: 'Invalid challengeMeta JSON' });
        }
      } else {
        meta = challengeMeta;
      }
    }

    const updated = await prisma.courseTier.update({
      where: { id },
      data: {
        name: typeof name === 'string' ? name : undefined,
        description: typeof description === 'string' ? description : undefined,
        price_usdt: price_usdt != null ? Number(price_usdt) : undefined,
        price_stripe: price_stripe != null ? Number(price_stripe) : undefined,
        level: level != null ? level : undefined,
        challengePlatform: challengePlatform != null ? String(challengePlatform) : undefined,
        challengeMeta: meta,
        updatedAt: new Date(),
      } as any,
    });
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ message: 'Unable to update challenge tier' });
  }
};

export const updateChallengeAccount = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { status, mt5Login, mt5Server } = req.body as {
    status?: string;
    mt5Login?: string;
    mt5Server?: string;
  };

  if (!id) return res.status(400).json({ message: 'Missing id' });

  const account = await (prisma as any).challengeAccount.findUnique({ where: { id } });
  if (!account) return res.status(404).json({ message: 'Challenge account not found' });

  const patch: any = { updatedAt: new Date() };
  let statusNormalized: string | undefined = undefined;
  if (typeof status === 'string' && status.trim()) {
    statusNormalized = status.trim().toUpperCase();
    patch.status = statusNormalized;
  }
  if (typeof mt5Login === 'string') patch.mt5Login = mt5Login.trim() || null;
  if (typeof mt5Server === 'string') patch.mt5Server = mt5Server.trim() || null;

  const updated = await (prisma as any).challengeAccount.update({ where: { id }, data: patch });

  if (statusNormalized && account.userId) {
    if (statusNormalized === 'ACTIVE' || statusNormalized === 'IN_PROGRESS') {
      await markEvaluating(account.userId);
    }
    if (statusNormalized === 'PASSED') {
      await markFunded(account.userId);
    }
    await refreshEntitlements(account.userId);
  }

  return res.json(updated);
};

export const upsertChallengeDaily = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { date, balance, equity, pnl, maxDailyDrawdown, maxDailyProfit, meta } = req.body as any;

  if (!id) return res.status(400).json({ message: 'Missing account id' });
  const day = toDateKey(date);
  if (!day) return res.status(400).json({ message: 'Invalid date' });

  const account = await (prisma as any).challengeAccount.findUnique({ where: { id } });
  if (!account) return res.status(404).json({ message: 'Challenge account not found' });

  const row = await (prisma as any).challengeDailyStat.upsert({
    where: { challengeAccountId_date: { challengeAccountId: id, date: day } },
    update: {
      balance: balance == null ? undefined : Number(balance),
      equity: equity == null ? undefined : Number(equity),
      pnl: pnl == null ? undefined : Number(pnl),
      maxDailyDrawdown: maxDailyDrawdown == null ? undefined : Number(maxDailyDrawdown),
      maxDailyProfit: maxDailyProfit == null ? undefined : Number(maxDailyProfit),
      meta: meta == null ? undefined : meta,
    },
    create: {
      challengeAccountId: id,
      date: day,
      balance: balance == null ? undefined : Number(balance),
      equity: equity == null ? undefined : Number(equity),
      pnl: pnl == null ? undefined : Number(pnl),
      maxDailyDrawdown: maxDailyDrawdown == null ? undefined : Number(maxDailyDrawdown),
      maxDailyProfit: maxDailyProfit == null ? undefined : Number(maxDailyProfit),
      meta: meta == null ? undefined : meta,
    },
  });

  return res.json(row);
};

export const getChallengeMetrics = async (_req: Request, res: Response) => {
  const safeNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const [totalAccounts, statusGroups, dailyAgg, passedCount, topByPnl] = await Promise.all([
    (prisma as any).challengeAccount.count(),
    (prisma as any).challengeAccount.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    (prisma as any).challengeDailyStat.aggregate({
      _sum: { pnl: true },
      _max: { maxDailyProfit: true },
      _min: { maxDailyDrawdown: true },
    }),
    (prisma as any).challengeAccount.count({ where: { status: 'PASSED' as any } }),
    (prisma as any).challengeDailyStat.groupBy({
      by: ['challengeAccountId'],
      _sum: { pnl: true },
      orderBy: { _sum: { pnl: 'desc' } },
      take: 10,
    }),
  ]);

  const byStatus: Record<string, number> = { PENDING: 0, ACTIVE: 0, FAILED: 0, PASSED: 0 };
  for (const g of statusGroups || []) {
    const k = String(g.status || 'PENDING').toUpperCase();
    byStatus[k] = (byStatus[k] || 0) + Number(g._count?._all || 0);
  }

  const overallPnl = safeNum(dailyAgg?._sum?.pnl);
  const maxDailyProfit = safeNum(dailyAgg?._max?.maxDailyProfit);
  // Drawdowns are stored as negative numbers in our sim/admin ingestion. Max absolute DD is abs(min).
  const maxDailyDrawdown = Math.abs(safeNum(dailyAgg?._min?.maxDailyDrawdown));

  const topIds = (topByPnl || []).map((r: any) => String(r.challengeAccountId));
  const topAccounts: any[] = topIds.length
    ? await (prisma as any).challengeAccount.findMany({
        where: { id: { in: topIds } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          tier: true,
        },
      })
    : [];
  const topAccountById: Map<string, any> = new Map(topAccounts.map((a: any) => [String(a.id), a]));
  const topPerformers = (topByPnl || [])
    .map((r: any) => {
      const a = topAccountById.get(String(r.challengeAccountId));
      return {
        accountId: String(r.challengeAccountId),
        user: a?.user,
        tier: a?.tier ? { id: a.tier.id, name: a.tier.name } : undefined,
        status: String(a?.status || 'PENDING').toUpperCase(),
        platform: a?.platform,
        mt5Login: a?.mt5Login,
        mt5Server: a?.mt5Server,
        cumulativePnl: safeNum(r?._sum?.pnl),
        profitTargetUsd: safeNum(a?.tier?.challengeMeta?.profitTargetUsd),
        profitTargetReached: String(a?.status || '').toUpperCase() === 'PASSED',
      };
    })
    .filter(Boolean);

  return res.json({
    totalAccounts: Number(totalAccounts || 0),
    byStatus,
    overallPnl,
    maxDailyDrawdown,
    maxDailyProfit,
    profitTargetReached: Number(passedCount || 0),
    topPerformers,
  });
};

export const createChallengePayout = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { amountUsd, txRef, notes } = req.body as { amountUsd?: number; txRef?: string; notes?: string };

  if (!id) return res.status(400).json({ message: 'Missing account id' });
  const amount = Number(amountUsd);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'amountUsd must be a positive number' });
  }

  const account = await (prisma as any).challengeAccount.findUnique({ where: { id } });
  if (!account) return res.status(404).json({ message: 'Challenge account not found' });

  const payout = await (prisma as any).challengePayout.create({
    data: {
      userId: account.userId,
      challengeAccountId: id,
      amountUsd: amount,
      txRef: txRef || null,
      notes: notes || null,
    },
  });

  await recordPayoutEvent(account.userId, { amountUsd: amount, challengeAccountId: id });
  await refreshEntitlements(account.userId);

  return res.status(201).json(payout);
};
