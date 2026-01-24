import { Router } from 'express';
import { spinWheel } from '../controllers/spin.controller';

const router = Router();

// Public visitor spin endpoint
router.post('/', spinWheel);

export default router;
