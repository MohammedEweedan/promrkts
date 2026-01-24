import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/authJwt';
import { markCourseEngagement } from '../services/journey.service';
import { refreshEntitlements } from '../services/entitlements.service';

// XP calculation constants
const XP_REWARDS = {
  VIDEO_WATCHED: 50,
  PDF_VIEWED: 30,
  LESSON_COMPLETED: 100,
  COURSE_COMPLETED: 500,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 20, // per day of streak
};

const XP_PER_LEVEL = 1000; // XP needed to level up

// Helper: Calculate level from XP
function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// Helper: Update streak
async function updateStreak(userId: string, progressId: string) {
  const progress = await prisma.studentProgress.findUnique({
    where: { id: progressId },
  });

  if (!progress) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActive = progress.lastActiveDate
    ? new Date(progress.lastActiveDate.getFullYear(), progress.lastActiveDate.getMonth(), progress.lastActiveDate.getDate())
    : null;

  let newStreak = progress.streak;

  if (!lastActive) {
    // First activity
    newStreak = 1;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Same day: keep streak, but refresh lastActiveDate
      await prisma.studentProgress.update({
        where: { id: progressId },
        data: { lastActiveDate: now },
      });
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak = progress.streak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  await prisma.studentProgress.update({
    where: { id: progressId },
    data: {
      streak: newStreak,
      lastActiveDate: now,
    },
  });
}

// Helper: Record daily activity
async function recordDailyActivity(
  userId: string,
  activity: {
    lessonsCompleted?: number;
    videosWatched?: number;
    pdfsViewed?: number;
    timeSpent?: number;
    xpEarned?: number;
  }
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyActivity.upsert({
    where: {
      userId_activityDate: {
        userId,
        activityDate: today,
      },
    },
    create: {
      userId,
      activityDate: today,
      lessonsCompleted: activity.lessonsCompleted || 0,
      videosWatched: activity.videosWatched || 0,
      pdfsViewed: activity.pdfsViewed || 0,
      timeSpent: activity.timeSpent || 0,
      xpEarned: activity.xpEarned || 0,
    },
    update: {
      lessonsCompleted: { increment: activity.lessonsCompleted || 0 },
      videosWatched: { increment: activity.videosWatched || 0 },
      pdfsViewed: { increment: activity.pdfsViewed || 0 },
      timeSpent: { increment: activity.timeSpent || 0 },
      xpEarned: { increment: activity.xpEarned || 0 },
    },
  });
}

// GET /api/progress/course/:tierId - Get progress for a specific course
export const getCourseProgress = [
  requireAuth,
  async (req: Request & { user?: any }, res: Response) => {
    const { tierId } = req.params;
    let userId = req.user!.sub;
    const override = req.headers['x-user-id'] as string | string[] | undefined;
    if (override && req.user?.role === 'admin') {
      userId = Array.isArray(override) ? override[0] : String(override);
    }

    try {
      let progress = await prisma.studentProgress.findUnique({
        where: {
          userId_tierId: {
            userId,
            tierId,
          },
        },
        include: {
          resourceProgress: {
            include: {
              resource: true,
            },
          },
          tier: {
            include: {
              resources: true,
            },
          },
        },
      });

      // Create progress record if it doesn't exist
      if (!progress) {
        progress = await prisma.studentProgress.create({
          data: {
            userId,
            tierId,
          },
          include: {
            resourceProgress: {
              include: {
                resource: true,
              },
            },
            tier: {
              include: {
                resources: true,
              },
            },
          },
        });
      }

      // Calculate completion percentage
      const totalResources = progress.tier.resources.length;
      const completedResources = progress.resourceProgress.filter((rp: any) => rp.completed).length;
      const completionPercentage = totalResources > 0 ? (completedResources / totalResources) * 100 : 0;

      res.json({
        ...progress,
        completionPercentage,
        totalResources,
        completedResources,
      });
    } catch (error) {
      console.error('Error fetching course progress:', error);
      res.status(500).json({ error: 'Failed to fetch progress' });
    }
  },
];

// GET /api/progress/overview - Get overall progress across all courses
export const getProgressOverview = [
  requireAuth,
  async (req: Request & { user?: any }, res: Response) => {
    let userId = req.user!.sub;
    const override = req.headers['x-user-id'] as string | string[] | undefined;
    if (override && req.user?.role === 'admin') {
      userId = Array.isArray(override) ? override[0] : String(override);
    }

    try {
      const allProgress = await prisma.studentProgress.findMany({
        where: { userId },
        include: {
          tier: true,
          resourceProgress: true,
        },
      });

      const totalXP = allProgress.reduce((sum: number, p: any) => sum + p.xp, 0);
      const totalLevel = calculateLevel(totalXP);
      const maxStreak = Math.max(...allProgress.map((p: any) => p.streak), 0);
      const coursesCompleted = allProgress.filter((p: any) => p.completedAt).length;
      const coursesInProgress = allProgress.filter((p: any) => !p.completedAt).length;

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivity = await prisma.dailyActivity.findMany({
        where: {
          userId,
          activityDate: { gte: sevenDaysAgo },
        },
        orderBy: { activityDate: 'desc' },
      });

      res.json({
        totalXP,
        totalLevel,
        maxStreak,
        coursesCompleted,
        coursesInProgress,
        totalCourses: allProgress.length,
        recentActivity,
        courses: allProgress.map((p: any) => ({
          tierId: p.tierId,
          tierName: p.tier.name,
          level: p.level,
          xp: p.xp,
          streak: p.streak,
          completedAt: p.completedAt,
          lessonsCompleted: p.lessonsCompleted,
          videosWatched: p.videosWatched,
          pdfsViewed: p.pdfsViewed,
          completionPercentage:
            p.resourceProgress.length > 0
              ? (p.resourceProgress.filter((rp: any) => rp.completed).length / p.resourceProgress.length) * 100
              : 0,
        })),
      });
    } catch (error) {
      console.error('Error fetching progress overview:', error);
      res.status(500).json({ error: 'Failed to fetch progress overview' });
    }
  },
];

// POST /api/progress/resource/:resourceId - Track resource progress (video/PDF)
// resourceId is now a URL hash (base64 encoded URL)
export const trackResourceProgress = [
  requireAuth,
  async (req: Request & { user?: any }, res: Response) => {
    const { resourceId } = req.params; // This is now a URL hash
    const { completed, timeSpent, lastPosition, resourceType, tierId } = req.body;
    const userId = req.user!.sub;

    try {
      console.log('📊 Tracking progress:', { resourceId, completed, resourceType, tierId, userId });

      if (!tierId) {
        return res.status(400).json({ error: 'tierId is required' });
      }

      if (!resourceType || !['video', 'pdf'].includes(resourceType)) {
        return res.status(400).json({ error: 'resourceType must be "video" or "pdf"' });
      }

      // Get or create student progress for this course
      let progress = await prisma.studentProgress.findUnique({
        where: {
          userId_tierId: {
            userId,
            tierId,
          },
        },
      });

      if (!progress) {
        console.log('📝 Creating new student progress for tier:', tierId);
        progress = await prisma.studentProgress.create({
          data: {
            userId,
            tierId,
          },
        });
      }

      // Create a synthetic resource ID for tracking (we'll use the hash as the resource ID)
      // First, check if a Resource record exists for this URL hash
      let resource = await prisma.resource.findFirst({
        where: {
          tierId,
          url: resourceId, // Store the hash as the URL for tracking purposes
        },
      });

      // If no resource exists, create one
      if (!resource) {
        console.log('📝 Creating new resource record for hash:', resourceId);
        resource = await prisma.resource.create({
          data: {
            tierId,
            type: resourceType as 'video' | 'pdf',
            url: resourceId, // Use hash as identifier
          },
        });
      }

      // Get or create resource progress
      const existingResourceProgress = await prisma.resourceProgress.findUnique({
        where: {
          progressId_resourceId: {
            progressId: progress.id,
            resourceId: resource.id,
          },
        },
      });

      const wasCompleted = existingResourceProgress?.completed || false;
      const isNewCompletion = completed && !wasCompleted;

      console.log('🔍 Progress check:', { wasCompleted, isNewCompletion, completed });

      // Update resource progress
      const resourceProgress = await prisma.resourceProgress.upsert({
        where: {
          progressId_resourceId: {
            progressId: progress.id,
            resourceId: resource.id,
          },
        },
        create: {
          progressId: progress.id,
          resourceId: resource.id,
          completed: completed || false,
          timeSpent: timeSpent || 0,
          lastPosition: lastPosition || 0,
          completedAt: completed ? new Date() : null,
        },
        update: {
          completed: completed !== undefined ? completed : undefined,
          timeSpent: timeSpent !== undefined ? { increment: timeSpent } : undefined,
          lastPosition: lastPosition !== undefined ? lastPosition : undefined,
          completedAt: completed && !wasCompleted ? new Date() : undefined,
        },
      });

      // Award XP if newly completed
      let xpEarned = 0;
      if (isNewCompletion) {
        console.log('🎉 New completion! Awarding XP for:', resourceType);
        if (resourceType === 'video') {
          xpEarned = XP_REWARDS.VIDEO_WATCHED;
          await prisma.studentProgress.update({
            where: { id: progress.id },
            data: {
              videosWatched: { increment: 1 },
              xp: { increment: xpEarned },
            },
          });
        } else if (resourceType === 'pdf') {
          xpEarned = XP_REWARDS.PDF_VIEWED;
          await prisma.studentProgress.update({
            where: { id: progress.id },
            data: {
              pdfsViewed: { increment: 1 },
              xp: { increment: xpEarned },
            },
          });
        }

        // Update level
        const updatedProgress = await prisma.studentProgress.findUnique({
          where: { id: progress.id },
        });
        const newLevel = calculateLevel(updatedProgress!.xp);
        if (newLevel !== updatedProgress!.level) {
          await prisma.studentProgress.update({
            where: { id: progress.id },
            data: { level: newLevel },
          });
        }

        // Update streak
        await updateStreak(userId, progress.id);

        // Record daily activity
        await recordDailyActivity(userId, {
          videosWatched: resourceType === 'video' ? 1 : 0,
          pdfsViewed: resourceType === 'pdf' ? 1 : 0,
          timeSpent: timeSpent || 0,
          xpEarned,
        });

        // Check for badge unlocks
        await checkAndUnlockBadges(userId);

        // Ensure journey/entitlements reflect latest activity
        await markCourseEngagement(userId);
        await refreshEntitlements(userId);
      }

      res.json({
        resourceProgress,
        xpEarned,
        message: isNewCompletion ? 'Resource completed! XP awarded.' : 'Progress updated.',
      });
    } catch (error) {
      console.error('Error tracking resource progress:', error);
      res.status(500).json({ error: 'Failed to track progress' });
    }
  },
];

// POST /api/progress/lesson/:tierId - Mark lesson as completed
export const markLessonCompleted = [
  requireAuth,
  async (req: Request & { user?: any }, res: Response) => {
    const { tierId } = req.params;
    const userId = req.user!.sub;

    try {
      // Get or create progress
      let progress = await prisma.studentProgress.findUnique({
        where: {
          userId_tierId: {
            userId,
            tierId,
          },
        },
        include: {
          tier: {
            include: {
              resources: true,
            },
          },
        },
      });

      if (!progress) {
        progress = await prisma.studentProgress.create({
          data: {
            userId,
            tierId,
          },
          include: {
            tier: {
              include: {
                resources: true,
              },
            },
          },
        });
      }

      // Award XP
      const xpEarned = XP_REWARDS.LESSON_COMPLETED;
      const updatedProgress = await prisma.studentProgress.update({
        where: { id: progress.id },
        data: {
          lessonsCompleted: { increment: 1 },
          xp: { increment: xpEarned },
        },
      });

      // Update level
      const newLevel = calculateLevel(updatedProgress.xp);
      if (newLevel !== updatedProgress.level) {
        await prisma.studentProgress.update({
          where: { id: progress.id },
          data: { level: newLevel },
        });
      }

      // Update streak
      await updateStreak(userId, progress.id);

      // Record daily activity
      await recordDailyActivity(userId, {
        lessonsCompleted: 1,
        xpEarned,
      });

      // Check if course is completed
      const allResources = progress.tier.resources;
      const completedResources = await prisma.resourceProgress.count({
        where: {
          progressId: progress.id,
          completed: true,
        },
      });

      if (allResources.length > 0 && completedResources === allResources.length && !progress.completedAt) {
        // Course completed!
        const courseXP = XP_REWARDS.COURSE_COMPLETED;
        await prisma.studentProgress.update({
          where: { id: progress.id },
          data: {
            completedAt: new Date(),
            xp: { increment: courseXP },
          },
        });

        await recordDailyActivity(userId, {
          xpEarned: courseXP,
        });

        // Check for badge unlocks
        await checkAndUnlockBadges(userId);

        return res.json({
          message: 'Course completed! Congratulations!',
          xpEarned: xpEarned + courseXP,
          courseCompleted: true,
        });
      }

      // Check for badge unlocks
      await checkAndUnlockBadges(userId);

      res.json({
        message: 'Lesson completed! XP awarded.',
        xpEarned,
        courseCompleted: false,
      });
    } catch (error) {
      console.error('Error marking lesson completed:', error);
      res.status(500).json({ error: 'Failed to mark lesson completed' });
    }
  },
];

// Helper: Check and unlock badges
async function checkAndUnlockBadges(userId: string) {
  try {
    // Get all active badges
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
    });

    // Get user's current badges
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

    // Check each badge
    for (const badge of badges) {
      if (unlockedBadgeIds.has(badge.id)) continue; // Already unlocked

      const criteria = badge.unlockCriteria as any;
      let shouldUnlock = false;

      switch (criteria.type) {
        case 'videos_watched':
          shouldUnlock = totalVideosWatched >= (criteria.count || 0);
          break;
        case 'pdfs_viewed':
          shouldUnlock = totalPdfsViewed >= (criteria.count || 0);
          break;
        case 'lessons_completed':
          shouldUnlock = totalLessonsCompleted >= (criteria.count || 0);
          break;
        case 'courses_completed':
          shouldUnlock = coursesCompleted >= (criteria.count || 0);
          break;
        case 'streak':
          shouldUnlock = maxStreak >= (criteria.days || 0);
          break;
        case 'level':
          shouldUnlock = calculateLevel(totalXP) >= (criteria.level || 0);
          break;
        case 'course_completed':
          // Check if specific course is completed
          if (criteria.tierId) {
            const courseProgress = allProgress.find((p: any) => p.tierId === criteria.tierId);
            shouldUnlock = !!courseProgress?.completedAt;
          }
          break;
      }

      if (shouldUnlock) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}

// GET /api/progress/leaderboard - Get leaderboard (top students by XP)
export const getLeaderboard = [
  async (_req: Request, res: Response) => {
    try {
      // Get all users with their total XP
      const users = await prisma.users.findMany({
        where: {
          role: { in: ['user', 'student', 'fake_user'] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          studentProgress: {
            select: {
              xp: true,
              level: true,
            },
          },
        },
      });

      const leaderboard = users
        .map((user: any) => {
          const totalXP = user.studentProgress.reduce((sum: number, p: any) => sum + p.xp, 0);
          const level = calculateLevel(totalXP);
          return {
            userId: user.id,
            name: user.name || user.email,
            totalXP,
            level,
          };
        })
        .sort((a: any, b: any) => b.totalXP - a.totalXP)
        .slice(0, 100); // Top 100

      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  },
];
