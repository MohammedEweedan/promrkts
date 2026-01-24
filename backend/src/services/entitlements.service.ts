import prisma from "../config/prisma";
import { markDashboardUsage } from "./journey.service";

type EntitlementInput = {
  canUseDashboard: boolean;
  maxWorkspaces: number;
  maxWidgets: number;
  canUseNews: boolean;
  canUseMultiGrid: boolean;
  canBuyEval: boolean;
  canJoinDiscord: boolean;
  canJoinTelegram: boolean;
};

const PREVIEW_ENTITLEMENTS: EntitlementInput = {
  canUseDashboard: false,
  maxWorkspaces: 0,
  maxWidgets: 6,
  canUseNews: false,
  canUseMultiGrid: false,
  canBuyEval: false,
  canJoinDiscord: false,
  canJoinTelegram: false,
};

async function upsertEntitlements(userId: string, data: EntitlementInput) {
  return prisma.userEntitlement.upsert({
    where: { userId },
    update: { ...data },
    create: { userId, ...data },
  });
}

export async function ensureEntitlements(userId: string) {
  return prisma.userEntitlement.upsert({
    where: { userId },
    update: {},
    create: { userId, ...PREVIEW_ENTITLEMENTS },
  });
}

export async function getEntitlements(userId: string) {
  const row = await prisma.userEntitlement.findUnique({ where: { userId } });
  if (row) return row;
  return ensureEntitlements(userId);
}

export async function refreshEntitlements(userId: string) {
  const [journey, purchases, community] = await Promise.all([
    prisma.userJourney.findUnique({ where: { userId } }),
    prisma.purchase.findMany({
      where: { userId, status: "CONFIRMED" as any },
      include: { tier: true },
    }),
    prisma.communityAccess.findUnique({ where: { userId } }),
  ]);

  const hasCourse = purchases.some((p: any) => p.tier?.productType === "COURSE");
  const hasSubscription = purchases.some((p: any) =>
    ["SUBSCRIPTION_VIP", "SUBSCRIPTION_AI"].includes(String(p.tier?.productType || ""))
  );
  const hasChallenge = purchases.some((p: any) => p.tier?.productType === "CHALLENGE");

  const canUseDashboard = hasCourse || hasSubscription;
  const maxWorkspaces = hasSubscription ? 3 : canUseDashboard ? 1 : 0;
  const maxWidgets = hasSubscription ? 16 : canUseDashboard ? 9 : 6;
  const canUseNews = Boolean(hasSubscription || community?.vip);
  const canUseMultiGrid = hasSubscription;
  const canJoinTelegram = Boolean(community?.telegram);
  const canJoinDiscord = Boolean(community?.discord);
  const canBuyEval = Boolean(journey?.evalReady || hasChallenge);

  const ent = await upsertEntitlements(userId, {
    canUseDashboard,
    maxWorkspaces,
    maxWidgets,
    canUseNews,
    canUseMultiGrid,
    canBuyEval,
    canJoinDiscord,
    canJoinTelegram,
  });

  return ent;
}

export async function ensureDashboardUsage(userId: string) {
  await markDashboardUsage(userId);
  await refreshEntitlements(userId);
}
