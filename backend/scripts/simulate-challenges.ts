import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient() as any;

type PhaseRule = {
  index: number;
  profitTargetUsd: number;
  maxDailyDrawdownUsd: number;
  maxTotalDrawdownUsd: number;
  minTradingDays?: number;
  maxDays?: number;
};

type ChallengeMeta = {
  accountSizeUsd?: number;
  profitTargetUsd?: number;
  maxDailyDrawdownUsd?: number;
  maxTotalDrawdownUsd?: number;
  variant?: 'ONE_STEP' | 'TWO_STEP' | string;
  steps?: number;
  phases?: PhaseRule[];
};

function argNumber(name: string, def: number) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return def;
  const v = Number(process.argv[idx + 1]);
  return Number.isFinite(v) ? v : def;
}

function argString(name: string, def: string) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return def;
  const v = String(process.argv[idx + 1] ?? '').trim();
  return v || def;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickWeighted<T>(rng: () => number, items: Array<{ item: T; w: number }>): T {
  const total = items.reduce((s, it) => s + it.w, 0);
  let x = rng() * total;
  for (const it of items) {
    if (x < it.w) return it.item;
    x -= it.w;
  }
  return items[items.length - 1].item;
}

function normalish(rng: () => number) {
  // Box-Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function toUtcMidnight(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function isWeekend(d: Date) {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

function randomHex(rng: () => number, len: number) {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(rng() * chars.length)];
  return out;
}

function formatMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh) return `${hh}h ${String(mm).padStart(2, '0')}m ${String(ss).padStart(2, '0')}s`;
  if (mm) return `${mm}m ${String(ss).padStart(2, '0')}s`;
  return `${ss}s`;
}

async function createManyBatched(model: any, rows: any[], batchSize: number) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    if (!chunk.length) continue;
    await model.createMany({ data: chunk, skipDuplicates: true });
  }
}

