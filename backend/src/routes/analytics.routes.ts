import { Router } from 'express';
import { getTraffic, getRevenue, getCoursesAgg, trackEvent, getAdminExtras, getAiMovers, getAiMomentum, getAiNews, getAiLiveQuotes, getAiFearGreed, getAiMomentumIndex } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// public tracking endpoint
router.post('/track', trackEvent);

// public AI analytics endpoints
router.get('/ai/movers', getAiMovers as any);
router.get('/ai/momentum', getAiMomentum as any);
router.get('/ai/news', getAiNews as any);
router.get('/ai/liveQuotes', getAiLiveQuotes as any);
router.get('/ai/feargreed', getAiFearGreed as any);
router.get('/ai/momentumIndex', getAiMomentumIndex as any);

// admin analytics (require auth + admin)
router.get('/traffic', authenticate, authorize('admin'), ...(getTraffic as any));
router.get('/revenue', authenticate, authorize('admin'), ...(getRevenue as any));
router.get('/courses', authenticate, authorize('admin'), ...(getCoursesAgg as any));
router.get('/admin-extras', authenticate, authorize('admin'), ...(getAdminExtras as any));

export default router;
