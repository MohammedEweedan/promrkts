import { Router } from 'express';
import { getCohortPromo } from '../controllers/promo.controller';

const router = Router();

// Public promos endpoints
router.get('/cohort', getCohortPromo);

export default router;
