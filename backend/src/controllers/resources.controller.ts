import { Request, Response } from 'express';
import prisma from '../config/prisma';

function getSignedUrl(rawUrl: string) {
  return `${rawUrl}?signed=1`;
}

// List resources for a tier.
// - Free tiers (price_usdt <= 0 and not VIP/bundles) are publicly accessible
// - Paid tiers still require a confirmed purchase for the current user
export const listForTier = async (req: Request & { user?: any }, res: Response) => {
  const { tierId } = req.params as { tierId: string };

  const tier = await prisma.courseTier.findUnique({ where: { id: tierId } });
  if (!tier) {
    return res.status(404).json({ error: 'Tier not found' });
  }

  const price = Number((tier as any).price_usdt ?? 0);
  const isVip = !!(tier as any).isVipProduct;
  const isBundle = !!(tier as any).isBundle;
  const isFreePublic = !isVip && !isBundle && (!Number.isFinite(price) || price <= 0);

  if (!isFreePublic) {
    const userId = (req as any).user?.sub as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const purchase = await prisma.purchase.findFirst({
      where: { userId, tierId, status: 'CONFIRMED' as any },
    });
    if (!purchase) {
      return res.status(403).json({ error: 'Payment required' });
    }
  }

  const resources = await prisma.resource.findMany({ where: { tierId } });
  return res.json(resources.map((r: any) => ({ ...r, url: getSignedUrl(r.url) })));
};
