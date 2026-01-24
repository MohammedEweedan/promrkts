import { Router } from 'express';
import { unlock, status, activateVip } from '../controllers/community.controller';

const router = Router();
router.post('/unlock', ...(unlock as any));
router.get('/status', ...(status as any));
router.post('/vip/activate', ...(activateVip as any));
export default router;
