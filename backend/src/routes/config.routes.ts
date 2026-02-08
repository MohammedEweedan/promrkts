import { Router } from 'express';
import { getFeatureFlags } from '../controllers/analytics.controller';

const router = Router();

// Public endpoint for feature flags
router.get('/feature-flags', getFeatureFlags);

export default router;
