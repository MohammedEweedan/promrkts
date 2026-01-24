import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

async function main() {
  console.log('Testing leaderboard query...\n');

  // Get all users with their total XP
  const users = await prisma.users.findMany({
    where: {
      role: { in: ['user', 'student', 'fake_user'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      studentProgress: {
        select: {
          xp: true,
          level: true,
        },
      },
    },
    take: 10,
  });

  console.log(`Found ${users.length} users`);
  console.log('\nSample users:');

  const leaderboard = users
    .map((user: any) => {
      const totalXP = user.studentProgress.reduce((sum: number, p: any) => sum + p.xp, 0);
      const level = calculateLevel(totalXP);
      return {
        userId: user.id,
        name: user.name || user.email,
        totalXP,
        level,
        progressCount: user.studentProgress.length,
      };
    })
    .sort((a: any, b: any) => b.totalXP - a.totalXP);

  console.log(JSON.stringify(leaderboard, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
