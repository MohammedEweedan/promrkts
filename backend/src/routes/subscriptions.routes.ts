import { Router } from 'express';
import { listSubscriptions, getSubscription } from '../controllers/subscriptions.controller';

const router = Router();

// Public routes - anyone can view subscription options
router.get('/', listSubscriptions);
router.get('/:id', getSubscription);

export default router;
