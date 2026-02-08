import { Router } from 'express';
import {
  getCourseProgress,
  getProgressOverview,
  trackResourceProgress,
  markLessonCompleted,
  getLeaderboard,
} from '../controllers/progress.controller';
import { getOnboardingState, updateOnboardingState } from '../controllers/onboarding.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Onboarding endpoints
router.get('/onboarding', authenticate, getOnboardingState);
router.post('/onboarding', authenticate, updateOnboardingState);

// Get progress for a specific course
router.get('/course/:tierId', ...getCourseProgress);

// Get overall progress across all courses
router.get('/overview', ...getProgressOverview);

// Track resource progress (video/PDF)
router.post('/resource/:resourceId', ...trackResourceProgress);

// Mark lesson as completed
router.post('/lesson/:tierId', ...markLessonCompleted);

// Get leaderboard
router.get('/leaderboard', ...getLeaderboard);

export default router;
