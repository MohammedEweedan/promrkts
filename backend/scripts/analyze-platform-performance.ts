// scripts/analyze-platform-performance.ts
// Analyze platform performance with 50K users: database queries, leaderboard, revenue

import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

const prisma = new PrismaClient() as any;

async function measureQuery<T>(name: string, queryFn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await queryFn();
  const end = performance.now();
  const time = end - start;
  
  console.log(`  ⏱️  ${name}: ${time.toFixed(2)}ms`);
  return { result, time };
}

async function analyzeUserQueries() {
  console.log('\n👥 User Query Performance:');
  
  await measureQuery('Count all users', async () => {
    return await prisma.users.count();
  });

  await measureQuery('Get user by email (indexed)', async () => {
    return await prisma.users.findUnique({
      where: { email: 'mohammed.almansour0@gmail.com' },
    });
  });

  await measureQuery('Get user with purchases', async () => {
    return await prisma.users.findFirst({
      include: {
        purchases: {
          include: { tier: true },
          where: { status: 'CONFIRMED' },
        },
      },
    });
  });

  await measureQuery('Get active users (last 30 days)', async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return await prisma.users.count({
      where: {
        last_login: { gte: thirtyDaysAgo },
      },
    });
  });
}

async function analyzeLeaderboardQueries() {
  console.log('\n🏆 Leaderboard Query Performance:');

  await measureQuery('Top 100 by XP (leaderboard)', async () => {
    return await prisma.studentProgress.findMany({
      take: 100,
      orderBy: { xp: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        tier: {
          select: { id: true, name: true },
        },
      },
    });
  });

  await measureQuery('Top 100 by level', async () => {
    return await prisma.studentProgress.findMany({
      take: 100,
      orderBy: [{ level: 'desc' }, { xp: 'desc' }],
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  });

  await measureQuery('Top 100 by streak', async () => {
    return await prisma.studentProgress.findMany({
      take: 100,
      orderBy: { streak: 'desc' },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  });

  await measureQuery('User rank calculation (single user)', async () => {
    const user = await prisma.users.findFirst();
    if (!user) return null;

    const progress = await prisma.studentProgress.findFirst({
      where: { userId: user.id },
    });

    if (!progress) return null;

    return await prisma.studentProgress.count({
      where: { xp: { gt: progress.xp } },
    });
  });
}

async function analyzePurchaseQueries() {
  console.log('\n💰 Purchase & Revenue Query Performance:');

  await measureQuery('Count all purchases', async () => {
    return await prisma.purchase.count();
  });

  await measureQuery('Count confirmed purchases', async () => {
    return await prisma.purchase.count({
      where: { status: 'CONFIRMED' },
    });
  });

  await measureQuery('Total revenue (all time)', async () => {
    const result = await prisma.purchase.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { finalPriceUsd: true },
    });
    return result._sum.finalPriceUsd;
  });

  await measureQuery('Revenue by course tier', async () => {
    return await prisma.$queryRaw`
      SELECT 
        ct.name,
        COUNT(p.id) as purchase_count,
        SUM(p."finalPriceUsd")::float as total_revenue,
        AVG(p."finalPriceUsd")::float as avg_price
      FROM "Purchase" p
      JOIN "CourseTier" ct ON ct.id = p."tierId"
      WHERE p.status = 'CONFIRMED'
      GROUP BY ct.id, ct.name
      ORDER BY total_revenue DESC
    `;
  });

  await measureQuery('Monthly revenue trend', async () => {
    return await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(id) as purchases,
        SUM("finalPriceUsd")::float as revenue
      FROM "Purchase"
      WHERE status = 'CONFIRMED'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;
  });
}

async function analyzeProgressQueries() {
  console.log('\n📈 Progress & Activity Query Performance:');

  await measureQuery('Count all progress records', async () => {
    return await prisma.studentProgress.count();
  });

  await measureQuery('Average XP across all users', async () => {
    return await prisma.studentProgress.aggregate({
      _avg: { xp: true, level: true, streak: true },
    });
  });

  await measureQuery('Completion rate', async () => {
    const total = await prisma.studentProgress.count();
    const completed = await prisma.studentProgress.count({
      where: { completedAt: { not: null } },
    });
    return { total, completed, rate: (completed / total) * 100 };
  });

  await measureQuery('Daily active users (today)', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await prisma.dailyActivity.count({
      where: { activityDate: today },
    });
  });

  await measureQuery('Total time spent (all time)', async () => {
    const result = await prisma.dailyActivity.aggregate({
      _sum: { timeSpent: true },
    });
    return result._sum.timeSpent;
  });
}

async function analyzeCourseQueries() {
  console.log('\n📚 Course & Review Query Performance:');

  await measureQuery('Get all courses with reviews', async () => {
    return await prisma.courseTier.findMany({
      include: {
        reviews: {
          take: 5,
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: { purchases: true, reviews: true },
        },
      },
    });
  });

  await measureQuery('Average rating per course', async () => {
    return await prisma.$queryRaw`
      SELECT 
        ct.id,
        ct.name,
        COUNT(cr.id) as review_count,
        AVG(cr.rating)::float as avg_rating
      FROM "CourseTier" ct
      LEFT JOIN "CourseReview" cr ON cr."tierId" = ct.id
      GROUP BY ct.id, ct.name
      ORDER BY avg_rating DESC
    `;
  });

  await measureQuery('Most popular courses (by purchases)', async () => {
    return await prisma.$queryRaw`
      SELECT 
        ct.name,
        COUNT(p.id) as purchase_count
      FROM "CourseTier" ct
      LEFT JOIN "Purchase" p ON p."tierId" = ct.id AND p.status = 'CONFIRMED'
      GROUP BY ct.id, ct.name
      ORDER BY purchase_count DESC
      LIMIT 10
    `;
  });
}

async function generatePlatformReport() {
  console.log('\n📊 Comprehensive Platform Report:');
  console.log('='.repeat(60));

  // User statistics
  const totalUsers = await prisma.users.count();
  const activeUsers = await prisma.users.count({
    where: {
      last_login: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  console.log('\n👥 User Statistics:');
  console.log(`   Total Users: ${totalUsers.toLocaleString()}`);
  console.log(`   Active Users (30d): ${activeUsers.toLocaleString()} (${((activeUsers / totalUsers) * 100).toFixed(2)}%)`);

  // Purchase statistics
  const totalPurchases = await prisma.purchase.count({ where: { status: 'CONFIRMED' } });
  const revenue = await prisma.purchase.aggregate({
    where: { status: 'CONFIRMED' },
    _sum: { finalPriceUsd: true },
  });

  console.log('\n💰 Revenue Statistics:');
  console.log(`   Total Purchases: ${totalPurchases.toLocaleString()}`);
  console.log(`   Total Revenue: $${revenue._sum.finalPriceUsd?.toLocaleString() || 0}`);
  console.log(`   Average Purchase Value: $${((revenue._sum.finalPriceUsd || 0) / totalPurchases).toFixed(2)}`);
  console.log(`   Conversion Rate: ${((totalPurchases / totalUsers) * 100).toFixed(2)}%`);

  // Progress statistics
  const progressStats = await prisma.studentProgress.aggregate({
    _avg: { xp: true, level: true, streak: true, lessonsCompleted: true },
    _max: { xp: true, level: true, streak: true },
  });

  console.log('\n📈 Learning Progress:');
  console.log(`   Average XP: ${progressStats._avg.xp?.toFixed(0) || 0}`);
  console.log(`   Average Level: ${progressStats._avg.level?.toFixed(1) || 0}`);
  console.log(`   Average Streak: ${progressStats._avg.streak?.toFixed(1) || 0} days`);
  console.log(`   Max XP: ${progressStats._max.xp?.toLocaleString() || 0}`);
  console.log(`   Max Level: ${progressStats._max.level || 0}`);
  console.log(`   Max Streak: ${progressStats._max.streak || 0} days`);

  // Completion statistics
  const totalProgress = await prisma.studentProgress.count();
  const completed = await prisma.studentProgress.count({
    where: { completedAt: { not: null } },
  });

  console.log('\n✅ Completion Statistics:');
  console.log(`   Total Enrollments: ${totalProgress.toLocaleString()}`);
  console.log(`   Completed Courses: ${completed.toLocaleString()}`);
  console.log(`   Completion Rate: ${((completed / totalProgress) * 100).toFixed(2)}%`);

  // Activity statistics
  const totalActivities = await prisma.dailyActivity.count();
  const totalTimeSpent = await prisma.dailyActivity.aggregate({
    _sum: { timeSpent: true },
  });

  console.log('\n⏱️  Activity Statistics:');
  console.log(`   Total Activity Records: ${totalActivities.toLocaleString()}`);
  console.log(`   Total Time Spent: ${((totalTimeSpent._sum.timeSpent || 0) / 3600).toFixed(0)} hours`);
  console.log(`   Average Time per Activity: ${((totalTimeSpent._sum.timeSpent || 0) / totalActivities / 60).toFixed(1)} minutes`);

  // Review statistics
  const totalReviews = await prisma.courseReview.count();
  const avgRating = await prisma.courseReview.aggregate({
    _avg: { rating: true },
  });

  console.log('\n⭐ Review Statistics:');
  console.log(`   Total Reviews: ${totalReviews.toLocaleString()}`);
  console.log(`   Average Rating: ${avgRating._avg.rating?.toFixed(2) || 0}/5`);
  console.log(`   Review Rate: ${((totalReviews / totalPurchases) * 100).toFixed(2)}%`);

  console.log('\n' + '='.repeat(60));
}

async function testDatabaseLoad() {
  console.log('\n🔥 Database Load Test:');
  console.log('Running 100 concurrent leaderboard queries...');

  const start = performance.now();
  const promises = Array.from({ length: 100 }, () =>
    prisma.studentProgress.findMany({
      take: 100,
      orderBy: { xp: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    })
  );

  await Promise.all(promises);
  const end = performance.now();

  console.log(`  ✅ Completed in ${(end - start).toFixed(2)}ms`);
  console.log(`  📊 Average query time: ${((end - start) / 100).toFixed(2)}ms`);
}

async function main() {
  console.log('🚀 Platform Performance Analysis\n');
  console.log('Testing with 50,000 users...\n');

  await analyzeUserQueries();
  await analyzeLeaderboardQueries();
  await analyzePurchaseQueries();
  await analyzeProgressQueries();
  await analyzeCourseQueries();
  await testDatabaseLoad();
  await generatePlatformReport();

  console.log('\n✅ Analysis complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
