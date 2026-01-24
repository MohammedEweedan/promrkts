// scripts/cleanup-fake-users.ts
// Remove all fake users and their associated data

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

async function main() {
  console.log('🧹 Starting cleanup of fake users...\n');

  try {
    // Get count of fake users
    const fakeUserCount = await prisma.users.count({
      where: { role: 'fake_user' }
    });

    console.log(`Found ${fakeUserCount} fake users to delete\n`);

    if (fakeUserCount === 0) {
      console.log('✅ No fake users to delete');
      return;
    }

    // Get all fake user IDs first
    const fakeUserIds = (await prisma.users.findMany({
      where: { role: 'fake_user' },
      select: { id: true }
    })).map((u: { id: string }) => u.id);

    console.log(`Found ${fakeUserIds.length} fake user IDs\n`);

    // Process in batches to avoid "too many bind variables" error (max 32767)
    const BATCH_SIZE = 10000;
    const batches = Math.ceil(fakeUserIds.length / BATCH_SIZE);

    let totalResourceProgress = 0;
    let totalActivities = 0;
    let totalProgress = 0;
    let totalReviews = 0;
    let totalPurchases = 0;
    let totalWinners = 0;
    let totalBadges = 0;
    let totalAffiliates = 0;
    let totalRewards = 0;

    for (let i = 0; i < batches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, fakeUserIds.length);
      const batchIds = fakeUserIds.slice(start, end);
      
      console.log(`Processing batch ${i + 1}/${batches} (${batchIds.length} users)...`);

      // Delete in order to respect foreign key constraints
      const resourceProgress = await prisma.resourceProgress.deleteMany({
        where: { progress: { userId: { in: batchIds } } }
      });
      totalResourceProgress += resourceProgress.count;

      const activities = await prisma.dailyActivity.deleteMany({
        where: { userId: { in: batchIds } }
      });
      totalActivities += activities.count;

      const progress = await prisma.studentProgress.deleteMany({
        where: { userId: { in: batchIds } }
      });
      totalProgress += progress.count;

      const reviews = await prisma.courseReview.deleteMany({
        where: { userId: { in: batchIds } }
      });
      totalReviews += reviews.count;

      const purchases = await prisma.purchase.deleteMany({
        where: { userId: { in: batchIds } }
      });
      totalPurchases += purchases.count;

      const winners = await prisma.prizeWinner.deleteMany({
        where: { userId: { in: batchIds } }
      });
      totalWinners += winners.count;

      const badges = await prisma.userBadge.deleteMany({
        where: { userId: { in: batchIds } }
      });
      totalBadges += badges.count;

      const affiliates = await prisma.affiliate.deleteMany({
        where: { userId: { in: batchIds } }
      });
      totalAffiliates += affiliates.count;

      const rewards = await prisma.referralReward.deleteMany({
        where: { userId: { in: batchIds } }
      });
      totalRewards += rewards.count;

      console.log(`✓ Batch ${i + 1} complete\n`);
    }

    console.log('📊 Deletion Summary:');
    console.log(`✓ Deleted ${totalResourceProgress} resource progress records`);
    console.log(`✓ Deleted ${totalActivities} daily activities`);
    console.log(`✓ Deleted ${totalProgress} progress records`);
    console.log(`✓ Deleted ${totalReviews} reviews`);
    console.log(`✓ Deleted ${totalPurchases} purchases`);
    console.log(`✓ Deleted ${totalWinners} prize winners`);
    console.log(`✓ Deleted ${totalBadges} user badges`);
    console.log(`✓ Deleted ${totalAffiliates} affiliates`);
    console.log(`✓ Deleted ${totalRewards} referral rewards`);

    console.log('Deleting fake users...');
    const users = await prisma.users.deleteMany({
      where: { role: 'fake_user' }
    });
    console.log(`✓ Deleted ${users.count} users`);

    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
