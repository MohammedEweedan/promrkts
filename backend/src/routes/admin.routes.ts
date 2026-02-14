// Users list for admin dashboard
import { listAdminsForAssign } from './../controllers/communications.controller';
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
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
  listModels,
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  bulkDeleteRecords,
  executeQuery,
  getModelSchema,
  getDatabaseStats,
} from '../controllers/dbAdmin.controller';

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

// KPI metrics for dashboard
router.get('/kpis', async (req, res) => {
  try {
    const [
      totalRevenue,
      totalUsers,
      activeUsers,
      totalPurchases,
      pendingVerifications,
      promoUsage,
      popularItems,
      recentActivity,
    ] = await Promise.all([
      // Total revenue from purchases - Purchase doesn't have amount field, using finalPriceUsd
      (prisma as any).Purchase.aggregate({ _sum: { finalPriceUsd: true } }).catch(() => ({ _sum: { finalPriceUsd: 0 } })),
      // Total users
      (prisma as any).users.count(),
      // Active users (logged in last 30 days) - field is last_login not last_login_at
      (prisma as any).users.count({ where: { last_login: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }).catch(() => 0),
      // Total purchases
      (prisma as any).Purchase.count(),
      // Pending verifications (using users with pending status)
      (prisma as any).users.count({ where: { status: 'pending' } }).catch(() => 0),
      // Promo code usage - Purchase uses promoId not promoCodeId
      (prisma as any).Purchase.groupBy({
        by: ['promoId'],
        _count: true,
        where: { promoId: { not: null } },
        orderBy: { _count: { promoId: 'desc' } },
        take: 5,
      }).catch(() => []),
      // Popular items (most purchased) - Purchase uses tierId not itemType/itemId
      (prisma as any).Purchase.groupBy({
        by: ['tierId'],
        _count: true,
        _sum: { finalPriceUsd: true },
        orderBy: { _count: { tierId: 'desc' } },
        take: 10,
      }).catch(() => []),
      // Recent activity count (last 7 days)
      (prisma as any).Purchase.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

    const kpis = {
      revenue: {
        total: totalRevenue._sum.finalPriceUsd || 0,
        currency: 'USD',
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
      },
      purchases: {
        total: totalPurchases,
        recent: recentActivity,
      },
      verifications: {
        pending: pendingVerifications,
      },
      promoUsage: await Promise.all(
        promoUsage.map(async (p: any) => {
          const promo = await (prisma as any).PromoCode.findUnique({ where: { id: p.promoId } });
          return { code: promo?.code || 'Unknown', uses: p._count };
        })
      ),
      popularItems: await Promise.all(
        popularItems.map(async (item: any) => {
          const tier = await (prisma as any).CourseTier.findUnique({ where: { id: item.tierId }, select: { name: true } }).catch(() => null);
          return {
            type: 'CourseTier',
            id: item.tierId,
            name: tier?.name || 'Unknown',
            purchases: item._count,
            revenue: item._sum.finalPriceUsd || 0,
          };
        })
      ),
    };

    return res.json({ data: kpis });
  } catch (e: any) {
    console.error('KPI error:', e);
    return res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

// Users list for admin dashboard
router.get('/users', listUsers);

// Verifications endpoint (using users with pending status)
router.get('/verifications', async (req, res) => {
  try {
    const { page = 1, limit = 25, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = status ? { status: String(status) } : {};
    
    const [verifications, total] = await Promise.all([
      (prisma as any).users.findMany({
        where,
        select: { id: true, name: true, email: true, status: true, role: true, created_at: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      (prisma as any).users.count({ where }),
    ]);
    
    return res.json({ verifications, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

// Approve verification (update user status)
router.post('/verifications/:id/approve', async (req, res) => {
  try {
    const updated = await (prisma as any).users.update({
      where: { id: req.params.id },
      data: { status: 'verified' },
    });
    return res.json({ data: updated });
  } catch (e: any) {
    return res.status(400).json({ error: 'Failed to approve' });
  }
});

// Reject verification (update user status)
router.post('/verifications/:id/reject', async (req, res) => {
  try {
    const updated = await (prisma as any).users.update({
      where: { id: req.params.id },
      data: { status: 'rejected' },
    });
    return res.json({ data: updated });
  } catch (e: any) {
    return res.status(400).json({ error: 'Failed to reject' });
  }
});

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

// Database Admin (TablePlus-like interface)
router.get('/db/models', listModels as any);
router.get('/db/stats', getDatabaseStats as any);
router.get('/db/:model/schema', getModelSchema as any);
router.get('/db/:model', getRecords as any);
router.get('/db/:model/:id', getRecord as any);
router.post('/db/:model', createRecord as any);
router.patch('/db/:model/:id', updateRecord as any);
router.delete('/db/:model/:id', deleteRecord as any);
router.post('/db/:model/bulk-delete', bulkDeleteRecords as any);
router.post('/db/query', executeQuery as any);

export default router;
