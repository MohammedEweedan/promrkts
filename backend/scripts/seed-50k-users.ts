// scripts/seed-50k-users.ts
// Seed 50,000 realistic active traders with purchases, progress, and activity

import { PrismaClient, PurchaseStatus, Level } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient() as any;

// Realistic name pools
const firstNames = [
  'Mohammed', 'Ahmed', 'Ali', 'Omar', 'Youssef', 'Khaled', 'Hassan', 'Ibrahim', 'Fatima', 'Aisha',
  'Sarah', 'Mariam', 'Nour', 'Layla', 'Zainab', 'Abdullah', 'Mustafa', 'Karim', 'Tariq', 'Rashid',
  'John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Thomas', 'Charles', 'Daniel',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Karen', 'Nancy',
  'Pierre', 'Jean', 'Michel', 'Philippe', 'Alain', 'Christophe', 'François', 'Laurent', 'Nicolas', 'Antoine',
  'Marie', 'Nathalie', 'Isabelle', 'Sylvie', 'Catherine', 'Françoise', 'Monique', 'Sophie', 'Sandrine', 'Valérie',
  'Hassan', 'Hussein', 'Mahmoud', 'Samir', 'Walid', 'Rami', 'Fadi', 'Nabil', 'Jamal', 'Adel',
  'Amina', 'Hana', 'Rana', 'Dina', 'Lina', 'Mona', 'Rania', 'Salma', 'Yasmin', 'Zeina'
];

const lastNames = [
  'Al-Mansour', 'Al-Rashid', 'Al-Hashimi', 'Al-Najjar', 'Al-Sayed', 'Al-Masri', 'Al-Shami', 'Al-Maghribi',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Dupont', 'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Richard', 'Durand', 'Leroy',
  'Hassan', 'Ali', 'Ibrahim', 'Ahmed', 'Mohammed', 'Khalil', 'Mansour', 'Nasser', 'Farah', 'Khoury',
  'Ben Salah', 'Ben Ali', 'Trabelsi', 'Bouazizi', 'Ghannouchi', 'Essid', 'Jebali', 'Marzouki'
];

const countries = ['Libya', 'Egypt', 'Tunisia', 'Morocco', 'Algeria', 'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Jordan', 'Lebanon', 'Palestine', 'USA', 'UK', 'France', 'Germany', 'Canada'];
const cities = ['Tripoli', 'Benghazi', 'Cairo', 'Tunis', 'Casablanca', 'Dubai', 'Riyadh', 'Doha', 'London', 'Paris', 'New York', 'Toronto'];

// Utility functions
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName: string, lastName: string, index: number): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com', 'icloud.com'];
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  const patterns = [
    `${cleanFirst}.${cleanLast}${index}@${randomElement(domains)}`,
    `${cleanFirst}${cleanLast}${index}@${randomElement(domains)}`,
    `${cleanFirst}_${cleanLast}${index}@${randomElement(domains)}`,
    `${cleanFirst}${index}@${randomElement(domains)}`,
  ];
  return randomElement(patterns);
}

function generatePhone(): string {
  const countryCodes = ['+218', '+20', '+216', '+212', '+213', '+971', '+966', '+974', '+1', '+44', '+33'];
  return `${randomElement(countryCodes)}${randomInt(100000000, 999999999)}`;
}

// Weighted random selection (more realistic distribution)
function weightedRandom(weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
  }
  return weights.length - 1;
}

