import { PrismaClient, CourseProductType, Level } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertCourseTier(slug: string, data: any) {
  const existing = await prisma.courseTier.findFirst({ where: { name: data.name } });
  if (existing) {
    // update
    return prisma.courseTier.update({ where: { id: existing.id }, data });
  }
  return prisma.courseTier.create({ data });
}

async function seedCourses() {
  console.log('Seeding course tiers...');
  const tiersData = [
    {
      name: 'Free',
      description: 'Intro level course with free content',
      price_usdt: 0,
      price_stripe: 0,
      level: Level.BEGINNER,
      productType: CourseProductType.COURSE,
    },
    {
      name: 'Pro',
      description: 'Professional course with guided lessons and community',
      price_usdt: 19.99,
      price_stripe: 1999,
      level: Level.INTERMEDIATE,
      productType: CourseProductType.COURSE,
    },
    {
      name: 'Master',
      description: 'Master class with advanced lessons and mentorship',
      price_usdt: 99.99,
      price_stripe: 9999,
      level: Level.ADVANCED,
      productType: CourseProductType.COURSE,
    },
    {
      name: 'Telegram VIP',
      description: 'Telegram VIP community access (monthly)',
      price_usdt: 10,
      price_stripe: 1000,
      level: Level.ADVANCED,
      productType: CourseProductType.SUBSCRIPTION_VIP,
      isVipProduct: true,
      vipType: 'telegram',
    },
    {
      name: 'Discord VIP',
      description: 'Discord VIP community access (monthly)',
      price_usdt: 10,
      price_stripe: 1000,
      level: Level.ADVANCED,
      productType: CourseProductType.SUBSCRIPTION_VIP,
      isVipProduct: true,
      vipType: 'discord',
    },
    {
      name: 'promrkts+ (Telegram + Discord)',
      description: 'Bundle VIP access to Telegram and Discord (monthly)',
      price_usdt: 15,
      price_stripe: 1500,
      level: Level.ADVANCED,
      productType: CourseProductType.SUBSCRIPTION_VIP,
      isVipProduct: true,
      vipType: 'bundle',
      isBundle: true,
    },
    {
      name: 'promrkts+ Yearly (10 months value)',
      description: '12 months access for the price of 10 months',
      price_usdt: 150,
      price_stripe: 15000,
      level: Level.ADVANCED,
      productType: CourseProductType.SUBSCRIPTION_VIP,
      isVipProduct: true,
      vipType: 'bundle',
      isBundle: true,
    },
    {
      name: 'AI Chatbot',
      description: 'Access to the promrkts AI chatbot (monthly)',
      price_usdt: 10,
      price_stripe: 1000,
      level: Level.BEGINNER,
      productType: CourseProductType.SUBSCRIPTION_AI,
    },

    // Prop Firm Challenges (MT5)
    {
      name: 'Prop Firm Challenge 10K (MT5)',
      description: '10,000 USD evaluation challenge. Platform: MT5.',
      price_usdt: 99,
      price_stripe: 9900,
      level: Level.INTERMEDIATE,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 10000,
        profitTargetUsd: 1000,
        maxDailyDrawdownUsd: 500,
        maxTotalDrawdownUsd: 1000,
        variant: 'ONE_STEP',
        steps: 1,
        phases: [
          {
            index: 1,
            profitTargetUsd: 1000,
            maxDailyDrawdownUsd: 500,
            maxTotalDrawdownUsd: 1000,
            minTradingDays: 5,
            maxDays: 30,
          },
        ],
      },
    },
    {
      name: 'Prop Firm Challenge 10K (MT5) - 2 Step',
      description: '10,000 USD two-step evaluation challenge. Platform: MT5.',
      price_usdt: 109,
      price_stripe: 10900,
      level: Level.INTERMEDIATE,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 10000,
        // Keep top-level fields backward-compatible with metrics/UI.
        profitTargetUsd: 1300,
        maxDailyDrawdownUsd: 500,
        maxTotalDrawdownUsd: 1000,
        variant: 'TWO_STEP',
        steps: 2,
        phases: [
          {
            index: 1,
            profitTargetUsd: 800,
            maxDailyDrawdownUsd: 500,
            maxTotalDrawdownUsd: 1000,
            minTradingDays: 5,
            maxDays: 30,
          },
          {
            index: 2,
            profitTargetUsd: 500,
            maxDailyDrawdownUsd: 500,
            maxTotalDrawdownUsd: 1000,
            minTradingDays: 5,
            maxDays: 60,
          },
        ],
      },
    },
    {
      name: 'Prop Firm Challenge 25K (MT5)',
      description: '25,000 USD evaluation challenge. Platform: MT5.',
      price_usdt: 179,
      price_stripe: 17900,
      level: Level.ADVANCED,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 25000,
        profitTargetUsd: 2500,
        maxDailyDrawdownUsd: 1250,
        maxTotalDrawdownUsd: 2500,
        variant: 'ONE_STEP',
        steps: 1,
        phases: [
          {
            index: 1,
            profitTargetUsd: 2500,
            maxDailyDrawdownUsd: 1250,
            maxTotalDrawdownUsd: 2500,
            minTradingDays: 5,
            maxDays: 30,
          },
        ],
      },
    },
    {
      name: 'Prop Firm Challenge 25K (MT5) - 2 Step',
      description: '25,000 USD two-step evaluation challenge. Platform: MT5.',
      price_usdt: 189,
      price_stripe: 18900,
      level: Level.ADVANCED,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 25000,
        profitTargetUsd: 3250,
        maxDailyDrawdownUsd: 1250,
        maxTotalDrawdownUsd: 2500,
        variant: 'TWO_STEP',
        steps: 2,
        phases: [
          { index: 1, profitTargetUsd: 2000, maxDailyDrawdownUsd: 1250, maxTotalDrawdownUsd: 2500, minTradingDays: 5, maxDays: 30 },
          { index: 2, profitTargetUsd: 1250, maxDailyDrawdownUsd: 1250, maxTotalDrawdownUsd: 2500, minTradingDays: 5, maxDays: 60 },
        ],
      },
    },
    {
      name: 'Prop Firm Challenge 50K (MT5)',
      description: '50,000 USD evaluation challenge. Platform: MT5.',
      price_usdt: 299,
      price_stripe: 29900,
      level: Level.ADVANCED,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 50000,
        profitTargetUsd: 5000,
        maxDailyDrawdownUsd: 2500,
        maxTotalDrawdownUsd: 5000,
        variant: 'ONE_STEP',
        steps: 1,
        phases: [
          {
            index: 1,
            profitTargetUsd: 5000,
            maxDailyDrawdownUsd: 2500,
            maxTotalDrawdownUsd: 5000,
            minTradingDays: 5,
            maxDays: 30,
          },
        ],
      },
    },
    {
      name: 'Prop Firm Challenge 50K (MT5) - 2 Step',
      description: '50,000 USD two-step evaluation challenge. Platform: MT5.',
      price_usdt: 319,
      price_stripe: 31900,
      level: Level.ADVANCED,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 50000,
        profitTargetUsd: 6500,
        maxDailyDrawdownUsd: 2500,
        maxTotalDrawdownUsd: 5000,
        variant: 'TWO_STEP',
        steps: 2,
        phases: [
          { index: 1, profitTargetUsd: 4000, maxDailyDrawdownUsd: 2500, maxTotalDrawdownUsd: 5000, minTradingDays: 5, maxDays: 30 },
          { index: 2, profitTargetUsd: 2500, maxDailyDrawdownUsd: 2500, maxTotalDrawdownUsd: 5000, minTradingDays: 5, maxDays: 60 },
        ],
      },
    },
    {
      name: 'Prop Firm Challenge 100K (MT5)',
      description: '100,000 USD evaluation challenge. Platform: MT5.',
      price_usdt: 399,
      price_stripe: 39900,
      level: Level.ADVANCED,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 100000,
        profitTargetUsd: 10000,
        maxDailyDrawdownUsd: 5000,
        maxTotalDrawdownUsd: 10000,
        variant: 'ONE_STEP',
        steps: 1,
        phases: [
          {
            index: 1,
            profitTargetUsd: 10000,
            maxDailyDrawdownUsd: 5000,
            maxTotalDrawdownUsd: 10000,
            minTradingDays: 5,
            maxDays: 30,
          },
        ],
      },
    },
    {
      name: 'Prop Firm Challenge 100K (MT5) - 2 Step',
      description: '100,000 USD two-step evaluation challenge. Platform: MT5.',
      price_usdt: 429,
      price_stripe: 42900,
      level: Level.ADVANCED,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 100000,
        profitTargetUsd: 13000,
        maxDailyDrawdownUsd: 5000,
        maxTotalDrawdownUsd: 10000,
        variant: 'TWO_STEP',
        steps: 2,
        phases: [
          { index: 1, profitTargetUsd: 8000, maxDailyDrawdownUsd: 5000, maxTotalDrawdownUsd: 10000, minTradingDays: 5, maxDays: 30 },
          { index: 2, profitTargetUsd: 5000, maxDailyDrawdownUsd: 5000, maxTotalDrawdownUsd: 10000, minTradingDays: 5, maxDays: 60 },
        ],
      },
    },
    {
      name: 'Prop Firm Challenge 200K (MT5)',
      description: '200,000 USD evaluation challenge. Platform: MT5.',
      price_usdt: 499,
      price_stripe: 49900,
      level: Level.ADVANCED,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 200000,
        profitTargetUsd: 20000,
        maxDailyDrawdownUsd: 10000,
        maxTotalDrawdownUsd: 20000,
        variant: 'ONE_STEP',
        steps: 1,
        phases: [
          {
            index: 1,
            profitTargetUsd: 20000,
            maxDailyDrawdownUsd: 10000,
            maxTotalDrawdownUsd: 20000,
            minTradingDays: 5,
            maxDays: 30,
          },
        ],
      },
    },
    {
      name: 'Prop Firm Challenge 200K (MT5) - 2 Step',
      description: '200,000 USD two-step evaluation challenge. Platform: MT5.',
      price_usdt: 549,
      price_stripe: 54900,
      level: Level.ADVANCED,
      productType: 'CHALLENGE' as any,
      challengePlatform: 'MT5',
      challengeMeta: {
        accountSizeUsd: 200000,
        profitTargetUsd: 26000,
        maxDailyDrawdownUsd: 10000,
        maxTotalDrawdownUsd: 20000,
        variant: 'TWO_STEP',
        steps: 2,
        phases: [
          { index: 1, profitTargetUsd: 16000, maxDailyDrawdownUsd: 10000, maxTotalDrawdownUsd: 20000, minTradingDays: 5, maxDays: 30 },
          { index: 2, profitTargetUsd: 10000, maxDailyDrawdownUsd: 10000, maxTotalDrawdownUsd: 20000, minTradingDays: 5, maxDays: 60 },
        ],
      },
    },
  ];

  const created: any[] = [];
  for (const t of tiersData) {
    const ct = await upsertCourseTier(t.name, t);
    created.push(ct);
  }

  // Link bundle tiers to their component tiers
  const telegram = created.find((t) => t.name === 'Telegram VIP');
  const discord = created.find((t) => t.name === 'Discord VIP');
  const bundleMonthly = created.find((t) => t.name === 'promrkts+ (Telegram + Discord)');
  const bundleYearly = created.find((t) => t.name === 'promrkts+ Yearly (10 months value)');
  const bundleIds = telegram?.id && discord?.id ? { ids: [telegram.id, discord.id] } : null;
  if (bundleIds && bundleMonthly) {
    await prisma.courseTier.update({ where: { id: bundleMonthly.id }, data: { bundleTierIds: bundleIds } as any });
  }
  if (bundleIds && bundleYearly) {
    await prisma.courseTier.update({ where: { id: bundleYearly.id }, data: { bundleTierIds: bundleIds } as any });
  }

  console.log(`Seeded ${created.length} course tiers.`);
  return created;
}

async function seedAdminUser() {
  console.log('Seeding admin user...');
  const email = process.env.ADMIN_EMAIL || 'admin@test.local';
  const existing = await prisma.users.findFirst({ where: { email } });
  if (existing) {
    console.log('Admin user already exists');
    return existing;
  }
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const hashed = await bcrypt.hash(password, 10);
  const u = await prisma.users.create({
    data: {
      name: 'Admin',
      email,
      password: hashed,
      role: 'admin',
      status: 'active',
    },
  });
  console.log(`Created admin user ${email}.`);
  return u;
}

async function main() {
  try {
    await seedCourses();
    await seedAdminUser();
    console.log('\n✅ Course and admin seed completed.');
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
