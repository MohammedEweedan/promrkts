// scripts/simulate-user-activity.ts
// Simulate realistic user behavior: logins, course progress, purchases, reviews

import { PrismaClient, PurchaseStatus } from '@prisma/client';
import axios from 'axios';
import process from 'process';

const prisma = new PrismaClient() as any;
const API_URL = process.env.API_URL || 'http://localhost:3003';

// Simulate different user behaviors
const USER_BEHAVIORS = {
  HIGHLY_ACTIVE: { weight: 10, actionsPerDay: [5, 15] },
  ACTIVE: { weight: 25, actionsPerDay: [2, 5] },
  MODERATE: { weight: 35, actionsPerDay: [1, 3] },
  CASUAL: { weight: 20, actionsPerDay: [0, 1] },
  INACTIVE: { weight: 10, actionsPerDay: [0, 0] },
};

function weightedRandom(weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
  }
  return weights.length - 1;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function simulateLogin(user: any) {
  try {
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });
  } catch (e) {
    console.error(`Failed to update login for user ${user.id}`);
  }
}

async function simulateVideoWatch(user: any, tierId: string) {
  try {
    const progress = await prisma.studentProgress.findUnique({
      where: { unique_user_tier_progress: { userId: user.id, tierId } },
    });

    if (progress) {
      const xpGain = randomInt(50, 200);
      const newXp = progress.xp + xpGain;
      const newLevel = Math.floor(newXp / 1000) + 1;

      await prisma.studentProgress.update({
        where: { id: progress.id },
        data: {
          videosWatched: progress.videosWatched + 1,
          xp: newXp,
          level: newLevel,
          lastActiveDate: new Date(),
          updatedAt: new Date(),
        },
      });

      // Update daily activity
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.dailyActivity.upsert({
        where: {
          unique_user_date_activity: {
            userId: user.id,
            activityDate: today,
          },
        },
        create: {
          userId: user.id,
          activityDate: today,
          videosWatched: 1,
          timeSpent: randomInt(300, 1800),
          xpEarned: xpGain,
        },
        update: {
          videosWatched: { increment: 1 },
          timeSpent: { increment: randomInt(300, 1800) },
          xpEarned: { increment: xpGain },
        },
      });
    }
  } catch (e) {
    console.error(`Failed to simulate video watch for user ${user.id}`);
  }
}

async function simulateLessonComplete(user: any, tierId: string) {
  try {
    const progress = await prisma.studentProgress.findUnique({
      where: { unique_user_tier_progress: { userId: user.id, tierId } },
    });

    if (progress) {
      const xpGain = randomInt(100, 300);
      const newXp = progress.xp + xpGain;
      const newLevel = Math.floor(newXp / 1000) + 1;

      await prisma.studentProgress.update({
        where: { id: progress.id },
        data: {
          lessonsCompleted: progress.lessonsCompleted + 1,
          xp: newXp,
          level: newLevel,
          lastActiveDate: new Date(),
          updatedAt: new Date(),
        },
      });

      // Update daily activity
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.dailyActivity.upsert({
        where: {
          unique_user_date_activity: {
            userId: user.id,
            activityDate: today,
          },
        },
        create: {
          userId: user.id,
          activityDate: today,
          lessonsCompleted: 1,
          timeSpent: randomInt(600, 2400),
          xpEarned: xpGain,
        },
        update: {
          lessonsCompleted: { increment: 1 },
          timeSpent: { increment: randomInt(600, 2400) },
          xpEarned: { increment: xpGain },
        },
      });
    }
  } catch (e) {
    console.error(`Failed to simulate lesson complete for user ${user.id}`);
  }
}

