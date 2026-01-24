# Fake Users Management Scripts

## Overview

These scripts help you manage realistic fake users for testing and demo purposes.

## Scripts

### 1. **cleanup-fake-users.ts**
Removes all fake users and their associated data (purchases, progress, activities, reviews, etc.)

### 2. **seed-realistic-users.ts**
Creates 50,000 realistic fake users with:
- **Realistic Libyan/MENA names** (Arabic, English, French)
- **Purchases** (70% of users have 0-3 purchases)
- **Progress tracking** (XP, levels, streaks, lessons completed)
- **User activities** (logins, course views, video watches, etc.)
- **Course reviews** (30% of active users leave reviews)

### 3. **reset-and-seed-users.sh**
Bash script that runs cleanup then seeding in sequence

## Quick Start

### Option 1: Using npm scripts (Recommended)

```bash
# Clean up all fake users
npm run cleanup:fakes

# Seed 50,000 realistic users
npm run seed:realistic

# Do both (cleanup + seed)
npm run reset:users
```

### Option 2: Using ts-node directly

```bash
# Cleanup
npx ts-node scripts/cleanup-fake-users.ts

# Seed
npx ts-node scripts/seed-realistic-users.ts
```

### Option 3: Using bash script

```bash
chmod +x scripts/reset-and-seed-users.sh
./scripts/reset-and-seed-users.sh
```

## What Gets Created

### User Distribution
- **60% Arabic names** (أحمد الشريف, محمد الطاهر, etc.)
- **25% English names** (Ahmed Al-Sharif, Mohamed Al-Taher, etc.)
- **15% French names** (Ahmed Bennani, Mohamed El Mansouri, etc.)

### User Activity
- **70%** of users have purchases
- **80%** of users are active (logged in last 30 days)
- **95%** of purchases are confirmed
- **30%** of active users leave reviews

### Data Created Per User (Average)
- 0-3 purchases
- 1-3 progress records
- 5-20 activities per active course
- 0-1 reviews

### Total Expected Data (50K users)
- ~35,000 purchases
- ~35,000 progress records
- ~350,000 activities
- ~10,000 reviews

## Customization

Edit `seed-realistic-users.ts` to customize:

### Change Total Users
```typescript
const TOTAL_USERS = 50000; // Change this number
```

### Adjust Name Pools
```typescript
const AR_FIRST = ['أحمد','محمد',...]; // Add more names
const AR_LAST = ['الشريف','الطاهر',...]; // Add more names
```

### Modify Activity Distribution
```typescript
// 70% of users have purchases
if (Math.random() < 0.7) { // Change 0.7 to adjust percentage
  // ...
}
```

### Change Purchase Status Distribution
```typescript
const statusWeights = [95, 3, 2]; // [CONFIRMED, PENDING, FAILED]
```

## Performance

- **Batch size**: 200 users per batch
- **Total batches**: 250 batches for 50K users
- **Estimated time**: 10-15 minutes for 50K users
- **Database load**: Moderate (uses batching to avoid overwhelming DB)

## Important Notes

1. **All fake users have `role: 'fake_user'`** - This distinguishes them from real users
2. **Password for all fake users**: `Test123!` (for testing purposes)
3. **Email format**: `firstname-lastname-random@domain.com`
4. **Phone numbers**: Random with realistic country codes (+218, +216, +20, etc.)

## Troubleshooting

### "No course tiers found"
Make sure you have courses seeded first:
```bash
npm run seed:courses # Or your course seeding script
```

### Out of memory errors
Reduce `BATCH_SIZE` in the script:
```typescript
const BATCH_SIZE = 100; // Reduce from 200
```

### Database connection errors
Check your `.env` file has correct `DATABASE_URL`

## Cleanup

To remove all fake users and start fresh:
```bash
npm run cleanup:fakes
```

This will delete:
- All users with `role: 'fake_user'`
- Their purchases
- Their progress records
- Their activities
- Their reviews
- Their prize winners
- Their refresh tokens

Real users (with `role: 'user'`) are **never** affected.
