// src/controllers/tokens.controller.ts
import type { Request, Response } from "express";
import prisma from "../config/prisma";
import crypto from "crypto";

type AuthedRequest = Request & { user?: { id: string; role?: string } };

const TOKEN_SALE_ID = 1;

const DEFAULT_SYMBOL = process.env.TOKEN_SALE_SYMBOL || "PMKX";
const DEFAULT_TOTAL_SUPPLY = process.env.TOKEN_SALE_TOTAL_SUPPLY || "20000000000";
const DEFAULT_PRICE = process.env.TOKEN_SALE_PRICE_USDT || "0.10";
const DEFAULT_PROFIT_SHARE = process.env.TOKEN_SALE_PROFIT_SHARE_PCT || "0.10";
const DEFAULT_ACTIVE = process.env.TOKEN_SALE_ACTIVE === "false" ? false : true;
const FORCE_ACTIVE = process.env.TOKEN_SALE_FORCE_ACTIVE === "true";

const PROFITS_FALLBACK_USDT = Number(process.env.TOKEN_SALE_TOTAL_PROFITS_USDT || "0");

type WalletNetwork = "ERC20" | "TRC20";
type WalletAsset = "USDT" | "PMKX";
type WalletDepositStatus = "DETECTED" | "CONFIRMED" | "REJECTED";
type TokenPurchaseStatus = "PENDING" | "CONFIRMED" | "FAILED";

const ERC20_ADDR_LEN = 42;

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function toBigIntStrict(v: unknown): bigint {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") {
    if (!Number.isFinite(v)) throw new Error("Invalid number");
    if (v < 0) throw new Error("Invalid integer");
    return BigInt(Math.floor(v));
  }
  const s = String(v ?? "").trim();
  if (!/^\d+$/.test(s)) throw new Error("Invalid integer");
  return BigInt(s);
}

function bigIntToNumberSafe(v: bigint): number {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error("BigInt conversion overflow");
  return n;
}

function parsePositiveNumber(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function parseProfitShare(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, 0), 1);
}

function makePseudoErc20Address(): string {
  const rnd = crypto.randomBytes(20).toString("hex");
  return ("0x" + rnd).slice(0, ERC20_ADDR_LEN);
}

function makePseudoTronAddress(): string {
  // NOT real base58check; placeholder until you integrate Tron address generation.
  return ("T" + crypto.randomBytes(20).toString("hex")).slice(0, 34);
}

/** ---------------- SALE + PRICE ---------------- */

async function getOrCreateSale() {
  let sale = await prisma.tokenSale.findUnique({ where: { id: TOKEN_SALE_ID } });

  if (!sale) {
    sale = await prisma.tokenSale.create({
      data: {
        id: TOKEN_SALE_ID,
        symbol: DEFAULT_SYMBOL,
        totalSupply: toBigIntStrict(DEFAULT_TOTAL_SUPPLY),
        soldSupply: BigInt(0),
        priceUsdtPerTok: parsePositiveNumber(DEFAULT_PRICE, 0.10),
        profitSharePct: parseProfitShare(DEFAULT_PROFIT_SHARE, 0.10),
        active: DEFAULT_ACTIVE,

        // optional knobs (you have them in schema)
        basePriceUsdt: parsePositiveNumber(DEFAULT_PRICE, 0.10),
        curveK: 2.0,
        demandK: 0.5,
        targetTokensPerMin: 100_000,
        targetBuysPerMin: 1.0,
      } as any,
    });
  } else if (!sale.active && FORCE_ACTIVE) {
    sale = await prisma.tokenSale.update({
      where: { id: TOKEN_SALE_ID },
      data: { active: true },
    });
  }

  return sale;
}

