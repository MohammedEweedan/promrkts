import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@test.local';
  const newPassword = process.argv[3] || process.env.ADMIN_PASSWORD || '11223344';

  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) {
    console.error(`User with email ${email} not found`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.users.update({ where: { id: user.id }, data: { password: hashed } });

  console.log(`Updated password for ${email}`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
