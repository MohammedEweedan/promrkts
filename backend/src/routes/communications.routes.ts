import { Router } from 'express';
import {
  createCommunication,
  getCommunicationPublic,
  assignCommunication,
  setPriority,
  escalateCommunication,
  getMyCommunications,
  closeCommunication,
  // NEW:
  getAvailability,
  scheduleCall,
} from '../controllers/communications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public endpoint for contact form submissions
router.post('/', createCommunication);

// NEW — scheduling
router.get('/availability', getAvailability);
router.post('/schedule', scheduleCall);

// Public ticket tracking
router.get('/track/:ticketId', getCommunicationPublic);

// Auth
router.get('/my', authenticate, getMyCommunications);

// Admin-ish
router.patch('/communications/:id/assign', assignCommunication);
router.patch('/communications/:id/priority', setPriority);
router.patch('/communications/:id/escalate', escalateCommunication);
router.patch('/communications/:id/close', closeCommunication);

export default router;
