import { Router } from 'express';
import { handleInboundEmail } from '../controllers/inbound-email.controller';

const router = Router();

// Resend inbound webhook — receives all incoming emails to *@promrkts.com
router.post('/inbound', handleInboundEmail);

export default router;
