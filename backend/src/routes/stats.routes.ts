// routes/stats.routes.ts
import { Router, Request, Response } from 'express';
import db from '../config/database';

const router = Router();

// Public endpoint - no auth required
// Returns platform stats including total user count and purchase counts
router.get('/public', async (_req: Request, res: Response) => {
  try {
    const userResult = await db.query('SELECT COUNT(*)::int AS total FROM users');
    const courseResult = await db.query('SELECT COUNT(*)::int AS total FROM course_tier');
    const purchaseResult = await db.query(
      `SELECT COUNT(*)::int AS total FROM "Purchase" WHERE status = 'CONFIRMED'`
    );
    const perCourseResult = await db.query(
      `SELECT "tierId" AS tier_id, COUNT(*)::int AS buyers
       FROM "Purchase"
       WHERE status = 'CONFIRMED'
       GROUP BY "tierId"`
    );

    const usersTotal = userResult.rows?.[0]?.total ?? 0;
    const coursesTotal = courseResult.rows?.[0]?.total ?? 0;
    const purchasesTotal = purchaseResult.rows?.[0]?.total ?? 0;

    // Map of tierId -> buyer count
    const buyersPerCourse: Record<string, number> = {};
    for (const row of perCourseResult.rows ?? []) {
      buyersPerCourse[row.tier_id] = row.buyers;
    }

    res.json({
      users: usersTotal,
      courses: coursesTotal,
      purchases: purchasesTotal,
      displayUsers: usersTotal > 0 ? usersTotal : 0,
      buyersPerCourse,
    });
  } catch (e: any) {
    console.error('Failed to fetch public stats:', e);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

export default router;
