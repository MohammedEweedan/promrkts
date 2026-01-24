import { Router } from 'express';
import { signup } from '../controllers/broker.controller';

const router = Router();
router.get('/signup', signup);
export default router;