async function main() {
  const seed = argNumber('--seed', Date.now());
  const rng = mulberry32(Math.floor(seed));

  const usersCount = argNumber('--users', 200);
  const buysPerUser = argNumber('--buysPerUser', 1);
  const startDaysAgo = argNumber('--startDaysAgo', 120);
  const maxAccountsPerUser = argNumber('--maxAccountsPerUser', 3);
  const logEveryUsers = argNumber('--logEveryUsers', 100);
  const dailyInsertBatch = argNumber('--dailyInsertBatch', 2000);

  const server = argString('--mt5Server', 'promrkts-MT5');

  const now = new Date();

  const tiers = await prisma.courseTier.findMany({
    where: { productType: 'CHALLENGE' as any },
    orderBy: { price_stripe: 'asc' },
  });

  if (!tiers.length) {
    console.error('No CHALLENGE tiers found. Run seed:courses first.');
    process.exit(1);
  }

  const users = await prisma.users.findMany({
    where: { role: 'fake_user' },
    take: Math.max(1, Math.min(100000, usersCount)),
    orderBy: { created_at: 'desc' },
  });

  if (!users.length) {
    console.error('No users with role=fake_user found. Create them first (admin/fakes/users or seed scripts).');
    process.exit(1);
  }

  let createdPurchases = 0;
  let createdAccounts = 0;

  let passed = 0;
  let failed = 0;
  const failReasons: Record<string, number> = {};

  const startedAt = Date.now();

  // Preload existing account counts to avoid 1 query per user.
  const accountCountByUserId = new Map<string, number>();
  try {
    const grouped = await (prisma as any).challengeAccount.groupBy({
      by: ['userId'],
      where: { userId: { in: users.map((u: any) => u.id) } },
      _count: { _all: true },
    });
    for (const g of grouped || []) {
      accountCountByUserId.set(String(g.userId), Number(g._count?._all || 0));
    }
  } catch {
    // Fallback: do nothing (will use count query per user, slower)
  }

  console.log(
    `Simulating challenges for ${users.length.toLocaleString()} fake users (buysPerUser=${buysPerUser}, startDaysAgo=${startDaysAgo}).`
  );

  let processedUsers = 0;
  for (const user of users) {
    const existingAccounts =
      accountCountByUserId.has(user.id)
        ? (accountCountByUserId.get(user.id) as number)
        : await prisma.challengeAccount.count({ where: { userId: user.id } });
    if (existingAccounts >= maxAccountsPerUser) continue;

    const plannedBuys = Math.max(0, Math.min(buysPerUser, maxAccountsPerUser - existingAccounts));
    for (let i = 0; i < plannedBuys; i++) {
      const tier: any = pickWeighted(rng, [
        { item: tiers[0], w: 20 },
        { item: tiers[Math.min(1, tiers.length - 1)], w: 22 },
        { item: tiers[Math.min(2, tiers.length - 1)], w: 20 },
        { item: tiers[Math.min(3, tiers.length - 1)], w: 18 },
        { item: tiers[Math.min(4, tiers.length - 1)], w: 12 },
        { item: tiers[Math.min(5, tiers.length - 1)], w: 8 },
      ]);

      const purchaseDate = addDays(now, -randInt(rng, 7, startDaysAgo));

      const purchase = await prisma.purchase.create({
        data: {
          userId: user.id,
          tierId: tier.id,
          status: 'CONFIRMED',
          txnHash: `0x${randomHex(rng, 64)}`,
          finalPriceUsd: Number(tier.price_usdt || 0),
          createdAt: purchaseDate,
        },
      });
      createdPurchases++;

      const acct = await prisma.challengeAccount.create({
        data: {
          userId: user.id,
          tierId: tier.id,
          purchaseId: purchase.id,
          status: 'ACTIVE',
          platform: tier.challengePlatform || 'MT5',
          mt5Login: String(randInt(rng, 100000, 999999)),
          mt5Server: server,
          createdAt: purchaseDate,
          updatedAt: purchaseDate,
        },
      });
      createdAccounts++;

      const meta: ChallengeMeta = (tier.challengeMeta || {}) as any;
      const accountSizeUsd = Number(meta.accountSizeUsd || 10000);

      const phases: PhaseRule[] = Array.isArray(meta.phases) && meta.phases.length
        ? meta.phases.map((p) => ({
            index: Number(p.index || 1),
            profitTargetUsd: Number(p.profitTargetUsd || meta.profitTargetUsd || 0),
            maxDailyDrawdownUsd: Number(p.maxDailyDrawdownUsd || meta.maxDailyDrawdownUsd || 0),
            maxTotalDrawdownUsd: Number(p.maxTotalDrawdownUsd || meta.maxTotalDrawdownUsd || 0),
            minTradingDays: p.minTradingDays != null ? Number(p.minTradingDays) : 5,
            maxDays: p.maxDays != null ? Number(p.maxDays) : 30,
          }))
        : [
            {
              index: 1,
              profitTargetUsd: Number(meta.profitTargetUsd || 0),
              maxDailyDrawdownUsd: Number(meta.maxDailyDrawdownUsd || 0),
              maxTotalDrawdownUsd: Number(meta.maxTotalDrawdownUsd || 0),
              minTradingDays: 5,
              maxDays: 30,
            },
          ];

      // Skill distribution: most are average/poor, small tail is good.
      const skill = pickWeighted(rng, [
        { item: 'POOR', w: 55 },
        { item: 'AVERAGE', w: 35 },
        { item: 'GOOD', w: 10 },
      ]);
      // Riskiness drives volatility + crash risk.
      const risk = clamp(0.6 + Math.pow(rng(), 0.55) * 1.6, 0.5, 2.2);

      const driftPct =
        skill === 'GOOD'
          ? 0.14
          : skill === 'AVERAGE'
          ? 0.07
          : 0.02;
      const volPct = clamp(0.45 * risk + (skill === 'POOR' ? 0.25 : 0.15), 0.35, 1.4);

      // Make 2-step slightly harder overall.
      const isTwoStep = String(meta.variant || '').toUpperCase().includes('TWO');
      const passBias = isTwoStep ? 0.88 : 1.0;

      let overallResult: 'PASSED' | 'FAILED' = 'FAILED';
      let failReason = 'TIMEOUT';
      let allPhasesPassed = true;

      let date = toUtcMidnight(purchaseDate);

      // Collect daily stats in memory and bulk insert at the end for speed.
      const dailyRows: any[] = [];

      // Start balance and phase resets
      for (const phase of phases) {
        let balance = accountSizeUsd;
        let tradingDays = 0;

        const profitTarget = Number(phase.profitTargetUsd || 0);
        const dailyDD = Number(phase.maxDailyDrawdownUsd || 0);
        const totalDD = Number(phase.maxTotalDrawdownUsd || 0);
        const minDays = Math.max(1, Number(phase.minTradingDays || 5));
        const maxDays = Math.max(minDays, Number(phase.maxDays || 30));

        let passedPhase = false;

        for (let day = 0; day < maxDays; day++) {
          // Move forward to next weekday
          while (isWeekend(date)) date = addDays(date, 1);

          tradingDays++;

          // Random daily return in % (approx normal), with occasional fat-tail events.
          let ret = driftPct + normalish(rng) * volPct;

          // Fat-tail / news day
          const newsRoll = rng();
          if (newsRoll < 0.03 * risk) {
            ret += normalish(rng) * (volPct * 2.8);
          }

          // Clamp daily return to something plausible
          ret = clamp(ret, -4.5, 3.5);

          // Convert to USD pnl
          let pnl = (ret / 100) * balance;

          // Hard clamp absolute pnl by account size to avoid silly spikes
          pnl = clamp(pnl, -0.06 * accountSizeUsd, 0.06 * accountSizeUsd);

          const nextBalance = balance + pnl;

          const dayLoss = pnl < 0 ? pnl : 0;
          const dayProfit = pnl > 0 ? pnl : 0;

          // Daily DD breach
          if (dailyDD > 0 && Math.abs(dayLoss) > dailyDD * passBias) {
            failReason = 'MAX_DAILY_DD';
            dailyRows.push({
              challengeAccountId: acct.id,
              date,
              balance: nextBalance,
              equity: nextBalance,
              pnl,
              maxDailyDrawdown: dayLoss,
              maxDailyProfit: dayProfit,
              meta: { phase: phase.index, retPct: ret, risk, skill, reason: 'daily_dd' },
            });
            balance = nextBalance;
            break;
          }

          // Total DD breach
          if (totalDD > 0 && accountSizeUsd - nextBalance > totalDD * passBias) {
            failReason = 'MAX_TOTAL_DD';
            dailyRows.push({
              challengeAccountId: acct.id,
              date,
              balance: nextBalance,
              equity: nextBalance,
              pnl,
              maxDailyDrawdown: dayLoss,
              maxDailyProfit: dayProfit,
              meta: { phase: phase.index, retPct: ret, risk, skill, reason: 'total_dd' },
            });
            balance = nextBalance;
            break;
          }

          // Normal daily write
          dailyRows.push({
            challengeAccountId: acct.id,
            date,
            balance: nextBalance,
            equity: nextBalance,
            pnl,
            maxDailyDrawdown: dayLoss,
            maxDailyProfit: dayProfit,
            meta: { phase: phase.index, retPct: ret, risk, skill },
          });

          balance = nextBalance;

          const profit = balance - accountSizeUsd;
          if (profitTarget > 0 && profit >= profitTarget && tradingDays >= minDays) {
            passedPhase = true;
            // Mark a short consolidation day before next phase
            date = addDays(date, 1);
            break;
          }

          date = addDays(date, 1);
        }

        if (!passedPhase) {
          allPhasesPassed = false;
          if (failReason === 'TIMEOUT') failReason = 'TIMEOUT';
          overallResult = 'FAILED';
          break;
        }
      }

      if (allPhasesPassed) overallResult = 'PASSED';

      // Bulk insert daily stats for this account.
      if (dailyRows.length) {
        await createManyBatched((prisma as any).challengeDailyStat, dailyRows, dailyInsertBatch);
      }

      if (overallResult === 'PASSED') {
        passed++;
        await prisma.challengeAccount.update({
          where: { id: acct.id },
          data: { status: 'PASSED', updatedAt: new Date() },
        });
      } else {
        failed++;
        failReasons[failReason] = (failReasons[failReason] || 0) + 1;
        await prisma.challengeAccount.update({
          where: { id: acct.id },
          data: { status: 'FAILED', updatedAt: new Date() },
        });
      }
    }

    processedUsers++;
    if (logEveryUsers > 0 && processedUsers % logEveryUsers === 0) {
      const elapsed = Date.now() - startedAt;
      const perUser = elapsed / processedUsers;
      const remaining = (users.length - processedUsers) * perUser;
      console.log(
        `[${processedUsers.toLocaleString()}/${users.length.toLocaleString()} users] ` +
          `accounts=${createdAccounts.toLocaleString()} ` +
          `passed=${passed.toLocaleString()} failed=${failed.toLocaleString()} ` +
          `elapsed=${formatMs(elapsed)} ETA=${formatMs(remaining)}`
      );
    }
  }

  console.log('✅ Challenge simulation complete');
  console.log({
    seed,
    usersConsidered: users.length,
    createdPurchases,
    createdAccounts,
    passed,
    failed,
    failReasons,
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Simulation failed:', e);
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(1);
});
