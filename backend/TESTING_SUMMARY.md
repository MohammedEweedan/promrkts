# 50K Users Testing - Quick Start Guide

## ✅ All TypeScript Errors Fixed

All scripts are now ready to run without TypeScript errors.

## 🚀 Running the Tests

### Step 1: Generate Prisma Client (Required First!)

Before running any scripts, you MUST generate the Prisma client:

```bash
cd backend
npm run prisma:generate
# or
npx prisma generate
```

This will create the TypeScript types for your database models.

### Step 2: Seed 50,000 Users

```bash
npm run seed:50k
```

**Duration**: 15-30 minutes  
**Creates**:
- 50,000 users with realistic data
- ~35,000 purchases
- ~35,000 progress records
- ~600,000 daily activities
- ~10,000 course reviews

### Step 3: Simulate Activity (Optional)

```bash
# Simulate 1 day of activity
npm run simulate:activity

# Simulate 7 days
SIMULATION_DAYS=7 npm run simulate:activity
```

**Duration**: 5-15 minutes per day

### Step 4: Analyze Performance

```bash
npm run analyze:performance
```

**Duration**: 2-5 minutes  
**Tests**:
- User queries
- Leaderboard performance
- Revenue calculations
- Progress tracking
- Concurrent load (100 queries)

### Step 5: Run Everything

```bash
npm run test:full
```

Runs all three steps in sequence.

## 📊 What to Expect

### Database Size
- **Before**: ~500MB
- **After**: ~3-5GB
- **Indexes**: Ensure all indexes exist (see LOAD_TESTING.md)

### Query Performance (with indexes)
- User by email: <5ms
- Leaderboard top 100: <50ms
- Revenue aggregation: <100ms
- Concurrent load: <100ms average

### Platform Statistics
- **Users**: 50,000
- **Active Users (30d)**: ~40,000 (80%)
- **Purchases**: ~35,000
- **Conversion Rate**: ~70%
- **Completion Rate**: ~20%
- **Average Rating**: ~4.5/5

## 🔍 Monitoring

### Check Progress
```bash
# Watch the console output
# Each script provides detailed progress updates

# Check database size
psql -d your_database -c "SELECT pg_size_pretty(pg_database_size('your_database'));"

# Count users
psql -d your_database -c "SELECT COUNT(*) FROM users;"
```

### Prisma Studio
```bash
npm run prisma:studio
```

Opens a GUI to browse your data at http://localhost:5555

## 🧹 Cleanup

### Remove All Test Data

```sql
-- Delete users created by the seed script
DELETE FROM users WHERE email LIKE '%@gmail.com' 
   OR email LIKE '%@yahoo.com' 
   OR email LIKE '%@hotmail.com'
   OR email LIKE '%@outlook.com'
   OR email LIKE '%@protonmail.com'
   OR email LIKE '%@icloud.com';

-- Cascade will automatically delete:
-- - purchases
-- - studentProgress
-- - dailyActivity
-- - courseReview
-- - userBadges
```

### Vacuum Database (After Cleanup)

```sql
VACUUM FULL ANALYZE;
```

## ⚠️ Important Notes

1. **Prisma Generate**: Always run `npm run prisma:generate` after schema changes
2. **Database Backup**: Backup your database before running tests
3. **Resources**: Ensure sufficient disk space (10GB+) and RAM (4GB+)
4. **Indexes**: Critical for performance - see LOAD_TESTING.md for index creation
5. **Production**: Do NOT run these scripts on production database

## 🐛 Troubleshooting

### "Property 'studentProgress' does not exist"
**Solution**: Run `npm run prisma:generate`

### Out of Memory
**Solution**: 
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run seed:50k
```

### Slow Performance
**Solution**: 
1. Check database indexes
2. Reduce BATCH_SIZE in scripts
3. Monitor database CPU/memory

### Connection Errors
**Solution**:
1. Check DATABASE_URL in .env
2. Ensure PostgreSQL is running
3. Check connection limits

## 📈 Next Steps

After running the tests:

1. **Analyze Results**: Review console output for performance metrics
2. **Optimize Queries**: Identify slow queries and add indexes
3. **Test Frontend**: Load the frontend with realistic data
4. **API Load Test**: Use artillery for API stress testing
5. **Monitor Production**: Set up monitoring based on test results

## 🎯 Use Cases

- **Performance Testing**: Find bottlenecks before launch
- **Capacity Planning**: Determine infrastructure needs
- **Feature Testing**: Test new features with realistic data
- **Demo/Staging**: Populate staging environment
- **Training**: Train support team with realistic data

---

**Ready to test? Start with Step 1!** 🚀

For detailed documentation, see [LOAD_TESTING.md](./LOAD_TESTING.md)
