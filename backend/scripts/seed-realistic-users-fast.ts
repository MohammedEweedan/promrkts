/* scripts/seed-mega-simulation.ts
   MEGA simulation (FAST + FK-safe):
   - 75K realistic users
   - course tier purchases + progress + activities + reviews + badges
   - token market ticks + (optional) tokenTrade + wallets + staking holdings
   - prop firm challenge purchases + accounts + daily stats (FK-safe) + pass/fail
   - monthly payouts: PASSED traders get 80% of profits for that month (credited to userWallet.usdtBalance)
*/

import { PrismaClient, PurchaseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient() as any;

// -------------------- NAME POOLS --------------------
const AR_FIRST = [
  "أحمد","اسماء","ياسمين","عائشة","فاطمة","سارة","ريان","ريما","ريم","مريم",
  "محمد","خالد","علي","يوسف","عمر","سالم","مروان","فهد","طارق","سامي","حسن","عبدالله","مصطفى","كريم",
];
const AR_LAST = [
  "الشريف","الطاهر","الشامي","مصطفى","الهاشمي","البغدادي","التائب","طلحة","محمودي","طروم",
  "بوسنينه","الدوسري","الشامري","البنغازي","المصري","ابوجراد","المسعودي","العلاقي",
];
const EN_FIRST = ["Ahmed","Mohamed","Khaled","Ali","Youssef","Omar","Salem","Marwan","Fahd","Tariq","Sami","Hassan"];
const EN_LAST = ["Al-Sharif","Al-Taher","Talha","Taroum","Bousnina","Al-Dosari","Al-Shamri","Al-Benghazi"];
const FR_FIRST = ["Ahmed","Mohamed","Youssef","Omar","Karim","Rachid","Yassine","Hicham"];
const FR_LAST = ["Bennani","El Mansouri","Haddad","El Amrani","Cherkaoui","Mansour"];

// -------------------- HELPERS --------------------
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function weightedRandom(weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return i;
    r -= weights[i];
  }
  return weights.length - 1;
}
function perTickFromDaily(dailyPct: number, dtMin: number) {
  const ticksPerDay = 1440 / dtMin;
  return dailyPct / ticksPerDay;
}

function perTickVolFromDaily(dailyVolPct: number, dtMin: number) {
  const ticksPerDay = 1440 / dtMin;
  return dailyVolPct / Math.sqrt(ticksPerDay);
}
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function addDaysUTC(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function toStartOfDayUTC(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.floor(value)));
}
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
// near helpers
const RUN_TAG = process.env.SEED_RUN_TAG || makeHex(6);

function generateEmail(firstName: string, lastName: string, index: number): string {
  const domains = ["gmail.com", "yahoo.com", "hotmail.com"];
  const cleanFirst = slugify(firstName);
  const cleanLast = slugify(lastName);
  return `${cleanFirst}.${cleanLast}.${RUN_TAG}.${index}@${randomElement(domains)}`;
}

function bigIntToNumberSafe(v: bigint) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function makeHex(len: number) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
}
function makePseudoErc20Address(): string {
  return ("0x" + crypto.randomBytes(20).toString("hex")).slice(0, 42);
}
function makePseudoTronAddress(): string {
  return ("T" + crypto.randomBytes(20).toString("hex")).slice(0, 34);
}
function isWeekendUTC(d: Date) {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}
// Box-Muller normalish
function normalish() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
function toUtcMidnight(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}
function monthKeyUTC(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function createManyBatched(model: any, rows: any[], batchSize: number) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    if (!chunk.length) continue;
    await model.createMany({ data: chunk, skipDuplicates: true });
  }
}

function hasModel(name: string) {
  return Boolean((prisma as any)[name] && typeof (prisma as any)[name].createMany === "function");
}

async function createUsersAndReturn(data: any[]) {
  if (typeof prisma.users.createManyAndReturn === "function") {
    return prisma.users.createManyAndReturn({
      data,
      skipDuplicates: true,
      select: { id: true, name: true, email: true, created_at: true, last_login: true },
    });
  }

  await prisma.users.createMany({ data, skipDuplicates: true });
  const emails = data.map((u) => u.email);
  return prisma.users.findMany({
    where: { email: { in: emails } },
    select: { id: true, name: true, email: true, created_at: true, last_login: true },
  });
}

// -------------------- TOKEN SIM CONFIG --------------------
const TOKEN_SALE_ID = 1;
const TOKEN_SYMBOL = process.env.TOKEN_SALE_SYMBOL || "PMKX";
const TOKEN_TOTAL_SUPPLY = BigInt(process.env.TOKEN_SALE_TOTAL_SUPPLY || "20000000000");
const TOKEN_BASE_PRICE = Number(process.env.TOKEN_SALE_PRICE_USDT || "0.10");

type TokenPersona = "WHALE" | "ACTIVE" | "CASUAL" | "HODLER";
function pickTokenPersona(): TokenPersona {
  const x = Math.random();
  if (x < 0.05) return "WHALE";
  if (x < 0.25) return "ACTIVE";
  if (x < 0.60) return "CASUAL";
  return "HODLER";
}
function nextPrice(prev: number) {
  const drift = 0.0015;
  const noise = normalish() * 0.01;
  const p = prev * (1 + drift + noise);
  return Math.max(0.001, Math.min(10, p));
}

// -------------------- MARKET SIM (REALISTIC) --------------------
type MarketRegime = "BULL" | "BEAR" | "RANGE" | "VOLATILE";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function pct(n: number) {
  return n / 100;
}

// Create swing points; compute fib levels (0.618 + 0.55) from swing high/low
function fibLevelsFromSwing(low: number, high: number) {
  const range = high - low;
  const r618 = high - range * 0.618;
  const r55  = high - range * 0.55;
  return { r618, r55, low, high };
}

// Magnet effect: when price is near a level, it gets "pulled" toward it,
// with a bounce probability that creates believable reactions.
function applyLevelMagnet(price: number, level: number, strength: number) {
  const dist = (price - level) / Math.max(level, 1e-9);
  const near = Math.abs(dist) < 0.012; // within 1.2%
  if (!near) return price;

  // Pull toward the level + occasional bounce
  const pull = -dist * strength; // reduces distance
  const bounce = (Math.random() < 0.35) ? (dist > 0 ? +1 : -1) * strength * 0.35 : 0;

  return price * (1 + pull + bounce);
}

// Build dynamic support/resistance bands from recent prices.
// This is cheap and good enough for seed realism.
function computeBands(prices: number[]) {
  if (prices.length < 20) {
    const p = prices[prices.length - 1] || 0.1;
    return { support: [p * 0.92], resistance: [p * 1.08] };
  }
  const slice = prices.slice(-200);
  const sorted = [...slice].sort((a, b) => a - b);
  const q = (x: number) => sorted[Math.floor((sorted.length - 1) * x)];

  // 20th percentile ~ support, 80th percentile ~ resistance
  const s1 = q(0.20);
  const s2 = q(0.30);
  const r1 = q(0.80);
  const r2 = q(0.90);

  return { support: [s1, s2], resistance: [r1, r2] };
}

