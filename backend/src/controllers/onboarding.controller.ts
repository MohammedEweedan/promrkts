import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  user?: { id: string };
}

// GET /progress/onboarding - Get user's onboarding state
export const getOnboardingState = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Try to find existing onboarding record
    const onboarding = await prisma.$queryRaw<Array<{
      profile_completed: boolean;
      first_widget_added: boolean;
      layout_saved: boolean;
      course_viewed: boolean;
      completed_at: Date | null;
      skipped_at: Date | null;
      current_step: number;
    }>>`
      SELECT 
        profile_completed,
        first_widget_added,
        layout_saved,
        course_viewed,
        completed_at,
        skipped_at,
        current_step
      FROM user_onboarding
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `;

    if (onboarding && onboarding.length > 0) {
      const record = onboarding[0];
      return res.json({
        profileCompleted: record.profile_completed,
        firstWidgetAdded: record.first_widget_added,
        layoutSaved: record.layout_saved,
        courseViewed: record.course_viewed,
        completedAt: record.completed_at,
        skippedAt: record.skipped_at,
        currentStep: record.current_step,
      });
    }

    // Return default state for new users
    return res.json({
      profileCompleted: false,
      firstWidgetAdded: false,
      layoutSaved: false,
      courseViewed: false,
      completedAt: null,
      skippedAt: null,
      currentStep: 0,
    });
  } catch (e) {
    console.error('[Onboarding] getOnboardingState error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /progress/onboarding - Update user's onboarding state
export const updateOnboardingState = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      profileCompleted,
      firstWidgetAdded,
      layoutSaved,
      courseViewed,
      completedAt,
      skippedAt,
      currentStep,
    } = req.body;

    // Upsert onboarding record
    await prisma.$executeRaw`
      INSERT INTO user_onboarding (
        user_id,
        profile_completed,
        first_widget_added,
        layout_saved,
        course_viewed,
        completed_at,
        skipped_at,
        current_step,
        updated_at
      ) VALUES (
        ${userId}::uuid,
        ${profileCompleted ?? false},
        ${firstWidgetAdded ?? false},
        ${layoutSaved ?? false},
        ${courseViewed ?? false},
        ${completedAt ? new Date(completedAt) : null},
        ${skippedAt ? new Date(skippedAt) : null},
        ${currentStep ?? 0},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        profile_completed = EXCLUDED.profile_completed,
        first_widget_added = EXCLUDED.first_widget_added,
        layout_saved = EXCLUDED.layout_saved,
        course_viewed = EXCLUDED.course_viewed,
        completed_at = EXCLUDED.completed_at,
        skipped_at = EXCLUDED.skipped_at,
        current_step = EXCLUDED.current_step,
        updated_at = NOW()
    `;

    return res.json({ ok: true });
  } catch (e) {
    console.error('[Onboarding] updateOnboardingState error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
