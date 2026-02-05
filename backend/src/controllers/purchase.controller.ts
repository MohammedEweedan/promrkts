import { Request, Response } from 'express';
import prisma from '../config/prisma';
import db from '../config/database';
import { requireAuth, requireAdmin } from '../middleware/authJwt';
import logger from '../utils/logger';
import { sendReceiptEmail } from '../utils/invoiceEmail';
import Stripe from 'stripe';
import { markCourseEngagement, markEvaluating } from '../services/journey.service';
import { refreshEntitlements } from '../services/entitlements.service';
import pushNotificationService from '../services/pushNotification.service';
import { sendUpsellEmail, sendInvoiceEmail, InvoiceData } from '../services/email.service';

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

const STRIPE_API_VERSION = '2024-06-20' as any;

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

export async function handlePurchaseConfirmed(purchaseId: string) {
  const anyPrisma: any = prisma as any;
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { tier: true } as any,
  });
  if (!purchase) return;

  // Referral reward
  if ((purchase as any).refAffiliateId) {
    try {
      await prisma.referralReward.create({
        data: {
          affiliateId: (purchase as any).refAffiliateId,
          purchaseId: purchase.id,
          tierId: purchase.tierId,
          userId: purchase.userId,
          status: 'QUALIFIED',
        },
      });
    } catch {}
  }

  // Promo redemption
  if ((purchase as any).promoId) {
    try {
      await prisma.promoRedemption.create({
        data: {
          promoId: (purchase as any).promoId,
          userId: purchase.userId,
          purchaseId: purchase.id,
        },
      });
    } catch {}
  }

  // Grant community Telegram access
  try {
    const hasAccess = await prisma.communityAccess.findUnique({ where: { userId: purchase.userId } });
    if (hasAccess) {
      await prisma.communityAccess.update({ where: { userId: purchase.userId }, data: { telegram: true } });
    } else {
      await prisma.communityAccess.create({ data: { userId: purchase.userId, telegram: true, discord: false, twitter: false } });
    }
  } catch {}

  // VIP: if VIP Tier or VIP add-on present, activate/extend VIP 30 days
  try {
    const full = await prisma.purchase.findUnique({ where: { id: purchase.id }, include: { tier: true } as any });
    const isVipTier = !!(full as any)?.tier?.isVipProduct;
    const path = String((full as any)?.pricingPath || '');
    const vipAddonMatch = path.includes('vip_addon_usd_');
    if (isVipTier || vipAddonMatch) {
      const now = new Date();
      const existing = await prisma.communityAccess.findUnique({ where: { userId: purchase.userId } });
      let start = now;
      let end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (existing?.vipEnd && existing.vipEnd > now) {
        start = existing.vipStart || now;
        end = new Date(existing.vipEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
      await prisma.communityAccess.upsert({
        where: { userId: purchase.userId },
        update: { vip: true, vipStart: start, vipEnd: end },
        create: { userId: purchase.userId, telegram: true, discord: false, twitter: false, vip: true, vipStart: start, vipEnd: end },
      });
    }
  } catch {}

  // Challenge account bootstrap
  try {
    const tier: any = (purchase as any)?.tier;
    if (String(tier?.productType || '') === 'CHALLENGE') {
      await anyPrisma.challengeAccount.upsert({
        where: { purchaseId: purchase.id },
        update: { status: 'PENDING', platform: tier?.challengePlatform || 'MT5' },
        create: {
          userId: purchase.userId,
          tierId: purchase.tierId,
          purchaseId: purchase.id,
          status: 'PENDING',
          platform: tier?.challengePlatform || 'MT5',
        },
      });
    }
  } catch {}

  await markCourseEngagement(purchase.userId);
  if ((purchase as any).tier?.productType === 'CHALLENGE') {
    await markEvaluating(purchase.userId);
  }
  await refreshEntitlements(purchase.userId);

  // Send push notification
  try {
    const tier: any = (purchase as any)?.tier;
    await pushNotificationService.notifyPurchaseConfirmed(
      purchase.userId,
      {
        productName: tier?.name || 'Product',
        amount: purchase.amount || 0,
      }
    );
  } catch (error) {
    console.error('Failed to send purchase notification:', error);
  }

  // Send receipt (non-blocking)
  (async () => {
    try {
      await sendReceiptEmail(purchase.id);
    } catch (e) {
      logger.warn('Failed to send receipt email:', e as any);
    }
  })();

  // Send invoice email via Resend (non-blocking)
  (async () => {
    try {
      const user = await prisma.users.findUnique({ where: { id: purchase.userId }, select: { email: true, name: true } });
      const tier: any = (purchase as any)?.tier;
      if (user && tier) {
        const invoiceData: InvoiceData = {
          invoiceNumber: `INV-${purchase.id.slice(0, 8).toUpperCase()}`,
          purchaseDate: new Date(),
          items: [{
            name: tier.name || 'Product',
            description: tier.description || undefined,
            quantity: 1,
            unitPrice: Number(tier.price_usdt) || 0,
            total: Number((purchase as any).finalPriceUsd) || Number(tier.price_usdt) || 0,
          }],
          subtotal: Number(tier.price_usdt) || 0,
          discount: Number((purchase as any).discountUsd) || undefined,
          total: Number((purchase as any).finalPriceUsd) || Number(tier.price_usdt) || 0,
          paymentMethod: (purchase as any).stripeId ? 'Card' : (purchase as any).txnHash ? 'USDT (TRC20)' : 'Free',
          transactionId: (purchase as any).txnHash || (purchase as any).stripeId || undefined,
        };
        await sendInvoiceEmail({ email: user.email, name: user.name }, invoiceData);
      }
    } catch (e) {
      logger.warn('Failed to send invoice email:', e as any);
    }
  })();

  // Send upsell email for FREE course purchases (non-blocking)
  (async () => {
    try {
      const tier: any = (purchase as any)?.tier;
      const isFree = Number(tier?.price_usdt || 0) === 0;
      if (isFree) {
        const user = await prisma.users.findUnique({ where: { id: purchase.userId }, select: { email: true, name: true } });
        if (user) {
          await sendUpsellEmail({ email: user.email, name: user.name }, tier?.name || 'Free Course');
        }
      }
    } catch (e) {
      logger.warn('Failed to send upsell email:', e as any);
    }
  })();
}

export const createPurchase = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  const { tierId, method, promoCode: rawPromoCode, refCode: rawRefCode, preview, vipTelegram } = req.body as {
    tierId: string;
    method: 'usdt' | 'free' | 'card';
    promoCode?: string;
    refCode?: string;
    preview?: boolean;
    vipTelegram?: boolean;
  };
  const tier = await prisma.courseTier.findUnique({ where: { id: tierId } });
  if (!tier) return res.status(404).json({ error: 'Tier not found' });

  // Base price — use USDT price in USD terms from DB
  const usdFromUsdt = typeof (tier as any).price_usdt === 'number' ? Number((tier as any).price_usdt) : 0;
  const P = Number.isFinite(usdFromUsdt) && usdFromUsdt > 0 ? usdFromUsdt : 0;

  // Resolve referral 10% if valid and not self
  const refInput = (rawRefCode || '').trim();
  let refDiscount = 0;
  let refAffiliateId: string | null = null;
  if (refInput) {
    const affiliate = await prisma.affiliate.findFirst({ where: { code: { equals: refInput, mode: 'insensitive' }, active: true } });
    if (affiliate && affiliate.userId !== req.user!.sub) {
      refDiscount = 0.1 * P;
      refAffiliateId = affiliate.id;
    }
  }

  // Resolve promo
  const promoInput = (rawPromoCode || '').trim();
  let promoDiscount = 0;
  let promoId: string | null = null;
  let promoCode: string | null = null;
  if (promoInput) {
    const now = new Date();
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: { equals: promoInput, mode: 'insensitive' },
        active: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
    });
    if (promo) {
      // Validate min spend
      if (promo.minSpendUsd == null || P >= Number(promo.minSpendUsd)) {
        // Validate applicability: if array is empty, treat as 'all tiers'
        let applicable = true;
        if (promo.applicableTierIds != null) {
          try {
            const raw = promo.applicableTierIds as any;
            const ids: string[] = Array.isArray(raw)
              ? raw.map((v: any) => String(v))
              : Array.isArray((raw || {}).ids)
              ? (raw.ids as any[]).map((v: any) => String(v))
              : [];
            applicable = ids.length === 0 ? true : ids.includes(tierId);
          } catch {
            applicable = true;
          }
        }
        // Validate global cap and per-user cap
        if (applicable) {
          if (promo.maxGlobalRedemptions != null) {
            const used = await prisma.promoRedemption.count({ where: { promoId: promo.id } });
            if (used >= promo.maxGlobalRedemptions) applicable = false;
          }
          if (applicable && promo.maxPerUser != null) {
            const usedByUser = await prisma.promoRedemption.count({ where: { promoId: promo.id, userId: req.user!.sub } });
            if (usedByUser >= promo.maxPerUser) applicable = false;
          }
        }
        if (applicable) {
          if (promo.discountType === 'PERCENT') {
            promoDiscount = Math.max(0, Math.min(P, (promo.value / 100) * P));
          } else {
            promoDiscount = Math.max(0, Math.min(P, Number(promo.value)));
          }
          promoId = promo.id;
          promoCode = promo.code;
        }
      }
    }
  }

  // Best-of rule with 20% floor
  const floorPrice = 0.8 * P;
  const chosen = refDiscount >= promoDiscount ? 'ref' : 'promo';
  let appliedDiscount = Math.max(refDiscount, promoDiscount);
  let finalPrice = Math.max(P - appliedDiscount, floorPrice);
  appliedDiscount = Math.max(0, P - finalPrice);

  let pricingPath: string = 'none';
  if (refDiscount && !promoDiscount) pricingPath = 'refOnly';
  else if (promoDiscount && !refDiscount) pricingPath = 'promoOnly';
  else if (refDiscount && promoDiscount) pricingPath = chosen === 'ref' ? 'both_present_bestOf_ref' : 'both_present_bestOf_promo';
  // Resolve VIP addon from VIP Tier price
  let vipAddon = 0;
  if (vipTelegram) {
    try {
      const vipTier = await prisma.courseTier.findFirst({ where: { isVipProduct: true } as any });
      const vipUsd = Number((vipTier as any)?.price_usdt || 0);
      if (vipUsd > 0 && method === 'usdt') {
        vipAddon = vipUsd;
        pricingPath = pricingPath + `|vip_addon_usd_${vipUsd}`;
      }
    } catch {}
  }

  // Preview: return computed price only, do not create a purchase
  if (preview) {
    return res.json({ provider: method, amount: finalPrice + vipAddon, discount: appliedDiscount, baseUsed: P, pricingPath });
  }

  // Create purchase with metadata
  const purchase = await prisma.purchase.create({
    data: {
      userId: req.user!.sub,
      tierId,
      status: method === 'free' ? ('CONFIRMED' as any) : ('PENDING' as any),
      refAffiliateId: refAffiliateId || undefined,
      refCode: refAffiliateId ? refInput : undefined,
      promoId: promoId || undefined,
      promoCode: promoCode || undefined,
      discountUsd: appliedDiscount,
      finalPriceUsd: finalPrice + vipAddon,
      pricingPath,
    },
  });

  if (method === 'free') {
    // Fire-and-forget receipt email for free purchases
    (async () => {
      try { await sendReceiptEmail(purchase.id); } catch (e) { logger.warn('Failed to send free purchase receipt:', e as any); }
    })();
    return res.json({ provider: 'free', purchaseId: purchase.id, status: 'confirmed' });
  }

  if (method === 'card') {
    const stripe = getStripeClient();
    if (!stripe) return res.status(400).json({ error: 'Card payments are not configured' });
    const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3003').replace(/\/$/, '');
    const amountUsd = Math.max(0, finalPrice + vipAddon);
    const unitAmount = Math.max(0, Math.round(amountUsd * 100));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: purchase.id,
      metadata: {
        purchaseId: purchase.id,
        tierId,
        userId: String(req.user!.sub),
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmount,
            product_data: {
              name: String((tier as any)?.name || 'Purchase'),
              description: String((tier as any)?.description || ''),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout?tierId=${tierId}&purchaseId=${purchase.id}`,
      cancel_url: `${appUrl}/checkout?tierId=${tierId}&purchaseId=${purchase.id}`,
    });

    await prisma.purchase.update({ where: { id: purchase.id }, data: { stripeId: session.id } });
    return res.json({ provider: 'card', purchaseId: purchase.id, checkoutUrl: session.url, status: 'pending' });
  }

  // Only USDT (TRC20)
  const provider = 'usdt';
  const amount = finalPrice + vipAddon;
  return res.json({ provider, network: 'TRC20', purchaseId: purchase.id, address: process.env.USDT_WALLET_ADDRESS || 'address', amount, status: 'pending' });
}];

// Admin-only: metrics (counts and revenue)
export const adminGetMetrics = [requireAdmin, async (_req: Request & { user?: any }, res: Response) => {
  const cacheKey = 'purchase_admin_metrics_v2';
  const cached = getCached<any>(cacheKey);
  if (cached) return res.json(cached);

  // Do NOT load all purchases into memory.
  const counts = (await prisma.purchase.groupBy({
    by: ['status'],
    _count: { _all: true },
  })) as Array<{ status: any; _count: { _all: number } }>;

  const confirmed = counts.find((c: { status: any; _count: { _all: number } }) => String(c.status) === 'CONFIRMED')?._count._all ?? 0;
  const pending = counts.find((c: { status: any; _count: { _all: number } }) => String(c.status) === 'PENDING')?._count._all ?? 0;
  const failed = counts.find((c: { status: any; _count: { _all: number } }) => String(c.status) === 'FAILED')?._count._all ?? 0;

  const revenueRes = await prisma.$queryRaw<Array<{ revenue_usdt: number }>>`
    SELECT COALESCE(SUM(t.price_usdt), 0)::float8 AS revenue_usdt
    FROM "Purchase" p
    JOIN "CourseTier" t ON t.id = p."tierId"
    WHERE p.status = 'CONFIRMED'
  `;

  const byDayRows = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
    SELECT to_char(date_trunc('day', p."createdAt"), 'YYYY-MM-DD') AS date,
           COUNT(*)::int AS count
    FROM "Purchase" p
    WHERE p."createdAt" >= now() - interval '90 days'
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  const byDay: Record<string, number> = {};
  for (const r of byDayRows) byDay[String(r.date)] = Number(r.count) || 0;

  const payload = {
    confirmed,
    pending,
    failed,
    revenue_usdt: Number(revenueRes?.[0]?.revenue_usdt || 0),
    byDay,
  };

  setCached(cacheKey, payload, 15_000);
  return res.json(payload);
}];

// Admin-only: list pending purchases for manual verification
export const adminListPendingPurchases = [requireAdmin, async (_req: Request & { user?: any }, res: Response) => {
  // IMPORTANT: do not return an unbounded list (can OOM the server / huge JSON)
  const take = Math.min(200, Math.max(1, Number((_req.query as any)?.take || 50)));
  const skip = Math.max(0, Number((_req.query as any)?.skip || 0));

  const purchases = await prisma.purchase.findMany({
    where: { status: 'PENDING' as any },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
    select: {
      id: true,
      userId: true,
      tierId: true,
      status: true,
      txnHash: true,
      stripeId: true,
      createdAt: true,
      pricingPath: true,
      finalPriceUsd: true,
      tier: {
        select: {
          id: true,
          name: true,
          price_usdt: true,
          price_stripe: true,
          productType: true,
          isVipProduct: true,
          vipType: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          created_at: true,
        },
      },
    },
  });

  // Total count for pagination UI
  const total = await prisma.purchase.count({ where: { status: 'PENDING' as any } });
  return res.json({ data: purchases, page: { take, skip, total } });
}];

// Admin-only: set purchase status (e.g., confirm Libyana/Madar manually)
export const adminSetPurchaseStatus = [requireAdmin, async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params as { id: string };
  const { status, note } = req.body as { status: string; note?: string };
  if (!id || !status) return res.status(400).json({ error: 'id and status are required' });
  const nextStatus = String(status).toUpperCase() as 'CONFIRMED' | 'FAILED' | 'PENDING';
  const purchase = await prisma.purchase.findUnique({ where: { id }, include: { tier: true } as any });
  if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
  const prevStatus = String(purchase.status || '').toUpperCase();
  const updated = await prisma.purchase.update({ where: { id }, data: { status: nextStatus as any, txnHash: note ? String(note) : purchase.txnHash } });

  // On first-time CONFIRMED, grant entitlements and log rewards/redemptions
  if (status === 'CONFIRMED' && prevStatus !== 'CONFIRMED') {
    // Referral reward
    if (purchase.refAffiliateId) {
      await prisma.referralReward.create({
        data: {
          affiliateId: purchase.refAffiliateId,
          purchaseId: purchase.id,
          tierId: purchase.tierId,
          userId: purchase.userId,
          status: 'QUALIFIED',
        },
      });
    }
    // Promo redemption
    if (purchase.promoId) {
      await prisma.promoRedemption.create({
        data: {
          promoId: purchase.promoId,
          userId: purchase.userId,
          purchaseId: purchase.id,
        },
      });
    }
    // Grant community Telegram access
    const hasAccess = await prisma.communityAccess.findUnique({ where: { userId: purchase.userId } });
    if (hasAccess) {
      await prisma.communityAccess.update({ where: { userId: purchase.userId }, data: { telegram: true } });
    } else {
      await prisma.communityAccess.create({ data: { userId: purchase.userId, telegram: true, discord: false, twitter: false } });
    }

    // VIP: if VIP Tier or VIP add-on present, activate/extend VIP 30 days
    try {
      const full = await prisma.purchase.findUnique({ where: { id: purchase.id }, include: { tier: true } as any });
      const isVipTier = !!(full as any)?.tier?.isVipProduct;
      const path = String((full as any)?.pricingPath || '');
      const vipAddonMatch = path.includes('vip_addon_usd_');
      if (isVipTier || vipAddonMatch) {
        const now = new Date();
        const existing = await prisma.communityAccess.findUnique({ where: { userId: purchase.userId } });
        let start = now;
        let end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (existing?.vipEnd && existing.vipEnd > now) {
          start = existing.vipStart || now;
          end = new Date(existing.vipEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
        await prisma.communityAccess.upsert({
          where: { userId: purchase.userId },
          update: { vip: true, vipStart: start, vipEnd: end },
          create: { userId: purchase.userId, telegram: true, discord: false, twitter: false, vip: true, vipStart: start, vipEnd: end },
        });
      }
    } catch {}
  }

  // After status change, if transitioned to CONFIRMED, send receipt (non-blocking)
  if (nextStatus === 'CONFIRMED' && prevStatus !== 'CONFIRMED') {
    (async () => {
      try { await sendReceiptEmail(id); } catch (e) { logger.warn('Failed to send receipt email:', e as any); }
    })();
    await handlePurchaseConfirmed(id);
  }

  return res.json(updated);
}];

// Helper: mark old pending purchases (>30 min) as FAILED
async function expireStalePurchases(userId: string) {
  const THIRTY_MIN = 30 * 60 * 1000;
  const cutoff = new Date(Date.now() - THIRTY_MIN);
  await prisma.purchase.updateMany({
    where: { userId, status: 'PENDING' as any, createdAt: { lt: cutoff } },
    data: { status: 'FAILED' as any },
  });
}

export const myPurchases = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  // Expire stale pending purchases before returning
  await expireStalePurchases(req.user!.sub);
  const [purchases, access] = await Promise.all([
    prisma.purchase.findMany({ where: { userId: req.user!.sub }, orderBy: { createdAt: 'desc' }, include: { tier: true } }),
    prisma.communityAccess.findUnique({ where: { userId: req.user!.sub } }),
  ]);
  const entitlements = {
    vipTelegram: { active: !!access?.vip, endsAt: access?.vipEnd || null },
  } as any;
  const enriched = purchases.map((p: any) => {
    const tiers: string[] = (() => {
      if (p?.tier?.isBundle) {
        try {
          const raw = p?.tier?.bundleTierIds as any;
          if (Array.isArray(raw)) return raw.map(String);
          if (raw && Array.isArray(raw.ids)) return raw.ids.map(String);
        } catch {}
      }
      return [p.tierId];
    })();
    return { ...p, entitlements: { ...entitlements, tiers } };
  });
  res.json(enriched);
}];

// Confirm/provide proof of payment
export const confirmPurchase = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  const { purchaseId, method, txHash, fromPhone } = req.body as { purchaseId: string; method: 'usdt' | 'libyana' | 'madar'; txHash?: string; fromPhone?: string };
  if (!purchaseId || !method) return res.status(400).json({ error: 'purchaseId and method are required' });

  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!purchase || purchase.userId !== req.user!.sub) return res.status(404).json({ error: 'Purchase not found' });

  // If already confirmed/failed, return as-is
  if (purchase.status === 'CONFIRMED' || purchase.status === 'FAILED') {
    return res.json(purchase);
  }

  const createdMs = new Date(purchase.createdAt).getTime();
  const ageMs = Date.now() - createdMs;
  const within30m = ageMs <= 30 * 60 * 1000;

  if (method === 'usdt') {
    if (!txHash || !txHash.trim()) return res.status(400).json({ error: 'txHash required for USDT' });
    // NOTE: Do not auto-confirm. Keep as PENDING until an admin verifies on-chain.
    if (!within30m) {
      const updated = await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'FAILED' as any, txnHash: txHash.trim() } });
      return res.status(400).json({ error: 'Payment window expired', purchase: updated });
    }
    const updated = await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'PENDING' as any, txnHash: txHash.trim() } });
    return res.json({
      message: 'Proof received. Awaiting manual verification by admin.',
      purchase: updated,
    });
  }

  if (method === 'libyana' || method === 'madar') {
    if (!fromPhone || !fromPhone.trim()) return res.status(400).json({ error: 'fromPhone required' });
    // Store phone in txnHash field as a simple proof record
    const updated = await prisma.purchase.update({ where: { id: purchase.id }, data: { txnHash: fromPhone.trim() } });
    // Status remains PENDING for manual admin confirmation
    return res.json(updated);
  }

  return res.status(400).json({ error: 'Unsupported method' });
}];