async function computeDynamicPrice(sale: any): Promise<number> {
  const total = Number(sale.totalSupply);
  const sold = Number(sale.soldSupply);
  const soldRatio = total > 0 ? sold / total : 0;

  const base = sale.basePriceUsdt ?? sale.priceUsdtPerTok ?? 0.1;
  const curveK = clamp(sale.curveK ?? 2.0, 0, 10);
  const supplyMultiplier = 1 + curveK * Math.pow(soldRatio, 2);

  const windowMin = 10;
  const since = new Date(Date.now() - windowMin * 60_000);

  const agg = await prisma.tokenPurchase.aggregate({
    where: {
      saleId: sale.id,
      createdAt: { gte: since },
      status: { in: ["PENDING", "CONFIRMED"] as TokenPurchaseStatus[] } as any,
    },
    _sum: { tokens: true },
  });

  const sumTokens = agg._sum.tokens as unknown as bigint | null;
  const volumeTokens = sumTokens ? bigIntToNumberSafe(sumTokens) : 0;
  const volPerMin = volumeTokens / windowMin;

  const targetTokensPerMin = clamp(sale.targetTokensPerMin ?? 100_000, 1, 1e15);
  const demandK = clamp(sale.demandK ?? 0.5, 0, 5);

  const demandRatio = volPerMin / targetTokensPerMin;
  const demandMultiplier = clamp(1 + demandK * (demandRatio - 1), 1.0, 3.0);

  const price = base * supplyMultiplier * demandMultiplier;
  return clamp(price, 0.0001, 1000);
}

async function persistSalePriceAndTick(saleId: number, price: number) {
  const sale = await prisma.tokenSale.findUnique({ where: { id: saleId } });
  if (!sale) return;

  await prisma.$transaction([
    prisma.tokenSale.update({
      where: { id: saleId },
      data: { priceUsdtPerTok: price },
    }),
    prisma.tokenPriceTick.create({
      data: { saleId, price, soldSupply: sale.soldSupply },
    }),
  ]);
}

/** ---------------- EARNINGS ---------------- */

function computeEarnedEstimate(args: {
  totalSupply: bigint;
  userTokens: bigint;
  profitSharePct: number;
  totalProfitsUsdt?: number | null;
  dividendsDisabled?: boolean;
}) {
  if (args.dividendsDisabled) {
    return {
      pctOfTokenPool: 0,
      pctOfCompanyValue: 0,
      earnedUsdtEstimate: 0,
      totalProfitsUsdt: 0,
    };
  }

  const total = bigIntToNumberSafe(args.totalSupply);
  const user = bigIntToNumberSafe(args.userTokens);
  const pct = total > 0 ? user / total : 0;

  const profits = Number.isFinite(args.totalProfitsUsdt as number)
    ? Number(args.totalProfitsUsdt)
    : PROFITS_FALLBACK_USDT;

  const earned = profits > 0 ? profits * args.profitSharePct * pct : 0;

  return {
    pctOfTokenPool: pct,
    pctOfCompanyValue: pct * 0.10,
    earnedUsdtEstimate: earned,
    totalProfitsUsdt: profits,
  };
}

/** ---------------- WALLET HELPERS ---------------- */

async function ensureUserWallet(userId: string) {
  const w = await prisma.userWallet.findUnique({ where: { userId } });
  if (w) return w;

  return prisma.userWallet.create({
    data: {
      userId,
      pmkxErc20Address: makePseudoErc20Address(),
      usdtBalance: 0,
      pmkxBalance: BigInt(0),
    } as any,
  });
}

async function ensureDepositAddresses(userId: string) {
  const existing = await prisma.walletAddress.findMany({
    where: { userId },
    select: { network: true, asset: true, address: true },
  });

  const have = new Set(existing.map((x: { network: any; asset: any; }) => `${String(x.network)}:${String(x.asset)}`));

  const needed: Array<{ network: WalletNetwork; asset: WalletAsset }> = [
    { network: "ERC20", asset: "USDT" },
    { network: "TRC20", asset: "USDT" },
    { network: "ERC20", asset: "PMKX" },
    { network: "TRC20", asset: "PMKX" },
  ];

  const toCreate: Array<{ userId: string; network: WalletNetwork; asset: WalletAsset; address: string }> = [];

  for (const need of needed) {
    const key = `${need.network}:${need.asset}`;
    if (have.has(key)) continue;

    const address = need.network === "ERC20" ? makePseudoErc20Address() : makePseudoTronAddress();
    toCreate.push({ userId, network: need.network, asset: need.asset, address });
  }

  if (toCreate.length) {
    await prisma.walletAddress.createMany({ data: toCreate as any, skipDuplicates: true });
  }

  return prisma.walletAddress.findMany({
    where: { userId },
    orderBy: [{ network: "asc" }, { asset: "asc" }],
  });
}

