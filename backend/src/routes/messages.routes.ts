import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  generateEncryptionKeys,
  getPublicKey,
  sendMessage,
  getConversation,
  getConversations,
  deleteMessage,
  markAsRead,
  loadEncryptionKeys,
} from '../controllers/messages.controller';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Encryption key management
router.post('/keys/generate', generateEncryptionKeys);
router.get('/keys/:userId', getPublicKey);

// Message routes (require encryption keys)
router.post('/', loadEncryptionKeys, sendMessage);
router.get('/conversation/:userId', loadEncryptionKeys, getConversation);
router.get('/conversations', getConversations);
router.delete('/:messageId', deleteMessage);
router.patch('/:messageId/read', markAsRead);

export default router;
