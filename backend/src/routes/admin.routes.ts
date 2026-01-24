// Users list for admin dashboard
import { listAdminsForAssign } from './../controllers/communications.controller';
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  verifyUser,
  verifyBusiness,
  createRecommendedRoute,
  createPopularTrip,
  createTicketOffer,
  createPopularDestination,
  createBanner,
  updateBanner,
  deleteBanner,
  listUnverifiedUsers,
  listUnverifiedBusinesses,
  listPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  uploadMedia,
  listUsers,
} from '../controllers/admin.controller';

import { listPrizes, createPrize, createPrizeDraw } from '../controllers/prizes.controller';
import { createFakeUsers, seedMixedReviews } from '../controllers/fakes.controller';

import {
  listCommunications,
  getCommunicationAdmin,
  updateCommunication,
  setPriority,
  escalateCommunication,
  closeCommunication,
  resolveCommunication,
  assignCommunication,
  replyToCommunication,
} from '../controllers/communications.controller';

import {
  listChallengeAccounts,
  listChallengeTiers,
  updateChallengeTier,
  updateChallengeAccount,
  upsertChallengeDaily,
  getChallengeMetrics,
  createChallengePayout,
} from '../controllers/challengesAdmin.controller';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// Users list for admin dashboard
router.get('/users', listUsers);

// Verify accounts
router.post('/users/:id/verify', verifyUser);
router.post('/businesses/:id/verify', verifyBusiness);
router.get('/users/pending', listUnverifiedUsers);
router.get('/businesses/pending', listUnverifiedBusinesses);

// Content / uploads / banners
router.post('/content/recommended-route', createRecommendedRoute);
router.post('/content/popular-trip', createPopularTrip);
router.post('/offers/ticket', createTicketOffer);
router.post('/destinations/popular', createPopularDestination);
router.post('/upload', uploadMedia);
router.post('/content/banner', createBanner);
router.put('/content/banner/:id', updateBanner);
router.delete('/content/banner/:id', deleteBanner);

// Promos admin (Prisma `PromoCode`)
router.get('/promos', listPromoCodes);
router.post('/promos', createPromoCode);
router.patch('/promos/:id', updatePromoCode);
router.delete('/promos/:id', deletePromoCode);

// Prizes & draws
router.get('/prizes', listPrizes);
router.post('/prizes', createPrize);
router.post('/prizes/:id/draw', createPrizeDraw);

// Fake data helpers
router.post('/fakes/users', createFakeUsers);
router.post('/fakes/reviews', seedMixedReviews);

// Admins list (for assignment dropdowns)
router.get('/admins', listAdminsForAssign);

// Communications admin (under /admin/communications)
router.get('/communications', listCommunications);
router.get('/communications/:id', getCommunicationAdmin);
router.patch('/communications/:id', updateCommunication); // read flag, etc.
router.patch('/communications/:id/priority', setPriority);
router.patch('/communications/:id/escalate', escalateCommunication);
router.patch('/communications/:id/close', closeCommunication);
router.patch('/communications/:id/resolve', resolveCommunication);
router.patch('/communications/:id/assign', assignCommunication);
router.post('/communications/:id/reply', replyToCommunication);

// Challenges (MT5) admin
router.get('/challenges/metrics', getChallengeMetrics as any);
router.get('/challenges/tiers', listChallengeTiers as any);
router.patch('/challenges/tiers/:id', updateChallengeTier as any);
router.get('/challenges/accounts', listChallengeAccounts as any);
router.patch('/challenges/accounts/:id', updateChallengeAccount as any);
router.post('/challenges/accounts/:id/daily', upsertChallengeDaily as any);
router.post('/challenges/accounts/:id/payouts', createChallengePayout as any);

export default router;