// Market step = trend + noise + order flow impact + level reactions
function nextMarketPrice(args: {
  prev: number;
  regime: MarketRegime;
  netFlowUsdt: number; // net buys in USDT this tick (buys - sells)
  liquidityUsdt: number; // bigger => less impact
  pricesWindow: number[];
  swingLow: number;
  swingHigh: number;
}) {
  const { prev, regime, netFlowUsdt, liquidityUsdt, pricesWindow } = args;

  const dtMin = 1; // if TICK_MS = 60_000

  const dailyDrift =
    regime === "BULL" ? 0.25 :
    regime === "BEAR" ? -0.20 :
    regime === "VOLATILE" ? 0.00 :
    0.05;

  const dailyVol =
    regime === "BULL" ? 2.0 :
    regime === "BEAR" ? 2.6 :
    regime === "VOLATILE" ? 4.5 :
    1.2;

  const drift = perTickFromDaily(dailyDrift, dtMin);          // % per tick
  const sigma = perTickVolFromDaily(dailyVol, dtMin);         // % per tick
  const noise = normalish() * sigma;                          // % per tick

  // Volatility by regime
  const vol =
    regime === "BULL" ? 1.3 :
    regime === "BEAR" ? 1.6 :
    regime === "VOLATILE" ? 2.6 :
    0.9;

  // Normal-ish noise

  // Order flow impact (square-root impact)
  const flow = netFlowUsdt / Math.max(liquidityUsdt, 1);
  const impact = Math.sign(flow) * Math.sqrt(Math.abs(flow)) * 2.25; // tuned

  // Base move (%)
  let movePct = pct(drift + noise + impact);

  // Soft clamp extreme candles
  movePct = clamp(movePct, -0.18, 0.18);

  let p = prev * (1 + movePct);

  // Dynamic levels
  const bands = computeBands(pricesWindow);
  const swingLow = args.swingLow;
  const swingHigh = args.swingHigh;
  const fib = fibLevelsFromSwing(swingLow, swingHigh);

  // Apply fib magnets
  p = applyLevelMagnet(p, fib.r618, 0.006);
  p = applyLevelMagnet(p, fib.r55, 0.005);

  // Apply support/resistance magnets
  for (const s of bands.support) p = applyLevelMagnet(p, s, 0.0045);
  for (const r of bands.resistance) p = applyLevelMagnet(p, r, 0.0045);

  // Hard bounds (no nonsense)
  p = clamp(p, 0.001, 50);

  return { price: p, bands, fib };
}

async function ensureTokenSale() {
  if (!hasModel("tokenSale")) return null;

  let sale = await prisma.tokenSale.findUnique({ where: { id: TOKEN_SALE_ID } });
  if (!sale) {
    sale = await prisma.tokenSale.create({
      data: {
        id: TOKEN_SALE_ID,
        symbol: TOKEN_SYMBOL,
        totalSupply: TOKEN_TOTAL_SUPPLY,
        soldSupply: BigInt(0),
        priceUsdtPerTok: TOKEN_BASE_PRICE,
        profitSharePct: Number(process.env.TOKEN_SALE_PROFIT_SHARE_PCT || "0.10"),
        active: process.env.TOKEN_SALE_ACTIVE === "false" ? false : true,
        basePriceUsdt: TOKEN_BASE_PRICE,
        curveK: 2.0,
        demandK: 0.5,
        targetTokensPerMin: 100_000,
        targetBuysPerMin: 1.0,
      } as any,
    });
  }
  return sale;
}

// -------------------- CHALLENGE SIM TYPES --------------------
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
  variant?: "ONE_STEP" | "TWO_STEP" | string;
  steps?: number;
  phases?: PhaseRule[];
};

function pickWeighted<T>(items: Array<{ item: T; w: number }>): T {
  const total = items.reduce((s, it) => s + it.w, 0);
  let x = Math.random() * total;
  for (const it of items) {
    if (x < it.w) return it.item;
    x -= it.w;
  }
  return items[items.length - 1].item;
}

