import { Router } from 'express';
import { createPurchase, myPurchases, confirmPurchase, adminSetPurchaseStatus, adminListPendingPurchases, adminGetMetrics } from '../controllers/purchase.controller';

const router = Router();
router.post('/create', ...(createPurchase as any));
router.get('/mine', ...(myPurchases as any));
router.post('/confirm', ...(confirmPurchase as any));
// fallback alias
router.post('/proof', ...(confirmPurchase as any));
// admin-only status change
router.patch('/admin/:id/status', ...(adminSetPurchaseStatus as any));
// admin-only list
router.get('/admin/pending', ...(adminListPendingPurchases as any));
// admin-only metrics
router.get('/admin/metrics', ...(adminGetMetrics as any));
export default router;
