import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createPaymentIntent, confirmPayment, confirmProof, createVipSubscription, stripeWebhook } from '../controllers/payments.controller';

const router = Router();

router.post('/stripe/webhook', stripeWebhook);

router.post('/intent', authenticate, createPaymentIntent);
router.post('/confirm', authenticate, confirmPayment);
router.post('/proof', authenticate, confirmProof);
router.post('/vip', authenticate, createVipSubscription);

export default router;
