import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireAdmin } from '../middleware/authJwt';

// GET /api/badges - Get all badges
export const getAllBadges = [
  async (_req: Request, res: Response) => {
    try {
      const badges = await prisma.badge.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
      });

      res.json(badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  },
];

// GET /api/badges/my - Get user's unlocked badges
export const getMyBadges = [
  requireAuth,
  async (req: Request & { user?: any }, res: Response) => {
    let userId = req.user!.sub;
    const override = req.headers['x-user-id'] as string | string[] | undefined;
    if (override && req.user?.role === 'admin') {
      userId = Array.isArray(override) ? override[0] : String(override);
    }

    try {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: true,
        },
        orderBy: { unlockedAt: 'desc' },
      });

      res.json(userBadges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  },
];

// GET /api/badges/progress - Get badge progress (how close to unlocking)
export const getBadgeProgress = [
  requireAuth,
  async (req: Request & { user?: any }, res: Response) => {
    let userId = req.user!.sub;
    const override = req.headers['x-user-id'] as string | string[] | undefined;
    if (override && req.user?.role === 'admin') {
      userId = Array.isArray(override) ? override[0] : String(override);
    }

    try {
      // Get all badges
      const badges = await prisma.badge.findMany({
        where: { isActive: true },
      });

      // Get user's unlocked badges
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      });

      const unlockedBadgeIds = new Set(userBadges.map((ub: any) => ub.badgeId));

      // Get user's progress data
      const allProgress = await prisma.studentProgress.findMany({
        where: { userId },
      });

      const totalVideosWatched = allProgress.reduce((sum: number, p: any) => sum + p.videosWatched, 0);
      const totalPdfsViewed = allProgress.reduce((sum: number, p: any) => sum + p.pdfsViewed, 0);
      const totalLessonsCompleted = allProgress.reduce((sum: number, p: any) => sum + p.lessonsCompleted, 0);
      const coursesCompleted = allProgress.filter((p: any) => p.completedAt).length;
      const maxStreak = Math.max(...allProgress.map((p: any) => p.streak), 0);
      const totalXP = allProgress.reduce((sum: number, p: any) => sum + p.xp, 0);
      const level = Math.floor(totalXP / 1000) + 1;

      // Calculate progress for each badge
      const badgeProgress = badges.map((badge: any) => {
        const criteria = badge.unlockCriteria as any;
        const isUnlocked = unlockedBadgeIds.has(badge.id);

        let current = 0;
        let required = 0;
        let progressPercentage = 0;

        switch (criteria.type) {
          case 'videos_watched':
            current = totalVideosWatched;
            required = criteria.count || 0;
            break;
          case 'pdfs_viewed':
            current = totalPdfsViewed;
            required = criteria.count || 0;
            break;
          case 'lessons_completed':
            current = totalLessonsCompleted;
            required = criteria.count || 0;
            break;
          case 'courses_completed':
            current = coursesCompleted;
            required = criteria.count || 0;
            break;
          case 'streak':
            current = maxStreak;
            required = criteria.days || 0;
            break;
          case 'level':
            current = level;
            required = criteria.level || 0;
            break;
          case 'course_completed':
            if (criteria.tierId) {
              const courseProgress = allProgress.find((p: any) => p.tierId === criteria.tierId);
              current = courseProgress?.completedAt ? 1 : 0;
              required = 1;
            }
            break;
        }

        if (required > 0) {
          progressPercentage = Math.min((current / required) * 100, 100);
        }

        return {
          badge,
          isUnlocked,
          current,
          required,
          progressPercentage,
        };
      });

      res.json(badgeProgress);
    } catch (error) {
      console.error('Error fetching badge progress:', error);
      res.status(500).json({ error: 'Failed to fetch badge progress' });
    }
  },
];

