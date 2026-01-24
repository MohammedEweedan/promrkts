/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing badge imageUrl paths...\n');
  
  const badges = await prisma.badge.findMany({
    where: { isActive: true },
  });

  for (const badge of badges) {
    const slug = slugify(badge.name, { lower: true, strict: true });
    const correctUrl = `/api/uploads/badges/${slug}.png`;
    
    if (badge.imageUrl !== correctUrl) {
      await prisma.badge.update({
        where: { id: badge.id },
        data: { imageUrl: correctUrl },
      });
      console.log(`✅ Updated "${badge.name}": ${badge.imageUrl} → ${correctUrl}`);
    } else {
      console.log(`⏭️  "${badge.name}" already correct: ${correctUrl}`);
    }
  }

  console.log('\n✅ All badge imageUrl paths fixed!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