// -------------------- MAIN --------------------
async function main() {
  console.log("🚀 Starting MEGA simulation seed...\n");

  const now = new Date();

  // ---------- Preload tiers ----------
  const tiersAll = await prisma.courseTier.findMany();
  if (!tiersAll.length) {
    console.error("❌ No course tiers found.");
    process.exit(1);
  }

  const tierByName = new Map<string, any>();
  for (const t of tiersAll) tierByName.set(String(t.name).toLowerCase(), t);

  const tierFree = tierByName.get("free") || tiersAll[0];
  const tierPro = tierByName.get("pro");
  const tierMaster = tierByName.get("master");
  const tierElite = tierByName.get("elite");

  console.log(`📚 Found ${tiersAll.length} course tiers`);

  // ---------- Challenge tiers ----------
  const challengeTiers = await prisma.courseTier.findMany({
    where: { productType: "CHALLENGE" as any },
    orderBy: { price_stripe: "asc" },
  });
  console.log(`🏁 Found ${challengeTiers.length} CHALLENGE tiers`);

  // ---------- Badges ----------
  const badgeDefinitions = [
    { key: "first_10_lessons", name: "First 10 Lessons", description: "Completed 10 lessons", category: "MILESTONE", unlockCriteria: { type: "lessons_completed", count: 10 } },
    { key: "lesson_master", name: "Lesson Master", description: "Completed 25+ lessons", category: "MILESTONE", unlockCriteria: { type: "lessons_completed", count: 25 } },
    { key: "week_streak", name: "Week Streak", description: "7 day streak", category: "STREAK", unlockCriteria: { type: "streak", days: 7 } },
    { key: "month_streak", name: "Month Streak", description: "30 day streak", category: "STREAK", unlockCriteria: { type: "streak", days: 30 } },
    { key: "xp_5k", name: "5K XP", description: "Earned 5,000 XP", category: "MILESTONE", unlockCriteria: { type: "xp_earned", amount: 5000 } },
    { key: "xp_10k", name: "10K XP", description: "Earned 10,000 XP", category: "MILESTONE", unlockCriteria: { type: "xp_earned", amount: 10000 } },
    { key: "level_5", name: "Level 5", description: "Reached level 5", category: "MILESTONE", unlockCriteria: { type: "level_reached", level: 5 } },
    { key: "level_10", name: "Level 10", description: "Reached level 10", category: "MILESTONE", unlockCriteria: { type: "level_reached", level: 10 } },
  ];

  const badgeMap: Record<string, string> = {};
  if (hasModel("badge")) {
    for (const def of badgeDefinitions) {
      let badge = await prisma.badge.findFirst({ where: { name: def.name } });
      if (!badge) {
        badge = await prisma.badge.create({
          data: {
            name: def.name,
            description: def.description,
            category: def.category,
            unlockCriteria: def.unlockCriteria,
            rarity: "common",
          },
        });
      }
      badgeMap[def.key] = badge.id;
    }
  }
  console.log(`📛 Badge types ready: ${Object.keys(badgeMap).length}`);

  // ---------- Token sale init ----------
  const sale = await ensureTokenSale();
  if (sale) console.log(`🪙 Token sale ready: ${sale.symbol} total=${String(sale.totalSupply)}`);

  const hashedPassword = await bcrypt.hash("Test123!", 10);

  const BATCH_SIZE = 1000;
  const TOTAL_USERS = 100_000;
  const batches = Math.ceil(TOTAL_USERS / BATCH_SIZE);

  // stats
  let totalCreated = 0;
  let totalPurchases = 0;
  let totalProgress = 0;
  let totalActivities = 0;
  let totalReviews = 0;
  let totalBadges = 0;

  let totalWallets = 0;
  let totalTokenTrades = 0;
  let totalTokenTicks = 0;
  let totalTokenHoldingsRows = 0;

  let totalChallengePurchases = 0;
  let totalChallengeAccounts = 0;
  let totalChallengeDaily = 0;
  let totalChallengePassed = 0;
  let totalChallengeFailed = 0;
  let totalPayouts = 0;

  // token market rolling price
  let rollingPrice = sale?.priceUsdtPerTok ?? TOKEN_BASE_PRICE;
  let soldDeltaAll = BigInt(0);

  const registrationWeights = [1,2,3,5,8,13,21,34,55,89,144,233];

  // Capability flags
  const canWallet = hasModel("userWallet");
  const canHolding = hasModel("userTokenHolding");
  const canAddr = hasModel("walletAddress");
  const canTicks = hasModel("tokenPriceTick");
  const canTrade = hasModel("tokenTrade"); // optional table
  const canStudentProgress = hasModel("studentProgress");
  const canDailyActivity = hasModel("dailyActivity");
  const canCourseReview = hasModel("courseReview");
  const canUserBadge = hasModel("userBadge");
  const canTokenTrade = hasModel("tokenTrade");
  const canChallenge = challengeTiers.length && hasModel("challengeAccount") && hasModel("challengeDailyStat") && hasModel("purchase");

  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL_USERS - totalCreated);
    console.log(`\n📦 Batch ${batch + 1}/${batches} (${batchSize} users)...`);

    // ---------- Create users ----------
    const batchUsers: any[] = [];
    for (let i = 0; i < batchSize; i++) {
      const userIndex = totalCreated + i;
      const localeRand = Math.random();
      const locale = localeRand < 0.6 ? "ar" : localeRand < 0.85 ? "en" : "fr";

      let firstName: string, lastName: string;
      if (locale === "ar") { firstName = randomElement(AR_FIRST); lastName = randomElement(AR_LAST); }
      else if (locale === "en") { firstName = randomElement(EN_FIRST); lastName = randomElement(EN_LAST); }
      else { firstName = randomElement(FR_FIRST); lastName = randomElement(FR_LAST); }

      const monthsAgo = weightedRandom(registrationWeights);
      const createdAt = randomDate(
        new Date(Date.now() - (monthsAgo + 1) * 30 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000)
      );

      const isActive = Math.random() < 0.78;
      const lastLogin = isActive
        ? randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), now)
        : randomDate(createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      batchUsers.push({
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, userIndex),
        password: hashedPassword,
        phone: Math.random() < 0.5 ? `+218${randomInt(100000000, 999999999)}` : null,
        role: "fake_user",
        status: "active",
        created_at: createdAt,
        last_login: lastLogin,
        cart: [] as any,
      });
    }

    const createdUsers = await createUsersAndReturn(batchUsers);
    totalCreated += createdUsers.length;

    // ---------- Course purchases ----------
    const allPurchases: any[] = [];
    const purchasePlansByUserId = new Map<string, Array<{ tier: any; status: PurchaseStatus; purchaseDate: Date; finalPriceUsd: number | null }>>();

    for (const user of createdUsers) {
      const pathIndex = weightedRandom([35,45,12,6,2]);
      const plan: Array<{ tier: any; status: PurchaseStatus; purchaseDate: Date; finalPriceUsd: number | null }> = [];

      const freeDate = randomDate(new Date(user.created_at), addDaysUTC(new Date(user.created_at), 7));
      if (tierFree) plan.push({ tier: tierFree, status: PurchaseStatus.CONFIRMED, purchaseDate: freeDate, finalPriceUsd: 0 });

      const firstPaidDelay = randomInt(3, 90);
      const upgradeDelay = randomInt(20, 180);
      const proDate = addDaysUTC(freeDate, firstPaidDelay);
      const masterDate = addDaysUTC(proDate, upgradeDelay);
      const eliteDate = addDaysUTC(proDate, upgradeDelay);

      const addPaid = (tier: any, purchaseDate: Date) => {
        if (!tier) return;
        const status = Math.random() < 0.965 ? PurchaseStatus.CONFIRMED : PurchaseStatus.PENDING;
        const discount = Math.random() < 0.22 ? randomFloat(0.8, 0.95) : randomFloat(0.95, 1.0);
        const finalPriceUsd = tier.price_usdt ? Number((tier.price_usdt * discount).toFixed(2)) : 0;
        plan.push({ tier, status, purchaseDate: purchaseDate < now ? purchaseDate : now, finalPriceUsd });
      };

      if (pathIndex === 1) addPaid(tierPro, proDate);
      else if (pathIndex === 2) { addPaid(tierPro, proDate); addPaid(tierMaster, masterDate); }
      else if (pathIndex === 3) { addPaid(tierPro, proDate); addPaid(tierElite, eliteDate); }
      else if (pathIndex === 4) addPaid(tierMaster, proDate);

      plan.sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime());
      purchasePlansByUserId.set(user.id, plan);

      for (const entry of plan) {
        allPurchases.push({
          userId: user.id,
          tierId: entry.tier.id,
          status: entry.status,
          txnHash: entry.status === PurchaseStatus.CONFIRMED ? `0x${makeHex(64)}` : null,
          createdAt: entry.purchaseDate,
          finalPriceUsd: entry.finalPriceUsd,
        });
      }
    }

    if (allPurchases.length) {
      await prisma.purchase.createMany({ data: allPurchases, skipDuplicates: true });
      totalPurchases += allPurchases.length;
    }

    // ---------- Progress, activities, reviews, badges ----------
    const allProgress: any[] = [];
    const allActivities: any[] = [];
    const allReviews: any[] = [];
    const allBadgesRows: any[] = [];

    for (const user of createdUsers) {
      const plan = purchasePlansByUserId.get(user.id) || [];
      if (!plan.length) continue;

      const personaIndex = weightedRandom([12,28,34,18,8]); // 0..4

      for (const entry of plan) {
        if (entry.status !== PurchaseStatus.CONFIRMED) continue;

        const purchaseDate = entry.purchaseDate;
        const daysSincePurchase = clampInt((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24), 0, 730);

        const activeDaysCap = personaIndex === 0 ? 45 : personaIndex === 1 ? 30 : personaIndex === 2 ? 18 : personaIndex === 3 ? 8 : 2;
        const activeDays = clampInt(randomInt(0, Math.min(activeDaysCap, Math.max(2, Math.floor(daysSincePurchase)))), 0, activeDaysCap);

        const streakChance = personaIndex <= 1 ? 0.35 : personaIndex === 2 ? 0.18 : 0.08;
        const streak = Math.random() < streakChance
          ? clampInt(randomInt(2, personaIndex === 0 ? 45 : personaIndex === 1 ? 21 : 10), 1, 60)
          : 0;

        const lastActiveDate = streak > 0
          ? randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), now)
          : (activeDays > 0 ? randomDate(purchaseDate, now) : null);

        const activityByDayKey = new Map<string, any>();
        const activityWindowStart = purchaseDate;
        const activityWindowEnd = lastActiveDate || now;

        for (let i = 0; i < activeDays; i++) {
          const d = toStartOfDayUTC(randomDate(activityWindowStart, activityWindowEnd));
          const key = d.toISOString().slice(0, 10);
          if (activityByDayKey.has(key)) continue;
          activityByDayKey.set(key, { userId: user.id, activityDate: d, lessonsCompleted: 0, videosWatched: 0, pdfsViewed: 0, timeSpent: 0, xpEarned: 0 });
        }

        if (streak > 0 && lastActiveDate) {
          for (let s = 0; s < streak; s++) {
            const d = toStartOfDayUTC(addDaysUTC(lastActiveDate, -s));
            if (d < toStartOfDayUTC(purchaseDate)) break;
            const key = d.toISOString().slice(0, 10);
            if (!activityByDayKey.has(key)) {
              activityByDayKey.set(key, { userId: user.id, activityDate: d, lessonsCompleted: 0, videosWatched: 0, pdfsViewed: 0, timeSpent: 0, xpEarned: 0 });
            }
          }
        }

        let lessonsCompleted = 0;
        let videosWatched = 0;
        let pdfsViewed = 0;
        let xp = 0;

        for (const row of activityByDayKey.values()) {
          const intensity = personaIndex === 0 ? 3 : personaIndex === 1 ? 2 : personaIndex === 2 ? 1 : 0;
          const lessons = clampInt(randomInt(0, intensity + 2), 0, 6);
          const videos = clampInt(randomInt(0, intensity + 1), 0, 4);
          const pdfs = clampInt(randomInt(0, Math.max(0, intensity)), 0, 3);
          const timeSpent = clampInt(lessons * randomInt(600, 1800) + videos * randomInt(300, 1500) + pdfs * randomInt(180, 900), 300, 7200);
          const xpEarned = clampInt(lessons * randomInt(80, 180) + videos * randomInt(40, 120) + pdfs * randomInt(20, 80), 20, 900);

          row.lessonsCompleted = lessons;
          row.videosWatched = videos;
          row.pdfsViewed = pdfs;
          row.timeSpent = timeSpent;
          row.xpEarned = xpEarned;

          lessonsCompleted += lessons;
          videosWatched += videos;
          pdfsViewed += pdfs;
          xp += xpEarned;
        }

        xp += randomInt(0, String(entry.tier.name || "").toLowerCase() === "free" ? 250 : 900);

        const level = Math.floor(xp / 1000) + 1;
        const isCompleted = lessonsCompleted >= (String(entry.tier.name || "").toLowerCase() === "free" ? 12 : 30) && Math.random() < 0.22;
        const completedAt = isCompleted ? randomDate(purchaseDate, activityWindowEnd) : null;

        allProgress.push({
          userId: user.id,
          tierId: entry.tier.id,
          lessonsCompleted,
          videosWatched,
          pdfsViewed,
          level,
          xp,
          streak,
          lastActiveDate: lastActiveDate || null,
          completedAt,
          certificateIssued: Boolean(isCompleted && Math.random() < 0.8),
          createdAt: purchaseDate,
          updatedAt: lastActiveDate || now,
        });

        for (const row of activityByDayKey.values()) allActivities.push(row);

        const reviewChance = lessonsCompleted >= 6 ? (personaIndex <= 1 ? 0.22 : personaIndex === 2 ? 0.14 : 0.06) : 0;
        if (Math.random() < reviewChance && canCourseReview) {
          const rating = Math.random() < 0.72 ? randomInt(4, 5) : randomInt(3, 5);
          const comments = {
            ar: ["دورة ممتازة","محتوى جيد","تعلمت الكثير","شرح واضح","دورة رائعة"],
            en: ["Great course!","Very helpful","Learned a lot","Clear explanations","Highly recommend"],
            fr: ["Excellent cours","Très utile","Bien expliqué","Je recommande","Contenu de qualité"],
          };
          const locale = user.name.match(/[\u0600-\u06FF]/) ? "ar" : user.name.match(/[éèêëàâäôöûüç]/i) ? "fr" : "en";

          allReviews.push({
            tierId: entry.tier.id,
            userId: user.id,
            rating,
            comment: Math.random() < 0.75 ? randomElement(comments[locale as keyof typeof comments]) : null,
            created_at: randomDate(purchaseDate, activityWindowEnd),
          });
        }

        if (canUserBadge && Object.keys(badgeMap).length) {
          const badges: string[] = [];
          if (lessonsCompleted >= 10) badges.push("first_10_lessons");
          if (lessonsCompleted >= 25) badges.push("lesson_master");
          if (streak >= 7) badges.push("week_streak");
          if (streak >= 30) badges.push("month_streak");
          if (xp >= 5000) badges.push("xp_5k");
          if (xp >= 10000) badges.push("xp_10k");
          if (level >= 5) badges.push("level_5");
          if (level >= 10) badges.push("level_10");

          for (const badgeType of badges) {
            const badgeId = badgeMap[badgeType];
            if (!badgeId) continue;
            allBadgesRows.push({
              userId: user.id,
              badgeId,
              unlockedAt: randomDate(purchaseDate, activityWindowEnd),
            });
          }
        }
      }
    }

    if (allProgress.length && canStudentProgress) {
      await prisma.studentProgress.createMany({ data: allProgress, skipDuplicates: true });
      totalProgress += allProgress.length;
    }
    if (allActivities.length && canDailyActivity) {
      await prisma.dailyActivity.createMany({ data: allActivities, skipDuplicates: true });
      totalActivities += allActivities.length;
    }
    if (allReviews.length && canCourseReview) {
      await prisma.courseReview.createMany({ data: allReviews, skipDuplicates: true });
      totalReviews += allReviews.length;
    }
    if (allBadgesRows.length && canUserBadge) {
      await prisma.userBadge.createMany({ data: allBadgesRows, skipDuplicates: true });
      totalBadges += allBadgesRows.length;
    }

    // ---------- TOKEN SIM (FK-safe, REALISTIC MARKET) ----------
    const walletRows: any[] = [];
    const holdingRows: any[] = [];
    const depositAddrRows: any[] = [];
    const tokenTradeRows: any[] = [];
    const tokenTickRows: any[] = [];

    let soldDeltaBatch = BigInt(0);

    // Keep a rolling window for bands
    const priceWindow: number[] = [];
    let regime: MarketRegime = "BULL";
    let regimeTicksLeft = randomInt(600, 6000); // ~10h to ~4d if 1m ticks

    function stepRegime() {
      regimeTicksLeft--;
      if (regimeTicksLeft > 0) return;

      regime =
        Math.random() < 0.40 ? "BULL" :
        Math.random() < 0.30 ? "BEAR" :
        Math.random() < 0.15 ? "VOLATILE" :
        "RANGE";

      regimeTicksLeft =
        regime === "BULL" ? randomInt(2000, 12000) :
        regime === "BEAR" ? randomInt(1500, 9000) :
        regime === "VOLATILE" ? randomInt(300, 2500) :
        randomInt(800, 5000);
    }

    // Swing anchors for fib (simulate big move then retrace)
    let swingLow = Math.max(0.02, rollingPrice * randomFloat(0.55, 0.85));
    let swingHigh = rollingPrice * randomFloat(1.10, 1.60);

    // If your chart needs base ticks even if users are inactive:

    // Liquidity baseline (higher = less impact). You can tie this to supply later.
    let liquidityUsdt = randomFloat(250_000, 2_500_000);

    function remainingSupply(): bigint {
      const sold = (sale?.soldSupply ?? BigInt(0)) + soldDeltaAll;
      const rem = TOKEN_TOTAL_SUPPLY - sold;
      return rem > BigInt(0) ? rem : BigInt(0);
    }

    function liquidityFromMarket(circSupply: bigint, price: number, regime: MarketRegime) {
      const mcap = Number(circSupply) * price; // USDT
      const liqPct =
        regime === "VOLATILE" ? 0.004 :
        regime === "BEAR" ? 0.006 :
        regime === "BULL" ? 0.010 :
        0.008; // 0.4% - 1.0% of mcap as "effective" liquidity

      return clamp(mcap * liqPct, 75_000, 8_000_000);
    }

    function capBuyToRemaining(tok: bigint) {
      const rem = remainingSupply();
      return tok > rem ? rem : tok;
    }

    const TICK_MS = 60_000; // 1m (or 5m = 300_000)
    const baseTicks = canTicks ? 600 : 0; // last 10 hours of 1m candles (600)

    const tickEnd = new Date();
    const tickStart = new Date(tickEnd.getTime() - baseTicks * TICK_MS);
    const tradeTime = randomDate(tickStart, tickEnd);

    for (let k = 0; k < baseTicks; k++) {
    const t = new Date(tickStart.getTime() + k * TICK_MS);
      // Occasionally change regime (creates cycles)
      if (Math.random() < 0.04) {
        regime =
          Math.random() < 0.45 ? "BULL" :
          Math.random() < 0.25 ? "BEAR" :
          Math.random() < 0.15 ? "VOLATILE" :
          "RANGE";

        // reset swing points sometimes
        if (Math.random() < 0.5) {
          swingLow = Math.max(0.005, rollingPrice * randomFloat(0.60, 0.92));
          swingHigh = rollingPrice * randomFloat(1.08, 1.55);
        }
      }

      // Synthetic crowd flow (small)
      const netFlowUsdt = normalish() * randomFloat(5_000, 90_000);

      const step = nextMarketPrice({
        prev: rollingPrice,
        regime,
        netFlowUsdt,
        liquidityUsdt,
        pricesWindow: priceWindow.length ? priceWindow : [rollingPrice],
        swingLow,
        swingHigh,
      });

      rollingPrice = step.price;
      priceWindow.push(rollingPrice);
      if (priceWindow.length > 800) priceWindow.shift();

      // fake volume
      const volumeTokens = BigInt(randomInt(10_000, 400_000));
      const volumeUsdt = Number((Number(volumeTokens) * rollingPrice).toFixed(2));

      tokenTickRows.push({
        saleId: TOKEN_SALE_ID,
        t,
        price: rollingPrice,
        volumeTokens,
        volumeUsdt,
        soldSupply: (sale?.soldSupply ?? BigInt(0)) + soldDeltaAll,
        meta: {
          regime,
          fib: { r618: step.fib.r618, r55: step.fib.r55, low: step.fib.low, high: step.fib.high },
          support: step.bands.support,
          resistance: step.bands.resistance,
          liquidityUsdt,
        },
      });
    }

    // --- per-user trading simulation (order-flow driven) ---
    for (const user of createdUsers) {
      if (!canWallet) break;

      // Persona mix (adds real market structure)
      const x = Math.random();
      const persona =
        x < 0.03 ? "WHALE" :
        x < 0.18 ? "SWING_TRADER" :
        x < 0.33 ? "DAY_TRADER" :
        x < 0.63 ? "HODLER" :
        x < 0.85 ? "CASUAL" :
        "INACTIVE";

      // Big wallet distribution with whales into millions
      const usdtSeed =
        persona === "WHALE" ? randomFloat(200_000, 5_000_000) :
        persona === "SWING_TRADER" ? randomFloat(10_000, 250_000) :
        persona === "DAY_TRADER" ? randomFloat(1_500, 50_000) :
        persona === "HODLER" ? randomFloat(200, 20_000) :
        persona === "CASUAL" ? randomFloat(0, 2_000) :
        randomFloat(0, 250);

      let usdtBalance = Number(usdtSeed.toFixed(2));
      let pmkxBalance = BigInt(0);
      let staked = BigInt(0);
      let dividendsDisabled = false;

      const willLink = Math.random() < (persona === "WHALE" ? 0.85 : persona === "SWING_TRADER" ? 0.65 : 0.30);
      const usdtNetwork = Math.random() < 0.6 ? "TRC20" : "ERC20";
      const usdtAddress = willLink ? (usdtNetwork === "ERC20" ? makePseudoErc20Address() : makePseudoTronAddress()) : null;

      // How active this user is (more for traders)
      const actions =
        persona === "WHALE" ? randomInt(6, 22) :
        persona === "SWING_TRADER" ? randomInt(6, 26) :
        persona === "DAY_TRADER" ? randomInt(8, 40) :
        persona === "HODLER" ? randomInt(1, 8) :
        persona === "CASUAL" ? randomInt(0, 5) :
        randomInt(0, 2);

      // Track cost basis for "profit taking"
      let avgCost = rollingPrice * randomFloat(0.85, 1.15); // seed
      let totalBoughtTok = BigInt(0);

      // Create a local fib snapshot to guide trader behavior
      const fibNow = fibLevelsFromSwing(swingLow, swingHigh);

      for (let a = 0; a < actions; a++) {
        // If supply is out, no more buys (only sells / trades)
        const rem = remainingSupply();

        // Traders react to levels:
        // - buy dips near fib/support
        // - sell into resistance / after profit
        const near618 = Math.abs((rollingPrice - fibNow.r618) / fibNow.r618) < 0.015;
        const near55  = Math.abs((rollingPrice - fibNow.r55) / fibNow.r55) < 0.015;

        const bands = computeBands(priceWindow.length ? priceWindow : [rollingPrice]);
        const nearSupport = bands.support.some((s) => Math.abs((rollingPrice - s) / s) < 0.015);
        const nearRes = bands.resistance.some((r) => Math.abs((rollingPrice - r) / r) < 0.015);

        const wantBuy =
          (persona === "HODLER" && Math.random() < 0.55) ||
          (persona === "CASUAL" && Math.random() < 0.35) ||
          (persona === "SWING_TRADER" && (near618 || near55 || nearSupport || Math.random() < 0.25)) ||
          (persona === "DAY_TRADER" && (nearSupport || Math.random() < 0.45)) ||
          (persona === "WHALE" && Math.random() < 0.60);

        const wantSell =
          pmkxBalance > BigInt(0) &&
          (
            (persona === "DAY_TRADER" && (nearRes || rollingPrice > avgCost * 1.03 || Math.random() < 0.35)) ||
            (persona === "SWING_TRADER" && (nearRes || rollingPrice > avgCost * 1.10 || Math.random() < 0.20)) ||
            (persona === "WHALE" && (rollingPrice > avgCost * 1.25 || Math.random() < 0.10)) ||
            (persona === "CASUAL" && (rollingPrice > avgCost * 1.15 && Math.random() < 0.40))
          );

        // Small regime shifts caused by whales (realistic)
        if (persona === "WHALE" && Math.random() < 0.08) {
          regime = Math.random() < 0.5 ? "VOLATILE" : regime;
          liquidityUsdt = clamp(liquidityUsdt + randomFloat(-250_000, 250_000), 150_000, 5_000_000);
        }

        // BUY (primary sale + market buy)
        if (wantBuy && usdtBalance > 25 && rem > BigInt(0)) {
          const spend =
            persona === "WHALE" ? randomFloat(5_000, 150_000) :
            persona === "SWING_TRADER" ? randomFloat(500, 20_000) :
            persona === "DAY_TRADER" ? randomFloat(150, 7_500) :
            persona === "HODLER" ? randomFloat(50, 4_000) :
            randomFloat(25, 400);

          const canSpend = Math.min(usdtBalance, spend);
          if (canSpend < 10) continue;

          let tok = BigInt(Math.max(1, Math.floor(canSpend / rollingPrice)));
          tok = capBuyToRemaining(tok);
          if (tok <= BigInt(0)) break;

          const cost = Number((Number(tok) * rollingPrice).toFixed(2));
          if (cost <= 0 || cost > usdtBalance) continue;

          // Apply balances
          usdtBalance = Number((usdtBalance - cost).toFixed(2));
          pmkxBalance = pmkxBalance + tok;

          // update cost basis
          const bought = Number(tok);
          const newTotal = Number(totalBoughtTok + tok);
          if (newTotal > 0) {
            avgCost = (avgCost * Number(totalBoughtTok) + rollingPrice * bought) / newTotal;
            totalBoughtTok = totalBoughtTok + tok;
          }

          soldDeltaBatch += tok;
          soldDeltaAll += tok;

          // Order-flow impacts the next price step
          const netFlowUsdt = +cost;

          const step = nextMarketPrice({
            prev: rollingPrice,
            regime,
            netFlowUsdt,
            liquidityUsdt,
            pricesWindow: priceWindow.length ? priceWindow : [rollingPrice],
            swingLow,
            swingHigh,
          });

          rollingPrice = step.price;
          priceWindow.push(rollingPrice);
          if (priceWindow.length > 800) priceWindow.shift();

          if (canTokenTrade) {
            tokenTradeRows.push({
              userId: user.id,
              saleId: TOKEN_SALE_ID,
              side: "BUY",
              price: rollingPrice,   // or the pre-impact price if you prefer
              tokens: tok,
              usdt: cost,
              createdAt: tradeTime, // better: tie to tick time if you have it
              meta: { persona, reason: near618 ? "fib_618" : near55 ? "fib_55" : nearSupport ? "support" : "flow" },
            });
          }

          if (canTicks) {
            tokenTickRows.push({
              saleId: TOKEN_SALE_ID,
              t: new Date(),
              price: rollingPrice,
              volumeTokens: tok,
              volumeUsdt: cost,
              soldSupply: (sale?.soldSupply ?? BigInt(0)) + soldDeltaAll,
              meta: {
                regime,
                fib: { r618: step.fib.r618, r55: step.fib.r55, low: step.fib.low, high: step.fib.high },
                support: step.bands.support,
                resistance: step.bands.resistance,
                liquidityUsdt,
                flowUsdt: netFlowUsdt,
              },
            });
          }

          totalTokenTrades++;
          continue;
        }

        // SELL (profit taking / resistance)
        if (wantSell) {
          const balNum = Number(pmkxBalance);
          if (balNum <= 0) continue;

          const sellPct =
            persona === "WHALE" ? randomFloat(0.01, 0.08) :
            persona === "SWING_TRADER" ? randomFloat(0.05, 0.30) :
            persona === "DAY_TRADER" ? randomFloat(0.08, 0.45) :
            randomFloat(0.10, 0.35);

          let tok = BigInt(Math.max(1, Math.floor(balNum * sellPct)));
          if (tok <= BigInt(0) || tok > pmkxBalance) tok = pmkxBalance;
          if (tok <= BigInt(0)) continue;

          const receive = Number((Number(tok) * rollingPrice).toFixed(2));
          pmkxBalance = pmkxBalance - tok;
          usdtBalance = Number((usdtBalance + receive).toFixed(2));

          const netFlowUsdt = -receive;

          const step = nextMarketPrice({
            prev: rollingPrice,
            regime,
            netFlowUsdt,
            liquidityUsdt,
            pricesWindow: priceWindow.length ? priceWindow : [rollingPrice],
            swingLow,
            swingHigh,
          });

          rollingPrice = step.price;
          priceWindow.push(rollingPrice);
          if (priceWindow.length > 800) priceWindow.shift();

          if (canTokenTrade) {
            tokenTradeRows.push({
              userId: user.id,
              saleId: TOKEN_SALE_ID,
              side: "SELL",
              price: rollingPrice,
              tokens: tok,
              usdt: receive,
              createdAt: tradeTime,
              meta: { persona, reason: nearRes ? "resistance" : "profit" },
            });
          }

          if (canTicks) {
            tokenTickRows.push({
              saleId: TOKEN_SALE_ID,
              t: new Date(),
              price: rollingPrice,
              volumeTokens: tok,
              volumeUsdt: receive,
              soldSupply: (sale?.soldSupply ?? BigInt(0)) + soldDeltaAll,
              meta: {
                regime,
                fib: { r618: step.fib.r618, r55: step.fib.r55, low: step.fib.low, high: step.fib.high },
                support: step.bands.support,
                resistance: step.bands.resistance,
                liquidityUsdt,
                flowUsdt: netFlowUsdt,
              },
            });
          }

          totalTokenTrades++;
          continue;
        }

        // STAKE (holders + some whales)
        if (canHolding && (persona === "HODLER" || persona === "WHALE" || persona === "CASUAL") && pmkxBalance > BigInt(0) && Math.random() < 0.45) {
          const balNum = Number(pmkxBalance);
          const stakePct =
            persona === "HODLER" ? randomFloat(0.55, 0.95) :
            persona === "WHALE" ? randomFloat(0.25, 0.70) :
            randomFloat(0.15, 0.50);

          const tok = BigInt(Math.max(1, Math.floor(balNum * stakePct)));
          if (tok > pmkxBalance) continue;

          pmkxBalance = pmkxBalance - tok;
          staked = staked + tok;
          continue;
        }

        // UNSTAKE (some impatient traders)
        if (canHolding && staked > BigInt(0) && Math.random() < (persona === "DAY_TRADER" ? 0.25 : 0.08)) {
          const stNum = Number(staked);
          const tok = BigInt(Math.max(1, Math.floor(stNum * randomFloat(0.10, 0.50))));
          if (tok > staked) continue;

          const early = Math.random() < (persona === "DAY_TRADER" ? 0.30 : 0.10);
          let receive = tok;

          if (early) {
            const fee = tok / BigInt(10);
            receive = tok - fee;
            dividendsDisabled = true;
          }

          staked = staked - tok;
          pmkxBalance = pmkxBalance + receive;
          continue;
        }
      }

      // Write wallet
      walletRows.push({
        userId: user.id,
        pmkxErc20Address: makePseudoErc20Address(),
        usdtBalance,
        pmkxBalance,
        usdtAddress,
        usdtNetwork: usdtAddress ? usdtNetwork : null,
      });

      // Deposit addresses
      if (canAddr) {
        const addrPairs = [
          { network: "ERC20", asset: "USDT", address: makePseudoErc20Address() },
          { network: "TRC20", asset: "USDT", address: makePseudoTronAddress() },
          { network: "ERC20", asset: "PMKX", address: makePseudoErc20Address() },
          { network: "TRC20", asset: "PMKX", address: makePseudoTronAddress() },
        ];
        for (const ap of addrPairs) depositAddrRows.push({ userId: user.id, ...ap });
      }

      // Staking holding
      if (canHolding && staked > BigInt(0)) {
        const lockUntil = new Date();
        lockUntil.setUTCMonth(lockUntil.getUTCMonth() + randomInt(1, 18));

        holdingRows.push({
          userId: user.id,
          balance: staked,
          lockedUntil: lockUntil,
          dividendsDisabled,
          dividendsDisabledAt: dividendsDisabled ? new Date() : null,
        });
      }
    }

    // --- If supply isn’t fully gone yet, force sell-out to whales at the end of the batch ---
    if (canWallet && remainingSupply() > BigInt(0) && Math.random() < 0.35) {
      // Create a few massive final buys (looks like FOMO + exchange listings)
      const bursts = randomInt(3, 9);
      for (let i = 0; i < bursts; i++) {
        const rem = remainingSupply();
        if (rem <= BigInt(0)) break;

        const tok = capBuyToRemaining(BigInt(Math.max(1, Math.floor(Number(rem) * randomFloat(0.03, 0.18)))));
        if (tok <= BigInt(0)) break;

        const cost = Number((Number(tok) * rollingPrice).toFixed(2));
        soldDeltaBatch += tok;
        soldDeltaAll += tok;

        const step = nextMarketPrice({
          prev: rollingPrice,
          regime: "VOLATILE",
          netFlowUsdt: +cost,
          liquidityUsdt,
          pricesWindow: priceWindow.length ? priceWindow : [rollingPrice],
          swingLow,
          swingHigh,
        });

        rollingPrice = step.price;
        priceWindow.push(rollingPrice);
        if (priceWindow.length > 800) priceWindow.shift();

        if (canTicks) {
          tokenTickRows.push({
            saleId: TOKEN_SALE_ID,
            t: new Date(),
            price: rollingPrice,
            volumeTokens: tok,
            volumeUsdt: cost,
            soldSupply: (sale?.soldSupply ?? BigInt(0)) + soldDeltaAll,
            meta: {
              regime: "VOLATILE",
              fib: { r618: step.fib.r618, r55: step.fib.r55, low: step.fib.low, high: step.fib.high },
              support: step.bands.support,
              resistance: step.bands.resistance,
              liquidityUsdt,
              flowUsdt: cost,
              reason: "final_sell_out_burst",
            },
          });
        }
      }
    }

    // Persist token sim rows
    if (walletRows.length && canWallet) {
      await prisma.userWallet.createMany({ data: walletRows, skipDuplicates: true });
      totalWallets += walletRows.length;
    }
    if (depositAddrRows.length && canAddr) {
      await prisma.walletAddress.createMany({ data: depositAddrRows, skipDuplicates: true });
    }
    if (holdingRows.length && canHolding) {
      await prisma.userTokenHolding.createMany({ data: holdingRows, skipDuplicates: true });
      totalTokenHoldingsRows += holdingRows.length;
    }
    if (tokenTradeRows.length && canTokenTrade) {
      await createManyBatched((prisma as any).tokenTrade, tokenTradeRows, 5000);
    }
    if (tokenTickRows.length && canTicks) {
      await createManyBatched((prisma as any).tokenPriceTick, tokenTickRows, 5000);
      totalTokenTicks += tokenTickRows.length;
    }

    if (sale && hasModel("tokenSale") && soldDeltaBatch > BigInt(0)) {
      await prisma.tokenSale.update({
        where: { id: TOKEN_SALE_ID },
        data: {
          soldSupply: { increment: soldDeltaBatch } as any,
          priceUsdtPerTok: rollingPrice,
        } as any,
      });
    }

    // ---------- CHALLENGE SIM (FK-safe: insert purchases+accounts first, THEN daily stats) ----------
    if (canChallenge) {
      const challengeParticipationRate = 0.22;
      const dailyInsertBatch = 3000;

      const challengePurchaseRows: any[] = [];
      const challengeAccountRows: any[] = [];
      const dailyRowsAll: any[] = [];

      // payouts aggregation: userId|YYYY-MM -> amount
      const payoutByUserMonth = new Map<string, number>();

      // We must NOT call prisma.challengeAccount.update inside the loop before insert,
      // because accounts are not in DB yet (we're doing bulk insert).
      // So we store desired final status and apply after insert.
      const acctFinalStatus = new Map<string, "PASSED" | "FAILED">();

      for (const user of createdUsers) {
        if (Math.random() > challengeParticipationRate) continue;

        const plannedBuys =
          Math.random() < 0.70 ? 1 :
          Math.random() < 0.92 ? 2 :
          3;

        for (let b = 0; b < plannedBuys; b++) {
          const tier: any = pickWeighted([
            { item: challengeTiers[0], w: 20 },
            { item: challengeTiers[Math.min(1, challengeTiers.length - 1)], w: 22 },
            { item: challengeTiers[Math.min(2, challengeTiers.length - 1)], w: 20 },
            { item: challengeTiers[Math.min(3, challengeTiers.length - 1)], w: 18 },
            { item: challengeTiers[Math.min(4, challengeTiers.length - 1)], w: 12 },
            { item: challengeTiers[Math.min(5, challengeTiers.length - 1)], w: 8 },
          ]);

          const purchaseDate = addDaysUTC(now, -randomInt(7, 140));
          const purchaseId = crypto.randomUUID();
          const acctId = crypto.randomUUID();

          challengePurchaseRows.push({
            id: purchaseId,
            userId: user.id,
            tierId: tier.id,
            status: "CONFIRMED",
            txnHash: `0x${makeHex(64)}`,
            finalPriceUsd: Number(tier.price_usdt || 0),
            createdAt: purchaseDate,
          });

          challengeAccountRows.push({
            id: acctId,
            userId: user.id,
            tierId: tier.id,
            purchaseId: purchaseId,
            status: "ACTIVE",
            platform: tier.challengePlatform || "MT5",
            mt5Login: String(randomInt(100000, 999999)),
            mt5Server: "promrkts-MT5",
            createdAt: purchaseDate,
            updatedAt: purchaseDate,
          });

          totalChallengePurchases++;
          totalChallengeAccounts++;

          // ---- simulate daily stats in memory ----
          const meta: ChallengeMeta = (tier.challengeMeta || {}) as any;
          const accountSizeUsd = Number(meta.accountSizeUsd || 10000);

          const phases: PhaseRule[] =
            Array.isArray(meta.phases) && meta.phases.length
              ? meta.phases.map((p: any) => ({
                  index: Number(p.index || 1),
                  profitTargetUsd: Number(p.profitTargetUsd || meta.profitTargetUsd || 0),
                  maxDailyDrawdownUsd: Number(p.maxDailyDrawdownUsd || meta.maxDailyDrawdownUsd || 0),
                  maxTotalDrawdownUsd: Number(p.maxTotalDrawdownUsd || meta.maxTotalDrawdownUsd || 0),
                  minTradingDays: p.minTradingDays != null ? Number(p.minTradingDays) : 5,
                  maxDays: p.maxDays != null ? Number(p.maxDays) : 30,
                }))
              : [{
                  index: 1,
                  profitTargetUsd: Number(meta.profitTargetUsd || 0),
                  maxDailyDrawdownUsd: Number(meta.maxDailyDrawdownUsd || 0),
                  maxTotalDrawdownUsd: Number(meta.maxTotalDrawdownUsd || 0),
                  minTradingDays: 5,
                  maxDays: 30,
                }];

          const skill = pickWeighted([
            { item: "POOR", w: 55 },
            { item: "AVERAGE", w: 35 },
            { item: "GOOD", w: 10 },
          ]);

          const risk = Math.max(0.5, Math.min(2.2, 0.6 + Math.pow(Math.random(), 0.55) * 1.6));
          const driftPct = skill === "GOOD" ? 0.14 : skill === "AVERAGE" ? 0.07 : 0.02;
          const volPct = Math.max(0.35, Math.min(1.4, 0.45 * risk + (skill === "POOR" ? 0.25 : 0.15)));

          const isTwoStep = String(meta.variant || "").toUpperCase().includes("TWO");
          const passBias = isTwoStep ? 0.88 : 1.0;

          let overallResult: "PASSED" | "FAILED" = "FAILED";
          let failReason = "TIMEOUT";
          let allPhasesPassed = true;

          let date = toUtcMidnight(purchaseDate);
          const dailyRows: any[] = [];

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
              while (isWeekendUTC(date)) date = addDaysUTC(date, 1);
              tradingDays++;

              let ret = driftPct + normalish() * volPct;
              if (Math.random() < 0.03 * risk) ret += normalish() * (volPct * 2.8);

              ret = Math.max(-4.5, Math.min(3.5, ret));

              let pnl = (ret / 100) * balance;
              pnl = Math.max(-0.06 * accountSizeUsd, Math.min(0.06 * accountSizeUsd, pnl));

              const nextBalance = balance + pnl;
              const dayLoss = pnl < 0 ? pnl : 0;
              const dayProfit = pnl > 0 ? pnl : 0;

              if (dailyDD > 0 && Math.abs(dayLoss) > dailyDD * passBias) {
                failReason = "MAX_DAILY_DD";
                dailyRows.push({
                  challengeAccountId: acctId,
                  date,
                  balance: nextBalance,
                  equity: nextBalance,
                  pnl,
                  maxDailyDrawdown: dayLoss,
                  maxDailyProfit: dayProfit,
                  meta: { phase: phase.index, retPct: ret, risk, skill, reason: "daily_dd" },
                });
                balance = nextBalance;
                break;
              }

              if (totalDD > 0 && accountSizeUsd - nextBalance > totalDD * passBias) {
                failReason = "MAX_TOTAL_DD";
                dailyRows.push({
                  challengeAccountId: acctId,
                  date,
                  balance: nextBalance,
                  equity: nextBalance,
                  pnl,
                  maxDailyDrawdown: dayLoss,
                  maxDailyProfit: dayProfit,
                  meta: { phase: phase.index, retPct: ret, risk, skill, reason: "total_dd" },
                });
                balance = nextBalance;
                break;
              }

              dailyRows.push({
                challengeAccountId: acctId,
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
                date = addDaysUTC(date, 1);
                break;
              }

              date = addDaysUTC(date, 1);
            }

            if (!passedPhase) {
              allPhasesPassed = false;
              overallResult = "FAILED";
              break;
            }
          }

          if (allPhasesPassed) overallResult = "PASSED";

          // Collect daily rows globally (FK-safe after account insert)
          if (dailyRows.length) {
            dailyRowsAll.push(...dailyRows);
            totalChallengeDaily += dailyRows.length;
          }

          if (overallResult === "PASSED") {
            totalChallengePassed++;
            acctFinalStatus.set(acctId, "PASSED");

            const lastDay = dailyRows.length ? new Date(dailyRows[dailyRows.length - 1].date) : purchaseDate;
            const mk = monthKeyUTC(lastDay);

            const totalPnl = dailyRows.reduce((s: number, r: any) => s + Number(r.pnl || 0), 0);
            const profit = Math.max(0, totalPnl);
            const payout = Number((profit * 0.80).toFixed(2));

            if (payout > 0) {
              const key = `${user.id}|${mk}`;
              payoutByUserMonth.set(key, (payoutByUserMonth.get(key) || 0) + payout);
            }
          } else {
            totalChallengeFailed++;
            acctFinalStatus.set(acctId, "FAILED");
          }
        }
      }

      // IMPORTANT ORDER:
      // 1) insert purchases
      // 2) insert accounts
      // 3) update statuses
      // 4) insert daily stats (FK now valid)
      if (challengePurchaseRows.length) {
        await createManyBatched(prisma.purchase, challengePurchaseRows, 5000);
      }
      if (challengeAccountRows.length) {
        await createManyBatched(prisma.challengeAccount, challengeAccountRows, 3000);
      }

      // status updates in chunks (accounts exist now)
      if (acctFinalStatus.size) {
        const updates: Array<{ id: string; status: "PASSED" | "FAILED" }> = [];
        for (const [id, status] of acctFinalStatus.entries()) updates.push({ id, status });

        for (let i = 0; i < updates.length; i += 200) {
          const chunk = updates.slice(i, i + 200);
          await prisma.$transaction(
            chunk.map((u) =>
              prisma.challengeAccount.update({
                where: { id: u.id },
                data: { status: u.status, updatedAt: new Date() },
              })
            )
          );
        }
      }

      if (dailyRowsAll.length) {
        await createManyBatched((prisma as any).challengeDailyStat, dailyRowsAll, dailyInsertBatch);
      }

      // payouts: credit wallet balances (chunked tx)
      if (payoutByUserMonth.size && canWallet) {
        const entries = Array.from(payoutByUserMonth.entries()).map(([key, amount]) => {
          const [userId, month] = key.split("|");
          return { userId, month, amount };
        });

        for (let i = 0; i < entries.length; i += 200) {
          const chunk = entries.slice(i, i + 200);
          await prisma.$transaction(
            chunk.map((p) =>
              prisma.userWallet.update({
                where: { userId: p.userId },
                data: { usdtBalance: { increment: p.amount } as any },
              })
            )
          );
          totalPayouts += chunk.length;
        }

        // Optional payout ledger
        const canLedger =
          hasModel("profitSharePayout") ||
          hasModel("traderPayout") ||
          hasModel("payoutLedger");
        if (canLedger) {
          const rows = entries.map((p) => ({
            userId: p.userId,
            month: p.month,
            amount: p.amount,
            currency: "USDT",
            createdAt: tradeTime,
            meta: { type: "MONTHLY_PROFIT_SHARE_80" },
          }));

          if (hasModel("profitSharePayout")) {
            await createManyBatched((prisma as any).profitSharePayout, rows, 2000);
          } else if (hasModel("traderPayout")) {
            await createManyBatched((prisma as any).traderPayout, rows, 2000);
          } else if (hasModel("payoutLedger")) {
            await createManyBatched((prisma as any).payoutLedger, rows, 2000);
          }
        }
      }
    }
    
    // Force sold out supply at the very end (hard guarantee)
    if (sale && hasModel("tokenSale")) {
      const fresh = await prisma.tokenSale.findUnique({ where: { id: TOKEN_SALE_ID } });
      const sold = (fresh?.soldSupply ?? BigInt(0));
      if (sold < TOKEN_TOTAL_SUPPLY) {
        await prisma.tokenSale.update({
          where: { id: TOKEN_SALE_ID },
          data: { soldSupply: TOKEN_TOTAL_SUPPLY } as any,
        });
        console.log(`🧯 Forced sell-out: soldSupply set to totalSupply (${String(TOKEN_TOTAL_SUPPLY)})`);
      }
    }

    console.log(`✓ Batch complete: users=${createdUsers.length}`);
    console.log(`  totals: ${totalCreated}/${TOTAL_USERS} users`);
  }

  console.log("\n📊 Final Statistics:");
  console.log(`✓ Users: ${totalCreated}`);
  console.log(`✓ Course Purchases: ${totalPurchases}`);
  console.log(`✓ Progress: ${totalProgress}`);
  console.log(`✓ Activities: ${totalActivities}`);
  console.log(`✓ Reviews: ${totalReviews}`);
  console.log(`✓ Badges: ${totalBadges}`);

  console.log(`✓ Wallets: ${totalWallets}`);
  console.log(`✓ Token trades (approx): ${totalTokenTrades}`);
  console.log(`✓ Token ticks: ${totalTokenTicks}`);
  console.log(`✓ Token holdings rows: ${totalTokenHoldingsRows}`);

  console.log(`✓ Challenge purchases: ${totalChallengePurchases}`);
  console.log(`✓ Challenge accounts: ${totalChallengeAccounts}`);
  console.log(`✓ Challenge daily rows: ${totalChallengeDaily}`);
  console.log(`✓ Challenge PASSED: ${totalChallengePassed}`);
  console.log(`✓ Challenge FAILED: ${totalChallengeFailed}`);
  console.log(`✓ Monthly payouts applied (entries): ${totalPayouts}`);

  console.log("\n✅ MEGA simulation completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Mega simulation failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
