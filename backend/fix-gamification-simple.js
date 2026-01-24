const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const badges = [
  // Beginner Badges (0-500 XP)
  { name: 'First Steps', description: 'Complete your first lesson', imageUrl: '/badges/first-steps.png', category: 'MILESTONE', rarity: 'common', unlockCriteria: { type: 'xp', value: 0 }, displayOrder: 1 },
  { name: 'Quick Learner', description: 'Earn 100 XP', imageUrl: '/badges/quick-learner.png', category: 'MILESTONE', rarity: 'common', unlockCriteria: { type: 'xp', value: 100 }, displayOrder: 2 },
  { name: 'Dedicated Student', description: 'Earn 250 XP', imageUrl: '/badges/dedicated.png', category: 'MILESTONE', rarity: 'common', unlockCriteria: { type: 'xp', value: 250 }, displayOrder: 3 },
  { name: 'Rising Star', description: 'Earn 500 XP', imageUrl: '/badges/rising-star.png', category: 'MILESTONE', rarity: 'rare', unlockCriteria: { type: 'xp', value: 500 }, displayOrder: 4 },
  
  // Intermediate Badges (500-2000 XP)
  { name: 'Knowledge Seeker', description: 'Earn 1,000 XP', imageUrl: '/badges/knowledge-seeker.png', category: 'MILESTONE', rarity: 'rare', unlockCriteria: { type: 'xp', value: 1000 }, displayOrder: 5 },
  { name: 'Consistent Learner', description: 'Maintain a 7-day streak', imageUrl: '/badges/consistent.png', category: 'STREAK', rarity: 'rare', unlockCriteria: { type: 'streak', days: 7 }, displayOrder: 6 },
  { name: 'Video Master', description: 'Watch 10 videos', imageUrl: '/badges/video-master.png', category: 'ACHIEVEMENT', rarity: 'rare', unlockCriteria: { type: 'videos_watched', count: 10 }, displayOrder: 7 },
  { name: 'Document Expert', description: 'Read 10 PDFs', imageUrl: '/badges/document-expert.png', category: 'ACHIEVEMENT', rarity: 'rare', unlockCriteria: { type: 'pdfs_viewed', count: 10 }, displayOrder: 8 },
  { name: 'Ambitious Trader', description: 'Earn 1,500 XP', imageUrl: '/badges/ambitious.png', category: 'MILESTONE', rarity: 'rare', unlockCriteria: { type: 'xp', value: 1500 }, displayOrder: 9 },
  { name: 'Course Completer', description: 'Complete your first course', imageUrl: '/badges/course-complete.png', category: 'ACHIEVEMENT', rarity: 'epic', unlockCriteria: { type: 'course_completed', count: 1 }, displayOrder: 10 },
  
  // Advanced Badges (2000-5000 XP)
  { name: 'Trading Scholar', description: 'Earn 2,500 XP', imageUrl: '/badges/scholar.png', category: 'MILESTONE', rarity: 'epic', unlockCriteria: { type: 'xp', value: 2500 }, displayOrder: 11 },
  { name: 'Marathon Learner', description: 'Maintain a 30-day streak', imageUrl: '/badges/marathon.png', category: 'STREAK', rarity: 'epic', unlockCriteria: { type: 'streak', days: 30 }, displayOrder: 12 },
  { name: 'Multi-Course Master', description: 'Complete 3 courses', imageUrl: '/badges/multi-course.png', category: 'ACHIEVEMENT', rarity: 'epic', unlockCriteria: { type: 'course_completed', count: 3 }, displayOrder: 13 },
  { name: 'Expert Analyst', description: 'Earn 4,000 XP', imageUrl: '/badges/expert.png', category: 'MILESTONE', rarity: 'epic', unlockCriteria: { type: 'xp', value: 4000 }, displayOrder: 14 },
  
  // Elite Badges (5000+ XP)
  { name: 'Trading Master', description: 'Earn 5,000 XP', imageUrl: '/badges/master.png', category: 'MILESTONE', rarity: 'legendary', unlockCriteria: { type: 'xp', value: 5000 }, displayOrder: 15 },
  { name: 'Legendary Trader', description: 'Earn 10,000 XP', imageUrl: '/badges/legendary.png', category: 'MILESTONE', rarity: 'legendary', unlockCriteria: { type: 'xp', value: 10000 }, displayOrder: 16 },
  { name: 'Ultimate Champion', description: 'Earn 25,000 XP', imageUrl: '/badges/champion.png', category: 'SPECIAL', rarity: 'legendary', unlockCriteria: { type: 'xp', value: 25000 }, displayOrder: 17 },
  { name: 'Hall of Fame', description: 'Earn 50,000 XP', imageUrl: '/badges/hall-of-fame.png', category: 'SPECIAL', rarity: 'legendary', unlockCriteria: { type: 'xp', value: 50000 }, displayOrder: 18 },
];

