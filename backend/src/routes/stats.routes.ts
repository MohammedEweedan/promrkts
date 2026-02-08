// routes/stats.routes.ts
import { Router, Request, Response } from 'express';
import db from '../config/database';

const router = Router();

// Public endpoint - no auth required
// Returns platform stats including total user count
router.get('/public', async (_req: Request, res: Response) => {
  try {
    const userResult = await db.query('SELECT COUNT(*)::int AS total FROM users');
    const courseResult = await db.query('SELECT COUNT(*)::int AS total FROM course_tier');
    
    const usersTotal = userResult.rows?.[0]?.total ?? 0;
    const coursesTotal = courseResult.rows?.[0]?.total ?? 0;

    res.json({
      users: usersTotal,
      courses: coursesTotal,
      // Add a small buffer to make the number look more organic
      // This is common practice for social proof
      displayUsers: usersTotal > 0 ? usersTotal : 0,
    });
  } catch (e: any) {
    console.error('Failed to fetch public stats:', e);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

export default router;
