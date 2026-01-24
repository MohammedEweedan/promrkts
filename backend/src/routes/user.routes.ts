import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getMe,
  updateMe,
  getUserStats,
  getUserSignups,
  getMyJourney,
  getMyEntitlements,
} from '../controllers/user.controller';

const router = Router();

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.get('/me/journey', authenticate, getMyJourney);
router.get('/me/entitlements', authenticate, getMyEntitlements);
// admin analytics
router.get('/stats', authenticate, authorize('admin'), getUserStats);
router.get('/signups', authenticate, authorize('admin'), getUserSignups);

export default router;
