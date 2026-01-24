import prisma from '../config/prisma';
import { Request, Response } from 'express';

export async function listTiers(_req: Request, res: Response) {
  // Exclude VIP subscription products (isVipProduct=true) from regular courses list
  const tiers = await prisma.courseTier.findMany({ 
    where: { isVipProduct: false, productType: 'COURSE' as any },
    orderBy: { price_stripe: 'asc' } 
  });
  // Enrich with aggregates (confirmed purchases, ratings)
  const enriched = await Promise.all(
    tiers.map(async (tier: any) => {
      const [purchases_count, ratingAgg, latestReviews] = await Promise.all([
        prisma.purchase.count({ where: { tierId: tier.id, status: 'CONFIRMED' as any } }),
        prisma.courseReview.aggregate({ where: { tierId: tier.id }, _avg: { rating: true }, _count: { _all: true } }),
        prisma.courseReview.findMany({
          where: { tierId: tier.id },
          orderBy: { created_at: 'desc' },
          take: 3,
          include: { user: { select: { name: true } } },
        }),
      ]);
      return {
        ...tier,
        purchases_count,
        rating_avg: ratingAgg._avg.rating || 0,
        rating_count: ratingAgg._count._all || 0,
        latestReviews: latestReviews.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          user: { name: r.user?.name || null },
        })),
      };
    })
  );
  res.json(enriched);
}

// Create a resource (pdf/video) for a course tier
export async function createResource(req: Request, res: Response) {
  try {
    const { id } = req.params; // tier id
    const { type, url } = req.body as { type: 'pdf' | 'video'; url: string };
    const uuidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidRe.test(id)) return res.status(400).json({ message: 'Invalid course id' });
    if (!type || !url) return res.status(400).json({ message: 'type and url required' });
    const created = await prisma.resource.create({ data: { tierId: id, type: type as any, url } });
    return res.status(201).json(created);
  } catch (e) {
    return res.status(400).json({ message: 'Unable to create resource' });
  }
}

// Delete a resource by id
export async function deleteResource(req: Request, res: Response) {
  try {
    const { rid } = req.params as { rid: string };
    const uuidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidRe.test(rid)) return res.status(400).json({ message: 'Invalid resource id' });
    await prisma.resource.delete({ where: { id: rid } });
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ message: 'Unable to delete resource' });
  }
}

export async function getTier(req: Request, res: Response) {
  const { id } = req.params;
  // Validate UUID to avoid Prisma errors on malformed IDs
  const uuidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  if (!uuidRe.test(id)) {
    return res.status(400).json({ message: 'Invalid course id' });
  }

  const tier = await prisma.courseTier.findUnique({
    where: { id },
    include: { resources: true },
  });
  if (!tier) return res.status(404).json({ error: 'Not found' });

  const [purchases_count, ratingAgg, reviews] = await Promise.all([
    prisma.purchase.count({ where: { tierId: tier.id, status: 'CONFIRMED' as any } }),
    prisma.courseReview.aggregate({ where: { tierId: tier.id }, _avg: { rating: true }, _count: { _all: true } }),
    prisma.courseReview.findMany({
      where: { tierId: tier.id },
      orderBy: { created_at: 'desc' },
      include: { user: { select: { name: true, id: true } } },
    }),
  ]);

  res.json({
    ...tier,
    purchases_count,
    rating_avg: ratingAgg._avg.rating || 0,
    rating_count: ratingAgg._count._all || 0,
    reviews: reviews.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      user: r.user ? { id: r.user.id, name: r.user.name } : null,
    })),
  });
}

