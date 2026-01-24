import { Router } from 'express';
import { listForTier } from '../controllers/resources.controller';

const router = Router();

// GET /resources/:tierId
// - Free tiers: public access
// - Paid tiers: controller enforces purchase check based on req.user
router.get('/:tierId', listForTier as any);

export default router;