async function seedBadges() {
  console.log('\n🎖️  Step 1: Seeding badges...');
  
  for (const badge of badges) {
    const existing = await prisma.badge.findFirst({
      where: { name: badge.name }
    });
    
    if (!existing) {
      await prisma.badge.create({
        data: badge
      });
      console.log(`  ✅ Created badge: ${badge.name}`);
    } else {
      console.log(`  ⏭️  Badge already exists: ${badge.name}`);
    }
  }
}

async function checkBadgeUnlocks() {
  console.log('\n🏆 Step 2: Checking badge unlocks for all students...');
  
  const allProgress = await prisma.studentProgress.findMany({
    include: {
      user: true,
    }
  });
  
  const allBadges = await prisma.badge.findMany();
  
  for (const progress of allProgress) {
    const earnedBadgeIds = await prisma.userBadge.findMany({
      where: { userId: progress.userId },
      select: { badgeId: true }
    });
    const earnedIds = earnedBadgeIds.map(ub => ub.badgeId);
    
    for (const badge of allBadges) {
      if (earnedIds.includes(badge.id)) continue;
      
      const criteria = badge.unlockCriteria;
      let shouldUnlock = false;
      
      // XP-based badges
      if (criteria.type === 'xp' && progress.xp >= criteria.value) {
        shouldUnlock = true;
      }
      
      // Streak-based badges
      if (criteria.type === 'streak' && progress.streak >= criteria.days) {
        shouldUnlock = true;
      }
      
      // Video-based badges
      if (criteria.type === 'videos_watched' && progress.videosWatched >= criteria.count) {
        shouldUnlock = true;
      }
      
      // PDF-based badges
      if (criteria.type === 'pdfs_viewed' && progress.pdfsViewed >= criteria.count) {
        shouldUnlock = true;
      }
      
      // Course completion badges
      if (criteria.type === 'course_completed' && progress.completedAt && criteria.count === 1) {
        shouldUnlock = true;
      }
      
      if (shouldUnlock) {
        await prisma.userBadge.create({
          data: {
            userId: progress.userId,
            badgeId: badge.id,
          }
        });
        console.log(`  🎖️  Unlocked "${badge.name}" for user ${progress.user.email}`);
      }
    }
  }
}

async function showSummary() {
  console.log('\n📊 Summary:');
  
  const badgeCount = await prisma.badge.count();
  const progressCount = await prisma.studentProgress.count();
  const unlockedBadges = await prisma.userBadge.count();
  
  console.log(`  🎖️  Total badges: ${badgeCount}`);
  console.log(`  👥 Students with progress: ${progressCount}`);
  console.log(`  🏆 Total badges unlocked: ${unlockedBadges}`);
  
  // Show top students
  const topStudents = await prisma.studentProgress.findMany({
    take: 5,
    orderBy: { xp: 'desc' },
    include: {
      user: true,
    }
  });
  
  if (topStudents.length > 0) {
    console.log('\n🏅 Top Students:');
    for (let i = 0; i < topStudents.length; i++) {
      const s = topStudents[i];
      const badgeCount = await prisma.userBadge.count({
        where: { userId: s.userId }
      });
      console.log(`  ${i + 1}. ${s.user.email} - Level ${s.level}, ${s.xp} XP, ${badgeCount} badges`);
    }
  }
}

async function main() {
  console.log('🚀 Starting gamification fix...\n');
  console.log('This will:');
  console.log('  1. Create default badges');
  console.log('  2. Check and unlock badges for existing students');
  console.log('  3. Show summary\n');
  
  try {
    await seedBadges();
    await checkBadgeUnlocks();
    await showSummary();
    
    console.log('\n✅ Gamification fix complete!');
    console.log('\n📝 Next steps:');
    console.log('  1. Restart your backend server');
    console.log('  2. Clear browser cache and reload frontend');
    console.log('  3. Test by viewing a PDF or video');
    console.log('  4. Check /progress page for badges\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
