// routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import coursesRoutes from './courses.routes';
import challengesRoutes from './challenges.routes';
import subscriptionsRoutes from './subscriptions.routes';
import purchaseRoutes from './purchase.routes';
import resourcesRoutes from './resources.routes';
import communityRoutes from './community.routes';
import brokerRoutes from './broker.routes';
import adminRoutes from './admin.routes';
import contentRoutes from './content.routes';
import devRoutes from './dev.routes';
import analyticsRoutes from './analytics.routes';
import paymentsRoutes from './payments.routes';
import contactRoutes from './contact.routes';
import communicationsRoutes from './communications.routes';
import careersRoutes from './careers.routes';
import promosRoutes from './promos.routes';
import progressRoutes from './progress.routes';
import badgesRoutes from './badges.routes';
import spinRoutes from './spin.routes';
import tokensRoutes from './tokens.routes';
import dashboardRoutes from './dashboard.routes';
import journalRoutes from './journal.routes';
import marketRoutes from './market.routes';
import socialRoutes from './social';
import groupsRoutes from './groups';
import uploadsRoutes from './uploads.routes';
import quizRoutes from './quiz.routes';
import notificationsRoutes from './notifications.routes';
import messagesRoutes from './messages.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/', contentRoutes);
router.use('/careers', careersRoutes);
// Education app endpoints
router.use('/courses', coursesRoutes);
router.use('/challenges', challengesRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/resources', resourcesRoutes);
router.use('/quizzes', quizRoutes);
router.use('/community', communityRoutes);
router.use('/broker', brokerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/contact', contactRoutes);
router.use('/communications', communicationsRoutes);
router.use('/promos', promosRoutes);
// Dev-only routes
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
	router.use('/dev', devRoutes);
}
router.use('/progress', progressRoutes);
router.use('/badges', badgesRoutes);
router.use('/spin', spinRoutes);
router.use('/tokens', tokensRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/journal', journalRoutes);
router.use('/market', marketRoutes);
router.use('/social', socialRoutes);
router.use('/groups', groupsRoutes);
router.use('/upload', uploadsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/messages', messagesRoutes);

export default router;
