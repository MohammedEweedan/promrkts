import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import pushNotificationService from '../services/pushNotification.service';
import prisma from '../config/prisma';

const router = Router();

/**
 * Register/update push token for the authenticated user
 */
router.post('/register-token', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { pushToken } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!pushToken) {
      return res.status(400).json({ message: 'Push token is required' });
    }

    await prisma.users.update({
      where: { id: userId },
      data: { 
        push_token: pushToken,
        push_notifications_enabled: true,
      },
    });

    res.json({ message: 'Push token registered successfully' });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ message: 'Failed to register push token' });
  }
});

/**
 * Toggle push notifications on/off
 */
router.put('/toggle', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { enabled } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await prisma.users.update({
      where: { id: userId },
      data: { push_notifications_enabled: enabled },
    });

    res.json({ message: `Push notifications ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('Error toggling push notifications:', error);
    res.status(500).json({ message: 'Failed to toggle push notifications' });
  }
});

/**
 * Send announcement (admin only)
 */
router.post('/announcement', authenticate, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { title, body, userIds } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    await pushNotificationService.sendAnnouncement(title, body, userIds);

    res.json({ message: 'Announcement sent successfully' });
  } catch (error) {
    console.error('Error sending announcement:', error);
    res.status(500).json({ message: 'Failed to send announcement' });
  }
});

/**
 * Send discount notification (admin only)
 */
router.post('/discount', authenticate, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { title, description, code, userIds } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    await pushNotificationService.notifyDiscount(userIds, { title, description, code });

    res.json({ message: 'Discount notification sent successfully' });
  } catch (error) {
    console.error('Error sending discount notification:', error);
    res.status(500).json({ message: 'Failed to send discount notification' });
  }
});

export default router;
