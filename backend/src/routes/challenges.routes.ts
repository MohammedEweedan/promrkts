import { Router } from 'express';
import { listChallenges, getChallenge } from '../controllers/challenges.controller';
import { getReadinessStatus } from '../controllers/readiness.controller';

const router = Router();
router.get('/', listChallenges);
router.get('/readiness', ...getReadinessStatus);
router.get('/:id', getChallenge);
export default router;