async function main() {
  console.log('🚀 Starting 50K users seed...\n');

  // Get all course tiers
  const tiers = await prisma.courseTier.findMany();
  if (tiers.length === 0) {
    console.error('❌ No course tiers found. Please seed courses first.');
    process.exit(1);
  }

  console.log(`📚 Found ${tiers.length} course tiers`);

  // Password hash (same for all test users for simplicity)
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  const BATCH_SIZE = 500; // Process in batches to avoid memory issues
  const TOTAL_USERS = 50000;
  const batches = Math.ceil(TOTAL_USERS / BATCH_SIZE);

  let totalCreated = 0;
  let totalPurchases = 0;
  let totalProgress = 0;
  let totalActivities = 0;

  for (let batch = 0; batch < batches; batch++) {
    console.log(`\n📦 Processing batch ${batch + 1}/${batches}...`);
    
    const batchUsers: any[] = [];
    const batchSize = Math.min(BATCH_SIZE, TOTAL_USERS - totalCreated);

    for (let i = 0; i < batchSize; i++) {
      const userIndex = totalCreated + i;
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const email = generateEmail(firstName, lastName, userIndex);
      
      // Random registration date (last 2 years, with more recent users)
      const registrationWeights = [1, 2, 3, 5, 8, 13, 21, 34]; // Fibonacci-like, more recent
      const monthsAgo = weightedRandom(registrationWeights);
      const createdAt = randomDate(
        new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - (monthsAgo - 1) * 30 * 24 * 60 * 60 * 1000)
      );

      // Last login (80% active in last 30 days)
      const isActive = Math.random() < 0.8;
      const lastLogin = isActive
        ? randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
        : randomDate(createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      batchUsers.push({
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        phone: Math.random() < 0.7 ? generatePhone() : null,
        role: 'user',
        status: 'active',
        created_at: createdAt,
        last_login: lastLogin,
        cart: [] as any,
      });
    }

    // Insert users in batch
    const createdUsers = await prisma.users.createManyAndReturn({
      data: batchUsers,
    });

    totalCreated += createdUsers.length;

    // Create purchases, progress, and activities for each user
    for (const user of createdUsers) {
      // 70% of users have at least one purchase
      if (Math.random() < 0.7) {
        const numPurchases = weightedRandom([50, 30, 15, 5]); // 0-3 purchases, weighted
        
        for (let p = 0; p < numPurchases; p++) {
          const tier: any = randomElement(tiers);
          const purchaseDate = randomDate(user.created_at, new Date());
          
          // 95% confirmed, 5% pending/failed
          const statusWeights = [95, 3, 2]; // CONFIRMED, PENDING, FAILED
          const statusIndex = weightedRandom(statusWeights);
          const status = [PurchaseStatus.CONFIRMED, PurchaseStatus.PENDING, PurchaseStatus.FAILED][statusIndex];

          try {
            const purchase = await prisma.purchase.create({
              data: {
                userId: user.id,
                tierId: tier.id,
                status,
                txnHash: status === PurchaseStatus.CONFIRMED ? `0x${Math.random().toString(16).slice(2, 66)}` : null,
                createdAt: purchaseDate,
                finalPriceUsd: tier.price_usdt * randomFloat(0.9, 1.0), // Some discounts
              },
            });
            totalPurchases++;

            // Create progress for confirmed purchases
            if (status === PurchaseStatus.CONFIRMED) {
              // XP and level (realistic distribution)
              const xp = randomInt(0, 15000);
              const level = Math.floor(xp / 1000) + 1;
              
              // Streak (most users have low streaks)
              const streakWeights = [40, 25, 15, 10, 5, 3, 2]; // 0-6 days
              const streak = weightedRandom(streakWeights);
              
              // Completion metrics
              const lessonsCompleted = randomInt(0, 50);
              const videosWatched = randomInt(0, 30);
              const pdfsViewed = randomInt(0, 20);
              
              // Last active date (for streak calculation)
              const lastActiveDate = streak > 0 ? randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), new Date()) : null;
              
              // 20% completion rate
              const isCompleted = Math.random() < 0.2;
              const completedAt = isCompleted ? randomDate(purchaseDate, new Date()) : null;

              await prisma.studentProgress.create({
                data: {
                  userId: user.id,
                  tierId: tier.id,
                  lessonsCompleted,
                  videosWatched,
                  pdfsViewed,
                  quizzesScore: randomFloat(0, 100),
                  tradingScore: randomInt(0, 1000),
                  level,
                  xp,
                  streak,
                  lastActiveDate,
                  completedAt,
                  certificateIssued: isCompleted && Math.random() < 0.8,
                  createdAt: purchaseDate,
                  updatedAt: new Date(),
                },
              });
              totalProgress++;

              // Create daily activities (last 30 days for active users)
              if (Math.random() < 0.6) {
                const daysActive = randomInt(5, 30);
                for (let d = 0; d < daysActive; d++) {
                  const activityDate = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
                  
                  try {
                    await prisma.dailyActivity.create({
                      data: {
                        userId: user.id,
                        activityDate,
                        lessonsCompleted: randomInt(0, 5),
                        videosWatched: randomInt(0, 3),
                        pdfsViewed: randomInt(0, 2),
                        timeSpent: randomInt(300, 7200), // 5 min to 2 hours
                        xpEarned: randomInt(50, 500),
                      },
                    });
                    totalActivities++;
                  } catch (e) {
                    // Skip duplicates
                  }
                }
              }
            }
          } catch (e) {
            // Skip duplicate purchases
          }
        }
      }

      // Add some course reviews (30% of users with purchases)
      if (Math.random() < 0.3) {
        const userPurchases = await prisma.purchase.findMany({
          where: { userId: user.id, status: PurchaseStatus.CONFIRMED },
        });

        for (const purchase of userPurchases) {
          if (Math.random() < 0.4) {
            // 40% of purchases get reviewed
            const ratingWeights = [2, 5, 10, 25, 58]; // 1-5 stars, heavily weighted to 5
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
              null, // Some reviews without comments
            ];

            try {
              await prisma.courseReview.create({
                data: {
                  tierId: purchase.tierId,
                  userId: user.id,
                  rating,
                  comment: Math.random() < 0.7 ? randomElement(comments) : null,
                  created_at: randomDate(purchase.createdAt, new Date()),
                },
              });
            } catch (e) {
              // Skip duplicates
            }
          }
        }
      }
    }

    console.log(`✅ Batch ${batch + 1} complete: ${createdUsers.length} users created`);
    console.log(`   Total so far: ${totalCreated} users, ${totalPurchases} purchases, ${totalProgress} progress records, ${totalActivities} activities`);
  }

  console.log('\n🎉 Seed complete!');
  console.log(`📊 Final stats:`);
  console.log(`   - Users: ${totalCreated}`);
  console.log(`   - Purchases: ${totalPurchases}`);
  console.log(`   - Progress records: ${totalProgress}`);
  console.log(`   - Daily activities: ${totalActivities}`);
  console.log(`   - Average purchases per user: ${(totalPurchases / totalCreated).toFixed(2)}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
