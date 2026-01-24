import { Router } from 'express';
import {
  getAllBadges,
  getMyBadges,
  getBadgeProgress,
  createBadge,
  updateBadge,
  deleteBadge,
  seedDefaultBadges,
} from '../controllers/badges.controller';

const router = Router();

// Public routes
router.get('/', ...getAllBadges);

// User routes (authenticated)
router.get('/my', ...getMyBadges);
router.get('/progress', ...getBadgeProgress);

// Admin routes
router.post('/', ...createBadge);
router.put('/:id', ...updateBadge);
router.delete('/:id', ...deleteBadge);
router.post('/seed', ...seedDefaultBadges);

export default router;
