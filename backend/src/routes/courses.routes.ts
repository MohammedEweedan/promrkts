import { Router } from 'express';
import { listTiers, getTier, createTier, updateTier, deleteTier, listReviews, createReview, createResource, deleteResource, markCompletion } from '../controllers/courses.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.get('/', listTiers);
router.get('/:id', getTier);
router.get('/:id/reviews', listReviews);
router.post('/:id/reviews', authenticate, createReview);
// Mark completion
router.post('/:id/complete', authenticate, markCompletion);
// Admin CRUD
router.post('/', authenticate, authorize('admin'), createTier);
router.put('/:id', authenticate, authorize('admin'), updateTier);
router.delete('/:id', authenticate, authorize('admin'), deleteTier);
// Admin: course materials (resources)
router.post('/:id/resources', authenticate, authorize('admin'), createResource);
router.delete('/resources/:rid', authenticate, authorize('admin'), deleteResource);
export default router;
