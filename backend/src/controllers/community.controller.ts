import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/authJwt';
import { markCommunityJoin } from '../services/journey.service';
import { refreshEntitlements } from '../services/entitlements.service';

export const unlock = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  const confirmed = await prisma.purchase.findFirst({ where: { userId: req.user!.sub, status: 'CONFIRMED' } });
  if (!confirmed) return res.status(403).json({ error: 'No confirmed purchases' });
  const access = await prisma.communityAccess.upsert({ where: { userId: req.user!.sub }, update: { telegram: true, discord: true, twitter: true }, create: { userId: req.user!.sub, telegram: true, discord: true, twitter: true } });
  await markCommunityJoin(req.user!.sub);
  await refreshEntitlements(req.user!.sub);
  res.json(access);
}];

export const status = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  const access = await prisma.communityAccess.findUnique({ where: { userId: req.user!.sub } });
  res.json(access || { telegram: false, discord: false, twitter: false });
}];

export const activateVip = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const access = await prisma.communityAccess.upsert({
      where: { userId: req.user!.sub },
      update: { vip: true, vipStart: now, vipEnd: nextMonth },
      create: { userId: req.user!.sub, telegram: true, discord: false, twitter: false, vip: true, vipStart: now, vipEnd: nextMonth },
    });
    await markCommunityJoin(req.user!.sub);
    await refreshEntitlements(req.user!.sub);
    return res.json(access);
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to activate VIP' });
  }
}];