async function simulatePurchase(user: any) {
  try {
    // Get a random tier the user hasn't purchased
    const existingPurchases = await prisma.purchase.findMany({
      where: { userId: user.id, status: PurchaseStatus.CONFIRMED },
      select: { tierId: true },
    });

    const purchasedTierIds = existingPurchases.map((p: any) => p.tierId);
    const availableTiers = await prisma.courseTier.findMany({
      where: { id: { notIn: purchasedTierIds } },
    });

    if (availableTiers.length === 0) return;

    const tier: any = randomElement(availableTiers);
    
    // Create purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        tierId: tier.id,
        status: PurchaseStatus.CONFIRMED,
        txnHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        finalPriceUsd: tier.price_usdt,
        createdAt: new Date(),
      },
    });

    // Create initial progress
    await prisma.studentProgress.create({
      data: {
        userId: user.id,
        tierId: tier.id,
        level: 1,
        xp: 0,
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ User ${user.email} purchased ${tier.name}`);
  } catch (e) {
    // Skip if already exists
  }
}

async function simulateReview(user: any) {
  try {
    // Get a random confirmed purchase without a review
    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id, status: PurchaseStatus.CONFIRMED },
      include: { tier: true },
    });

    if (purchases.length === 0) return;

    const purchase: any = randomElement(purchases);

    // Check if already reviewed
    const existingReview = await prisma.courseReview.findFirst({
      where: { userId: user.id, tierId: purchase.tierId },
    });

    if (existingReview) return;

    // Create review (weighted towards positive)
    const ratingWeights = [2, 5, 10, 25, 58]; // 1-5 stars
    const rating = weightedRandom(ratingWeights) + 1;

    const comments = [
      'Excellent course! Learned a lot.',
      'Very helpful and practical.',
      'Great instructor, clear explanations.',
      'Worth every penny!',
      'Highly recommend this course.',
      'Good content but could be more detailed.',
      'Perfect for beginners.',
      'Advanced strategies are amazing.',
      'Life-changing content!',
      'Best investment I made this year.',
    ];

    await prisma.courseReview.create({
      data: {
        tierId: purchase.tierId,
        userId: user.id,
        rating,
        comment: Math.random() < 0.7 ? randomElement(comments) : null,
        created_at: new Date(),
      },
    });

    console.log(`✅ User ${user.email} reviewed ${purchase.tier.name} with ${rating} stars`);
  } catch (e) {
    // Skip if already exists
  }
}

async function simulateStreak(user: any) {
  try {
    // Update streaks for users who were active yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const progressRecords = await prisma.studentProgress.findMany({
      where: { userId: user.id },
    });

    for (const progress of progressRecords) {
      if (progress.lastActiveDate) {
        const lastActive = new Date(progress.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((yesterday.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          // Active yesterday, increment streak
          await prisma.studentProgress.update({
            where: { id: progress.id },
            data: {
              streak: progress.streak + 1,
              lastActiveDate: new Date(),
            },
          });
        } else if (daysDiff > 1) {
          // Missed a day, reset streak
          await prisma.studentProgress.update({
            where: { id: progress.id },
            data: {
              streak: 1,
              lastActiveDate: new Date(),
            },
          });
        }
      }
    }
  } catch (e) {
    console.error(`Failed to update streak for user ${user.id}`);
  }
}

async function simulateUserBehavior(user: any, behaviorType: keyof typeof USER_BEHAVIORS): Promise<void> {
  const behavior = USER_BEHAVIORS[behaviorType];
  const numActions = randomInt(behavior.actionsPerDay[0], behavior.actionsPerDay[1]);

  if (numActions === 0) return;

  // Always log in if doing any action
  await simulateLogin(user);

  // Get user's enrolled courses
  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id, status: PurchaseStatus.CONFIRMED },
  });

  const actions: Array<{ name: string; weight: number; fn: any }> = [
    { name: 'watch_video', weight: 40, fn: simulateVideoWatch },
    { name: 'complete_lesson', weight: 30, fn: simulateLessonComplete },
    { name: 'purchase', weight: 5, fn: simulatePurchase },
    { name: 'review', weight: 10, fn: simulateReview },
    { name: 'streak', weight: 15, fn: simulateStreak },
  ];

  for (let i = 0; i < numActions; i++) {
    const actionIndex = weightedRandom(actions.map((a) => a.weight));
    const action = actions[actionIndex];

    if (action.name === 'watch_video' || action.name === 'complete_lesson') {
      if (purchases.length > 0) {
        const purchase: any = randomElement(purchases);
        await action.fn(user, purchase.tierId);
      }
    } else {
      await action.fn(user);
    }
  }
}

async function main() {
  console.log('🎮 Starting user activity simulation...\n');

  const BATCH_SIZE = 1000;
  const SIMULATION_DAYS = parseInt(process.env.SIMULATION_DAYS || '1');
  const roles = (process.env.SIMULATE_ROLES || 'user,fake_user')
    .split(',')
    .map((r: string) => r.trim())
    .filter(Boolean);

  for (let day = 0; day < SIMULATION_DAYS; day++) {
    console.log(`\n📅 Day ${day + 1}/${SIMULATION_DAYS}`);

    let offset = 0;
    let processedUsers = 0;

    while (true) {
      const users = await prisma.users.findMany({
        take: BATCH_SIZE,
        skip: offset,
        where: { role: { in: roles } },
      });

      if (users.length === 0) break;

      console.log(`Processing users ${offset + 1} to ${offset + users.length}...`);

      // Assign behavior type to each user
      const behaviorTypes = Object.keys(USER_BEHAVIORS) as (keyof typeof USER_BEHAVIORS)[];
      const behaviorWeights = behaviorTypes.map((type) => USER_BEHAVIORS[type].weight);

      for (const user of users) {
        const behaviorIndex = weightedRandom(behaviorWeights);
        const behaviorType = behaviorTypes[behaviorIndex];

        await simulateUserBehavior(user, behaviorType);
        processedUsers++;

        if (processedUsers % 100 === 0) {
          console.log(`  ✓ Processed ${processedUsers} users`);
        }
      }

      offset += BATCH_SIZE;
    }

    console.log(`✅ Day ${day + 1} complete: ${processedUsers} users simulated`);
  }

  console.log('\n🎉 Simulation complete!');

  // Print stats
  const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT p.id) as total_purchases,
      COUNT(DISTINCT sp.id) as total_progress,
      COUNT(DISTINCT da.id) as total_activities,
      COUNT(DISTINCT cr.id) as total_reviews,
      AVG(sp.xp)::int as avg_xp,
      AVG(sp.level)::int as avg_level,
      AVG(sp.streak)::int as avg_streak
    FROM users u
    LEFT JOIN "Purchase" p ON p."userId" = u.id AND p.status = 'CONFIRMED'
    LEFT JOIN "StudentProgress" sp ON sp."userId" = u.id
    LEFT JOIN "DailyActivity" da ON da."userId" = u.id
    LEFT JOIN "CourseReview" cr ON cr."userId" = u.id
  `;

  console.log('\n📊 Platform Statistics:');
  console.log(stats[0]);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