/** ---------------- PUBLIC ---------------- */

export const getInfo = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const sale = await getOrCreateSale();
    const holding = await prisma.userTokenHolding.findUnique({ where: { userId } });

    const total = sale.totalSupply;
    const sold = sale.soldSupply;
    const remaining = total - sold;

    const userTokens = holding?.balance ?? BigInt(0);
    const livePrice = await computeDynamicPrice(sale);

    const earned = computeEarnedEstimate({
      totalSupply: total,
      userTokens,
      profitSharePct: sale.profitSharePct ?? 0.1,
      totalProfitsUsdt: (sale as any).totalProfitUsdt ?? null,
      dividendsDisabled: holding?.dividendsDisabled ?? false,
    });

    const wallet = await ensureUserWallet(userId);
    const depositAddresses = await ensureDepositAddresses(userId);

    return res.json({
      symbol: sale.symbol,
      priceUsdtPerTok: livePrice,
      profitSharePct: sale.profitSharePct,
      totalSupply: total.toString(),
      soldSupply: sold.toString(),
      remainingSupply: remaining.toString(),

      userTokens: userTokens.toString(),
      userPctOfTokenPool: earned.pctOfTokenPool,
      userPctOfCompanyValue: earned.pctOfCompanyValue,
      unlockAt: holding?.lockedUntil ?? null,

      earnedUsdtEstimate: earned.earnedUsdtEstimate,
      totalProfitsUsdt: earned.totalProfitsUsdt,
      dividendsDisabled: holding?.dividendsDisabled ?? false,

      usdtAddress: wallet.usdtAddress ?? null,
      usdtNetwork: wallet.usdtNetwork ?? null,
      pmkxErc20Address: wallet.pmkxErc20Address ?? null,
      ledgerUsdtBalance: wallet.usdtBalance ?? 0,
      ledgerPmkxBalance: (wallet.pmkxBalance ?? BigInt(0)).toString(),

      depositAddresses: depositAddresses.map((x: { network: any; asset: any; address: any; }) => ({
        network: String(x.network),
        asset: String(x.asset),
        address: x.address,
      })),
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to load token info" });
  }
};

export const getMarket = async (req: AuthedRequest, res: Response) => {
  try {
    const sale = await getOrCreateSale();
    const limit = clamp(Number(req.query.limit || 200), 1, 1000);

    const ticks = await prisma.tokenPriceTick.findMany({
      where: { saleId: sale.id },
      orderBy: { t: "asc" },
      take: limit,
    });

    return res.json({
      symbol: sale.symbol,
      pair: `${sale.symbol}/USDT`,
      data: ticks.map((x: { t: { toISOString: () => any; }; price: any; soldSupply: { toString: () => any; }; }) => ({
        t: x.t.toISOString(),
        price: x.price,
        soldSupply: x.soldSupply.toString(),
      })),
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to load market" });
  }
};

/** ---------------- PURCHASE (USER) ---------------- */

export const createPurchase = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { tokens, method, address } = req.body as { tokens?: unknown; method?: string; address?: string };

    const tok = toBigIntStrict(tokens);
    if (tok <= BigInt(0)) return res.status(400).json({ message: "tokens must be > 0" });

    const sale = await getOrCreateSale();
    if (!sale.active) return res.status(400).json({ message: "Token sale is not active" });

    const livePrice = await computeDynamicPrice(sale);
    const usdtDue = bigIntToNumberSafe(tok) * livePrice;

    const row = await prisma.tokenPurchase.create({
      data: {
        userId,
        saleId: sale.id,
        tokens: tok,
        usdtDue,
        method: String(method || "MANUAL").toUpperCase(),
        address: address ? String(address) : null,
        status: "PENDING",
        priceAtBuy: livePrice,
      } as any,
    });

    return res.json({
      ok: true,
      id: row.id,
      status: row.status,
      tokens: row.tokens.toString(),
      usdtDue: row.usdtDue,
      priceAtBuy: row.priceAtBuy,
      createdAt: row.createdAt,
    });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Failed to create purchase" });
  }
};

