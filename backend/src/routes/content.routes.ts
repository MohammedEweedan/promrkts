import { Router } from 'express';
import { getRecommendedRoutes, getPopularTrips, getCitySuggestions, getAirlines } from '../controllers/content.controller';
import prisma from '../config/prisma';

const router = Router();

// Content
router.get('/content/recommended-routes', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, getRecommendedRoutes);
router.get('/content/popular-trips', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, getPopularTrips);

// Marketing banners (DB-backed)
router.get('/content/banners', async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, image_url, title, subtitle, badge, href, created_at
       FROM banners
       ORDER BY created_at DESC
       LIMIT 24`
    );
    const data = (rows || []).map((r) => ({
      id: r.id,
      imageUrl: r.image_url,
      title: r.title,
      subtitle: r.subtitle,
      badge: r.badge,
      href: r.href,
    }));
    return res.json({ data });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load banners' });
  }
});

// Suggestions
router.get('/suggest/cities', getCitySuggestions);
router.get('/suggest/airlines', getAirlines);

export default router;
