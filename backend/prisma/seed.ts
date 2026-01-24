// prisma/seed.ts
// Run main seeding flow used for development
import { execSync } from 'child_process';

console.log('Running prisma seed wrapper...');
try {
  // NOTE: migrations should be run before seeding (e.g. via `prisma migrate reset`)
  // Running `prisma migrate dev` here can generate new migrations during seed.
  execSync('npm run seed:courses', { stdio: 'inherit' });
  execSync('npm run seed:realistic', { stdio: 'inherit' });
  console.log('\n✅ Prisma wrapper seed completed');
  process.exit(0);
} catch (e) {
  console.error('Prisma wrapper seed failed:', e);
  process.exit(1);
}