// POST /api/badges - Create a new badge (admin only)
export const createBadge = [
  requireAdmin,
  async (req: Request & { user?: any }, res: Response) => {
    const { name, description, imageUrl, category, unlockCriteria, rarity, displayOrder } = req.body;

    try {
      if (!name || !description || !unlockCriteria) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const badge = await prisma.badge.create({
        data: {
          name,
          description,
          imageUrl,
          category: category || 'MILESTONE',
          unlockCriteria,
          rarity: rarity || 'common',
          displayOrder: displayOrder || 0,
        },
      });

      res.json(badge);
    } catch (error) {
      console.error('Error creating badge:', error);
      res.status(500).json({ error: 'Failed to create badge' });
    }
  },
];

// PUT /api/badges/:id - Update a badge (admin only)
export const updateBadge = [
  requireAdmin,
  async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;
    const { name, description, imageUrl, category, unlockCriteria, rarity, displayOrder, isActive } = req.body;

    try {
      const badge = await prisma.badge.update({
        where: { id },
        data: {
          name,
          description,
          imageUrl,
          category,
          unlockCriteria,
          rarity,
          displayOrder,
          isActive,
        },
      });

      res.json(badge);
    } catch (error) {
      console.error('Error updating badge:', error);
      res.status(500).json({ error: 'Failed to update badge' });
    }
  },
];

// DELETE /api/badges/:id - Delete a badge (admin only)
export const deleteBadge = [
  requireAdmin,
  async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;

    try {
      await prisma.badge.delete({
        where: { id },
      });

      res.json({ message: 'Badge deleted successfully' });
    } catch (error) {
      console.error('Error deleting badge:', error);
      res.status(500).json({ error: 'Failed to delete badge' });
    }
  },
];

