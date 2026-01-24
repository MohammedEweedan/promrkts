import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/authJwt';
import { ensureJourney, setEvalReady } from '../services/journey.service';

type AuthedRequest = Request & { user?: { sub: string } };

const READINESS_QUIZ_SLUG = 'eval-readiness';

export const getReadinessStatus = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const userId = req.user!.sub;

    const journey = await ensureJourney(userId);

    const [quiz, purchases, progressCount, layoutExists] = await Promise.all([
      prisma.quiz.findUnique({ where: { slug: READINESS_QUIZ_SLUG }, select: { id: true } }),
      prisma.purchase.findMany({
        where: { userId, status: 'CONFIRMED' as any },
        include: { tier: true },
      }),
      prisma.studentProgress.count({
        where: {
          userId,
          OR: [
            { lessonsCompleted: { gt: 0 } },
            { videosWatched: { gt: 0 } },
            { pdfsViewed: { gt: 0 } },
            { completedAt: { not: null } },
          ],
        },
      }),
      prisma.dashboardLayout.findFirst({
        where: {
          workspace: {
            userId,
          },
        },
        select: { id: true },
      }),
    ]);

    let quizPassed = false;
    if (quiz) {
      const attempt = await prisma.quizAttempt.findFirst({
        where: { userId, quizId: quiz.id, passed: true },
      });
      quizPassed = Boolean(attempt);
    }

    const hasCoursePurchase = purchases.some((p: any) => p.tier?.productType === 'COURSE');
    const hasCourseProgress = progressCount > 0;
    const hasDashboardLayout = Boolean(layoutExists);

    const ready = journey.evalReady || quizPassed;
    if (quizPassed && !journey.evalReady) {
      await setEvalReady(userId, true);
    }

    const requirements = {
      quizPassed,
      hasCoursePurchase,
      hasCourseProgress,
      hasDashboardLayout,
    };

    const missing = Object.entries(requirements)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    return res.json({
      ready,
      stage: journey.stage,
      requirements,
      missing,
    });
  },
];