export const submitProof = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { tokenPurchaseId, txnHash } = req.body as { tokenPurchaseId?: string; txnHash?: string };
    if (!tokenPurchaseId || !txnHash) return res.status(400).json({ message: "tokenPurchaseId and txnHash required" });

    const p = await prisma.tokenPurchase.findUnique({ where: { id: tokenPurchaseId } });
    if (!p || p.userId !== userId) return res.status(404).json({ message: "Purchase not found" });
    if (String(p.status) !== "PENDING") return res.status(400).json({ message: "Only PENDING purchases can be updated" });

    const updated = await prisma.tokenPurchase.update({
      where: { id: tokenPurchaseId },
      data: { txnHash: String(txnHash).trim() } as any,
    });

    return res.json({ ok: true, id: updated.id, txnHash: updated.txnHash, status: updated.status });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Failed to submit proof" });
  }
};

export const getMine = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const list = await prisma.tokenPurchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.json(
      list.map((p: { id: any; userId: any; saleId: any; tokens: { toString: () => any; }; usdtDue: any; priceAtBuy: any; method: any; address: any; txnHash: any; status: any; createdAt: any; confirmedAt: any; }) => ({
        id: p.id,
        userId: p.userId,
        saleId: p.saleId,
        tokens: p.tokens.toString(),
        usdtDue: p.usdtDue,
        priceAtBuy: p.priceAtBuy ?? null,
        method: p.method,
        address: p.address,
        txnHash: p.txnHash,
        status: p.status,
        createdAt: p.createdAt,
        confirmedAt: p.confirmedAt ?? null,
      }))
    );
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to load purchases" });
  }
};

/** ---------------- ADMIN ---------------- */