// POST /api/badges/seed - Seed default badges (admin only)
export const seedDefaultBadges = [
  requireAdmin,
  async (_req: Request & { user?: any }, res: Response) => {
    try {
      const defaultBadges = [
        {
          name: 'First Steps',
          description: 'Complete your first lesson',
          category: 'MILESTONE',
          rarity: 'common',
          unlockCriteria: { type: 'lessons_completed', count: 1 },
          imageUrl: '/api/uploads/badges/first-steps.png',
          displayOrder: 1,
        },
        {
          name: 'Quick Learner',
          description: 'Earn 100 XP',
          category: 'MILESTONE',
          rarity: 'common',
          unlockCriteria: { type: 'xp', value: 100 },
          imageUrl: '/api/uploads/badges/quick-learner.png',
          displayOrder: 2,
        },
        {
          name: 'Dedicated Student',
          description: 'Earn 250 XP',
          category: 'MILESTONE',
          rarity: 'common',
          unlockCriteria: { type: 'xp', value: 250 },
          imageUrl: '/api/uploads/badges/dedicated-student.png',
          displayOrder: 3,
        },
        {
          name: 'Rising Star',
          description: 'Earn 500 XP',
          category: 'MILESTONE',
          rarity: 'rare',
          unlockCriteria: { type: 'xp', value: 500 },
          imageUrl: '/api/uploads/badges/rising-star.png',
          displayOrder: 4,
        },
        {
          name: 'Knowledge Seeker',
          description: 'Earn 1,000 XP',
          category: 'MILESTONE',
          rarity: 'rare',
          unlockCriteria: { type: 'xp', value: 1000 },
          imageUrl: '/api/uploads/badges/knowledge-seeker.png',
          displayOrder: 5,
        },
        {
          name: 'Consistent Learner',
          description: 'Maintain a 7-day streak',
          category: 'STREAK',
          rarity: 'rare',
          unlockCriteria: { type: 'streak', days: 7 },
          imageUrl: '/api/uploads/badges/consistent-learner.png',
          displayOrder: 6,
        },
        {
          name: 'Video Master',
          description: 'Watch 10 videos',
          category: 'ACHIEVEMENT',
          rarity: 'rare',
          unlockCriteria: { type: 'videos_watched', count: 10 },
          imageUrl: '/api/uploads/badges/video-master.png',
          displayOrder: 7,
        },
        {
          name: 'Document Expert',
          description: 'Read 10 PDFs',
          category: 'ACHIEVEMENT',
          rarity: 'rare',
          unlockCriteria: { type: 'pdfs_viewed', count: 10 },
          imageUrl: '/api/uploads/badges/document-expert.png',
          displayOrder: 8,
        },
        {
          name: 'Ambitious Trader',
          description: 'Earn 1,500 XP',
          category: 'MILESTONE',
          rarity: 'rare',
          unlockCriteria: { type: 'xp', value: 1500 },
          imageUrl: '/api/uploads/badges/ambitious-trader.png',
          displayOrder: 9,
        },
        {
          name: 'Course Completer',
          description: 'Complete your first course',
          category: 'ACHIEVEMENT',
          rarity: 'epic',
          unlockCriteria: { type: 'course_completed', count: 1 },
          imageUrl: '/api/uploads/badges/course-completer.png',
          displayOrder: 10,
        },
        {
          name: 'Trading Scholar',
          description: 'Earn 2,500 XP',
          category: 'MILESTONE',
          rarity: 'epic',
          unlockCriteria: { type: 'xp', value: 2500 },
          imageUrl: '/api/uploads/badges/trading-scholar.png',
          displayOrder: 11,
        },
        {
          name: 'Marathon Learner',
          description: 'Maintain a 30-day streak',
          category: 'STREAK',
          rarity: 'epic',
          unlockCriteria: { type: 'streak', days: 30 },
          imageUrl: '/api/uploads/badges/marathon-learner.png',
          displayOrder: 12,
        },
        {
          name: 'Multi-Course Master',
          description: 'Complete 3 courses',
          category: 'ACHIEVEMENT',
          rarity: 'epic',
          unlockCriteria: { type: 'course_completed', count: 3 },
          imageUrl: '/api/uploads/badges/multi-course-master.png',
          displayOrder: 13,
        },
        {
          name: 'Expert Analyst',
          description: 'Earn 4,000 XP',
          category: 'MILESTONE',
          rarity: 'epic',
          unlockCriteria: { type: 'xp', value: 4000 },
          imageUrl: '/api/uploads/badges/expert-analyst.png',
          displayOrder: 14,
        },
        {
          name: 'Trading Master',
          description: 'Earn 5,000 XP',
          category: 'MILESTONE',
          rarity: 'legendary',
          unlockCriteria: { type: 'xp', value: 5000 },
          imageUrl: '/api/uploads/badges/trading-master.png',
          displayOrder: 15,
        },
        {
          name: 'Legendary Trader',
          description: 'Earn 10,000 XP',
          category: 'MILESTONE',
          rarity: 'legendary',
          unlockCriteria: { type: 'xp', value: 10000 },
          imageUrl: '/api/uploads/badges/legendary-trader.png',
          displayOrder: 16,
        },
        {
          name: 'Ultimate Champion',
          description: 'Earn 25,000 XP',
          category: 'SPECIAL',
          rarity: 'legendary',
          unlockCriteria: { type: 'xp', value: 25000 },
          imageUrl: '/api/uploads/badges/ultimate-champion.png',
          displayOrder: 17,
        },
        {
          name: 'Hall of Fame',
          description: 'Earn 50,000 XP',
          category: 'SPECIAL',
          rarity: 'legendary',
          unlockCriteria: { type: 'xp', value: 50000 },
          imageUrl: '/api/uploads/badges/hall-of-fame.png',
          displayOrder: 18,
        },
      ];

      const createdBadges = [];
      for (const badgeData of defaultBadges) {
        // Check if badge already exists
        const existing = await prisma.badge.findFirst({
          where: { name: badgeData.name },
        });

        if (!existing) {
          const badge = await prisma.badge.create({
            data: badgeData as any,
          });
          createdBadges.push(badge);
        }
      }

      res.json({
        message: `Seeded ${createdBadges.length} badges`,
        badges: createdBadges,
      });
    } catch (error) {
      console.error('Error seeding badges:', error);
      res.status(500).json({ error: 'Failed to seed badges' });
    }
  },
];