export async function createTier(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      price_usdt,
      price_stripe,
      level,
      trailerUrl,
      previewUrl,
      instructorName,
      instructorBio,
      instructorAvatarUrl,
      telegramEmbedUrl,
      telegramUrl,
      discordWidgetId,
      discordInviteUrl,
      twitterTimelineUrl,
      isVipProduct,
      isBundle,
      bundleTierIds,
    } = req.body || {};
    const created = await prisma.courseTier.create({
      data: {
        name,
        description,
        price_usdt: Number(price_usdt),
        price_stripe: Number(price_stripe),
        level,
        trailerUrl,
        previewUrl,
        instructorName,
        instructorBio,
        instructorAvatarUrl,
        telegramEmbedUrl,
        telegramUrl,
        discordWidgetId,
        discordInviteUrl,
        twitterTimelineUrl,
        isVipProduct: !!isVipProduct,
        isBundle: !!isBundle,
        bundleTierIds: bundleTierIds != null ? (Array.isArray(bundleTierIds) ? bundleTierIds : (typeof bundleTierIds === 'string' ? JSON.parse(bundleTierIds) : bundleTierIds)) : undefined,
      },
    });
    return res.status(201).json(created);
  } catch (e) {
    return res.status(400).json({ message: 'Unable to create course tier' });
  }
}

export async function updateTier(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price_usdt,
      price_stripe,
      level,
      trailerUrl,
      previewUrl,
      instructorName,
      instructorBio,
      instructorAvatarUrl,
      telegramEmbedUrl,
      telegramUrl,
      discordWidgetId,
      discordInviteUrl,
      twitterTimelineUrl,
      isVipProduct,
      isBundle,
      bundleTierIds,
    } = req.body || {};
    const updated = await prisma.courseTier.update({
      where: { id },
      data: {
        name,
        description,
        price_usdt: price_usdt != null ? Number(price_usdt) : undefined,
        price_stripe: price_stripe != null ? Number(price_stripe) : undefined,
        level,
        trailerUrl,
        previewUrl,
        instructorName,
        instructorBio,
        instructorAvatarUrl,
        telegramEmbedUrl,
        telegramUrl,
        discordWidgetId,
        discordInviteUrl,
        twitterTimelineUrl,
        isVipProduct: isVipProduct != null ? !!isVipProduct : undefined,
        isBundle: isBundle != null ? !!isBundle : undefined,
        bundleTierIds: bundleTierIds != null ? (Array.isArray(bundleTierIds) ? bundleTierIds : (typeof bundleTierIds === 'string' ? JSON.parse(bundleTierIds) : bundleTierIds)) : undefined,
        updatedAt: new Date(),
      },
    });
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ message: 'Unable to update course tier' });
  }
}

export async function deleteTier(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.courseTier.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ message: 'Unable to delete course tier' });
  }
}

// Reviews
export async function createReview(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id as string | undefined;
    const { id } = req.params; // tier id
    const { rating, comment } = req.body || {};
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const confirmed = await prisma.purchase.findFirst({ where: { userId, tierId: id, status: 'CONFIRMED' as any } });
    if (!confirmed) return res.status(403).json({ message: 'Only purchasers can review' });
    // Prevent duplicates: update existing review if present
    const existing = await prisma.courseReview.findFirst({ where: { tierId: id, userId } });
    const data = { rating: Number(rating) || 0, comment };
    let saved;
    if (existing) {
      saved = await prisma.courseReview.update({ where: { id: existing.id }, data });
    } else {
      saved = await prisma.courseReview.create({ data: { tierId: id, userId, ...data } });
    }
    return res.status(existing ? 200 : 201).json(saved);
  } catch (e) {
    return res.status(400).json({ message: 'Unable to create review' });
  }
}

export async function listReviews(req: Request, res: Response) {
  const { id } = req.params;
  const reviews = await prisma.courseReview.findMany({ where: { tierId: id }, orderBy: { created_at: 'desc' } });
  res.json(reviews);
}

// Mark course completion (per user). For now, this validates the user purchased the tier
// and returns success without persisting state, so the frontend can gate certificate flow.
export async function markCompletion(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id as string | undefined;
    const { id } = req.params; // tier id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const uuidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidRe.test(id)) return res.status(400).json({ message: 'Invalid course id' });

    const confirmed = await prisma.purchase.findFirst({
      where: { userId, tierId: id, status: 'CONFIRMED' as any },
      select: { id: true },
    });
    if (!confirmed) return res.status(403).json({ message: 'Only purchasers can mark completion' });

    // TODO: persist completion in DB (e.g., CourseCompletion table) if needed.
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ message: 'Unable to mark completion' });
  }
}