export const adminListPending = async (_req: AuthedRequest, res: Response) => {
  try {
    const rows = await prisma.tokenPurchase.findMany({
      where: { status: "PENDING" as any },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
      take: 200,
    });

    return res.json({
      data: rows.map((row: { id: any; userId: any; saleId: any; tokens: { toString: () => any; }; usdtDue: any; priceAtBuy: any; method: any; address: any; txnHash: any; status: any; createdAt: any; confirmedAt: any; user: any; }) => ({
        id: row.id,
        userId: row.userId,
        saleId: row.saleId,
        tokens: row.tokens.toString(),
        usdtDue: row.usdtDue,
        priceAtBuy: row.priceAtBuy ?? null,
        method: row.method,
        address: row.address,
        txnHash: row.txnHash,
        status: row.status,
        createdAt: row.createdAt,
        confirmedAt: row.confirmedAt,
        user: row.user,
      })),
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to load pending purchases" });
  }
};

export const adminSetStatus = async (req: AuthedRequest, res: Response) => {
  try {
    const { tokenPurchaseId, status } = req.body as { tokenPurchaseId?: string; status?: string };
    if (!tokenPurchaseId || !status) return res.status(400).json({ message: "tokenPurchaseId and status are required" });

    const normalized = String(status).toUpperCase();
    if (!["FAILED", "PENDING", "CONFIRMED"].includes(normalized)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (normalized === "CONFIRMED") {
      req.body = { tokenPurchaseId } as any;
      return adminConfirm(req, res);
    }

    const purchase = await prisma.tokenPurchase.findUnique({ where: { id: tokenPurchaseId } });
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    await prisma.tokenPurchase.update({
      where: { id: tokenPurchaseId },
      data: { status: normalized as any },
    });

    return res.json({ status: normalized });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to update status" });
  }
};

export const adminConfirm = async (req: AuthedRequest, res: Response) => {
  try {
    const { tokenPurchaseId } = req.body as { tokenPurchaseId?: string };
    if (!tokenPurchaseId) return res.status(400).json({ message: "Missing tokenPurchaseId" });

    await getOrCreateSale();

    const result = await prisma.$transaction(async (tx: { tokenSale: { findUnique: (arg0: { where: { id: number; }; }) => any; update: (arg0: { where: { id: number; }; data: any; }) => any; }; tokenPurchase: { findUnique: (arg0: { where: { id: string; }; }) => any; update: (arg0: { where: { id: any; }; data: any; }) => any; }; userTokenHolding: { upsert: (arg0: { where: { userId: any; }; create: any; update: any; }) => any; }; }) => {
      const sale = await tx.tokenSale.findUnique({ where: { id: TOKEN_SALE_ID } });
      if (!sale) throw new Error("TokenSale not configured");

      const p = await tx.tokenPurchase.findUnique({ where: { id: tokenPurchaseId } });
      if (!p) throw new Error("Purchase not found");
      if (String((p as any).status) === "CONFIRMED") return { ok: true, status: "CONFIRMED" as const };

      const remaining = sale.totalSupply - sale.soldSupply;
      if (p.tokens > remaining) throw new Error("Not enough remaining supply");

      await tx.tokenSale.update({
        where: { id: TOKEN_SALE_ID },
        data: { soldSupply: sale.soldSupply + p.tokens } as any,
      });

      const lockUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await tx.userTokenHolding.upsert({
        where: { userId: p.userId },
        create: { userId: p.userId, balance: p.tokens, lockedUntil: lockUntil } as any,
        update: { balance: { increment: p.tokens } as any, lockedUntil: lockUntil } as any,
      });

      await tx.tokenPurchase.update({
        where: { id: (p as any).id },
        data: { status: "CONFIRMED", confirmedAt: new Date() } as any,
      });

      return { ok: true, status: "CONFIRMED" as const };
    });

    const sale = await prisma.tokenSale.findUnique({ where: { id: TOKEN_SALE_ID } });
    if (sale) {
      const livePrice = await computeDynamicPrice(sale);
      await persistSalePriceAndTick(sale.id, livePrice);
    }

    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to confirm purchase" });
  }
};

export const adminTokenMetrics = async (_req: AuthedRequest, res: Response) => {
  try {
    const sale = await getOrCreateSale();

    const [pCounts, depositCounts, ledgerAgg, revenueAgg] = await Promise.all([
      prisma.tokenPurchase.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.walletDeposit.groupBy({
        by: ["status", "asset", "network"],
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.userWallet.aggregate({ _sum: { usdtBalance: true } }),
      prisma.tokenPurchase.aggregate({
        where: { status: "CONFIRMED" as TokenPurchaseStatus },
        _sum: { usdtDue: true },
      }),
    ]);

    return res.json({
      sale: {
        id: sale.id,
        symbol: sale.symbol,
        active: sale.active,
        priceUsdtPerTok: sale.priceUsdtPerTok,
        totalSupply: sale.totalSupply.toString(),
        soldSupply: sale.soldSupply.toString(),
      },
      purchasesByStatus: pCounts.map((x: { status: any; _count: { _all: any; }; }) => ({ status: String(x.status), count: x._count._all })),
      deposits: depositCounts.map((x: { status: any; asset: any; network: any; _count: { _all: any; }; _sum: { amount: any; }; }) => ({
        status: String(x.status),
        asset: String(x.asset),
        network: String(x.network),
        count: x._count._all,
        sumAmount: x._sum.amount ?? 0,
      })),
      ledger: {
        totalUsdtBalance: ledgerAgg._sum.usdtBalance ?? 0,
      },
      confirmedUsdt: Number(revenueAgg._sum.usdtDue ?? 0),
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to load metrics" });
  }
};

/** ---------------- WALLET LINKING ---------------- */

export const linkUsdtWallet = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { address, network } = req.body as { address?: string; network?: string };
    const addr = String(address || "").trim();
    const net = String(network || "").trim().toUpperCase();

    if (!addr || addr.length < 10) return res.status(400).json({ message: "Invalid address" });
    if (!["TRC20", "ERC20"].includes(net)) return res.status(400).json({ message: "Invalid network" });

    await ensureUserWallet(userId);

    const updated = await prisma.userWallet.update({
      where: { userId },
      data: { usdtAddress: addr, usdtNetwork: net } as any,
    });

    return res.json({
      ok: true,
      usdtAddress: updated.usdtAddress,
      usdtNetwork: updated.usdtNetwork,
      pmkxErc20Address: updated.pmkxErc20Address,
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to link wallet" });
  }
};

export const getMyWallet = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const wallet = await ensureUserWallet(userId);
    const depositAddresses = await ensureDepositAddresses(userId);

    return res.json({
      userId,
      usdtAddress: wallet.usdtAddress ?? null,
      usdtNetwork: wallet.usdtNetwork ?? null,
      pmkxErc20Address: wallet.pmkxErc20Address ?? null,
      ledgerUsdtBalance: wallet.usdtBalance ?? 0,
      ledgerPmkxBalance: (wallet.pmkxBalance ?? BigInt(0)).toString(),
      depositAddresses: depositAddresses.map((x: { network: any; asset: any; address: any; }) => ({
        network: String(x.network),
        asset: String(x.asset),
        address: x.address,
      })),
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to load wallet" });
  }
};

/** ---------------- UNSTAKE ---------------- */

export const unstakeTokens = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { tokens, earlyUnlock } = req.body as { tokens?: unknown; earlyUnlock?: boolean };
    const tok = toBigIntStrict(tokens);
    if (tok <= BigInt(0)) return res.status(400).json({ message: "Tokens must be > 0" });

    const result = await prisma.$transaction(async (tx: { userTokenHolding: { findUnique: (arg0: { where: { userId: string; }; }) => any; update: (arg0: { where: { userId: string; } | { userId: string; }; data: any; }) => any; }; userWallet: { upsert: (arg0: { where: { userId: string; }; create: any; update: any; }) => any; }; }) => {
      const holding = await tx.userTokenHolding.findUnique({ where: { userId } });
      if (!holding) throw new Error("No holdings");
      if (tok > holding.balance) throw new Error("Not enough staked tokens");

      const now = new Date();
      const lockedUntil = holding.lockedUntil;
      const isLocked = lockedUntil ? lockedUntil.getTime() > now.getTime() : false;

      if (!earlyUnlock && isLocked) {
        throw new Error("Tokens are locked. Use earlyUnlock=true to unlock early (10% fee + dividends forfeited).");
      }

      const fee = earlyUnlock ? tok / BigInt(10) : BigInt(0);
      const receive = tok - fee;

      if (earlyUnlock) {
        await tx.userTokenHolding.update({
          where: { userId },
          data: { dividendsDisabled: true, dividendsDisabledAt: now } as any,
        });
      }

      await tx.userTokenHolding.update({
        where: { userId },
        data: { balance: holding.balance - tok } as any,
      });

      await tx.userWallet.upsert({
        where: { userId },
        create: {
          userId,
          pmkxBalance: receive,
          usdtBalance: 0,
          pmkxErc20Address: makePseudoErc20Address(),
        } as any,
        update: { pmkxBalance: { increment: receive } as any } as any,
      });

      return { receive, fee };
    });

    return res.json({
      ok: true,
      unlockedTokens: result.receive.toString(),
      feeTokens: result.fee.toString(),
    });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Failed to unstake" });
  }
};

/** ---------------- MARKET BUY/SELL (LEDGER ONLY) ---------------- */

export const marketBuy = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const sale = await getOrCreateSale();
    if (!sale.active) return res.status(400).json({ message: "Token sale is not active" });

    const { tokens, usdt } = req.body as { tokens?: unknown; usdt?: number };
    const livePrice = await computeDynamicPrice(sale);

    let tok = BigInt(0);
    let cost = 0;

    if (tokens != null) {
      tok = toBigIntStrict(tokens);
      if (tok <= BigInt(0)) return res.status(400).json({ message: "tokens must be > 0" });
      cost = bigIntToNumberSafe(tok) * livePrice;
    } else {
      const u = Number(usdt);
      if (!Number.isFinite(u) || u <= 0) return res.status(400).json({ message: "usdt must be > 0" });
      const calcTok = Math.floor(u / livePrice);
      if (calcTok <= 0) return res.status(400).json({ message: "usdt too small at current price" });
      tok = BigInt(calcTok);
      cost = calcTok * livePrice;
    }

    const result = await prisma.$transaction(async (tx: any) => {
    const w = await tx.userWallet.findUnique({ where: { userId } });
    if (!w) throw new Error("Wallet not initialized");
    if ((w.usdtBalance ?? 0) < cost) throw new Error("Insufficient USDT balance in wallet");

    await tx.userWallet.update({
      where: { userId },
      data: {
        usdtBalance: (w.usdtBalance ?? 0) - cost,
        pmkxBalance: { increment: tok } as any,
      } as any,
    });

    const saleNow = await tx.tokenSale.findUnique({ where: { id: sale.id } });
    if (!saleNow) throw new Error("TokenSale not found");

    const newSold = saleNow.soldSupply + tok;

    await tx.tokenSale.update({
      where: { id: sale.id },
      data: { soldSupply: newSold } as any,
    });

    return { tok, cost, livePrice, soldSupply: newSold };
  });

  // ✅ record tick + candle AFTER tx commits
  await recordMarketEvent({
    saleId: sale.id,
    price: result.livePrice,
    soldSupply: result.soldSupply,
    volumeTokens: result.tok,
    volumeUsdt: result.cost,
    at: new Date(),
    intervalSec: 60,
  });

  return res.json({
    ok: true,
    side: "BUY",
    priceUsdtPerTok: result.livePrice,
    tokens: result.tok.toString(),
    usdt: result.cost,
  });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Market buy failed" });
  }
};

export const marketSell = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const sale = await getOrCreateSale();
    const livePrice = await computeDynamicPrice(sale);

    const { tokens, usdt } = req.body as { tokens?: unknown; usdt?: number };

    let tok = BigInt(0);
    let receive = 0;

    if (tokens != null) {
      tok = toBigIntStrict(tokens);
      if (tok <= BigInt(0)) return res.status(400).json({ message: "tokens must be > 0" });
      receive = bigIntToNumberSafe(tok) * livePrice;
    } else {
      const u = Number(usdt);
      if (!Number.isFinite(u) || u <= 0) return res.status(400).json({ message: "usdt must be > 0" });
      const calcTok = Math.floor(u / livePrice);
      if (calcTok <= 0) return res.status(400).json({ message: "usdt too small at current price" });
      tok = BigInt(calcTok);
      receive = calcTok * livePrice;
    }

    const result = await prisma.$transaction(async (tx: any) => {
    const w = await tx.userWallet.findUnique({ where: { userId } });
    if (!w) throw new Error("Wallet not initialized");

    const bal = w.pmkxBalance ?? BigInt(0);
    if (tok > bal) throw new Error("Insufficient PMKX balance in wallet");

    await tx.userWallet.update({
      where: { userId },
      data: {
        pmkxBalance: bal - tok,
        usdtBalance: (w.usdtBalance ?? 0) + receive,
      } as any,
    });

    const saleNow = await tx.tokenSale.findUnique({ where: { id: sale.id } });
    if (!saleNow) throw new Error("TokenSale not found");

    return { tok, receive, livePrice, soldSupply: saleNow.soldSupply };
  });

  await recordMarketEvent({
    saleId: sale.id,
    price: result.livePrice,
    soldSupply: result.soldSupply,
    volumeTokens: result.tok,
    volumeUsdt: result.receive,
    at: new Date(),
    intervalSec: 60,
  });

  return res.json({
    ok: true,
    side: "SELL",
    priceUsdtPerTok: result.livePrice,
    tokens: result.tok.toString(),
    usdt: result.receive,
  });

  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Market sell failed" });
  }
};

function floorToInterval(d: Date, intervalSec: number) {
  const ms = d.getTime();
  const bucketMs = Math.floor(ms / (intervalSec * 1000)) * (intervalSec * 1000);
  return new Date(bucketMs);
}

async function recordMarketEvent(args: {
  saleId: number;
  price: number;
  soldSupply: bigint;
  volumeTokens?: bigint; // tokens in this event
  volumeUsdt?: number;   // usdt in this event
  at?: Date;
  intervalSec?: number;  // 60 by default
}) {
  const at = args.at ?? new Date();
  const intervalSec = args.intervalSec ?? 60;

  const volTok = args.volumeTokens ?? BigInt(0);
  const volUsdt = Number.isFinite(args.volumeUsdt as number) ? Number(args.volumeUsdt) : 0;

  // 1) raw tick
  await prisma.tokenPriceTick.create({
    data: {
      saleId: args.saleId,
      t: at,
      price: args.price,
      soldSupply: args.soldSupply,
      volumeTokens: volTok,
      volumeUsdt: volUsdt,
    } as any,
  });

  // 2) candle bucket
  const bucketStart = floorToInterval(at, intervalSec);

  // if you added TokenCandle model
  await prisma.tokenCandle.upsert({
    where: {
      saleId_bucketStart_intervalSec: {
        saleId: args.saleId,
        bucketStart,
        intervalSec,
      },
    },
    create: {
      saleId: args.saleId,
      bucketStart,
      intervalSec,
      open: args.price,
      high: args.price,
      low: args.price,
      close: args.price,
      volumeTokens: volTok,
      volumeUsdt: volUsdt,
    } as any,
    update: {
      high: { set: undefined } as any, // placeholder, overwritten below in transaction
    } as any,
  });

  // update OHLC/volume with a safe read-modify-write
  const c = await prisma.tokenCandle.findUnique({
    where: {
      saleId_bucketStart_intervalSec: {
        saleId: args.saleId,
        bucketStart,
        intervalSec,
      },
    },
  });

  if (!c) return;

  await prisma.tokenCandle.update({
    where: { id: c.id },
    data: {
      high: Math.max(Number(c.high), args.price),
      low: Math.min(Number(c.low), args.price),
      close: args.price,
      volumeTokens: (c.volumeTokens ?? BigInt(0)) + volTok,
      volumeUsdt: Number((Number(c.volumeUsdt ?? 0) + volUsdt).toFixed(6)),
    } as any,
  });
}

export const getCandles = async (req: AuthedRequest, res: Response) => {
  try {
    const sale = await getOrCreateSale();
    const intervalSec = clamp(Number(req.query.interval || 60), 60, 86400);
    const limit = clamp(Number(req.query.limit || 500), 10, 2000);

    const rows = await prisma.tokenCandle.findMany({
      where: { saleId: sale.id, intervalSec },
      orderBy: { bucketStart: "asc" },
      take: limit,
    });

    return res.json({
      symbol: sale.symbol,
      pair: `${sale.symbol}/USDT`,
      intervalSec,
      data: rows.map((c: any) => ({
        t: c.bucketStart.toISOString(),
        o: c.open,
        h: c.high,
        l: c.low,
        c: c.close,
        vTok: c.volumeTokens.toString(),
        vUsdt: c.volumeUsdt,
      })),
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to load candles" });
  }
};