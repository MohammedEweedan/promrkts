import { Router } from 'express';
import {
  getCourseProgress,
  getProgressOverview,
  trackResourceProgress,
  markLessonCompleted,
  getLeaderboard,
} from '../controllers/progress.controller';

const router = Router();

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
