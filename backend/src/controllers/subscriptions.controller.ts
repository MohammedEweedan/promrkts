import prisma from '../config/prisma';
import { Request, Response } from 'express';

// GET /subscriptions - List subscription products (VIP + AI)
export async function listSubscriptions(_req: Request, res: Response) {
  const subscriptions = await prisma.courseTier.findMany({
    where: {
      OR: [{ isVipProduct: true }, { productType: 'SUBSCRIPTION_AI' as any }],
    },
    orderBy: { price_stripe: 'asc' },
  });
  
  // Enrich with subscriber counts
  const enriched = await Promise.all(
    subscriptions.map(async (sub: any) => {
      const purchases_count = await prisma.purchase.count({ 
        where: { tierId: sub.id, status: 'CONFIRMED' as any } 
      });
      return {
        ...sub,
        purchases_count,
        subscribers_count: purchases_count,
      };
    })
  );
  
  res.json(enriched);
}

// GET /subscriptions/:id - Get a single subscription product
export async function getSubscription(req: Request, res: Response) {
  const { id } = req.params;
  const subscription = await prisma.courseTier.findFirst({
    where: {
      id,
      OR: [{ isVipProduct: true }, { productType: 'SUBSCRIPTION_AI' as any }],
    },
  });
  
  if (!subscription) {
    return res.status(404).json({ message: 'Subscription not found' });
  }
  
  const purchases_count = await prisma.purchase.count({ 
    where: { tierId: id, status: 'CONFIRMED' as any } 
  });
  
  res.json({
    ...subscription,
    purchases_count,
    subscribers_count: purchases_count,
  });
}
