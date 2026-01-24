# 50K Users Load Testing Guide

This guide will help you test your platform with 50,000 realistic active traders to evaluate database performance, leaderboard functionality, revenue tracking, and overall system scalability.

## 📋 Prerequisites

1. **Database Setup**: Ensure your PostgreSQL database is running and properly configured
2. **Course Tiers**: Make sure you have at least a few course tiers created in the database
3. **Sufficient Resources**: Ensure your database has enough storage (recommend at least 10GB free)

## 🚀 Quick Start

### Step 1: Seed 50,000 Users

This will create 50,000 realistic users with:
- Varied registration dates (last 2 years)
- Realistic names from different regions (MENA, Europe, North America)
- Email addresses and phone numbers
- Purchase history (70% of users have purchases)
- Course progress and XP/levels
- Daily activity records
- Course reviews

```bash
cd backend
npm run seed:50k
```

**Expected Duration**: 15-30 minutes depending on your machine
**Database Size**: ~2-5GB additional storage

### Step 2: Simulate User Activity

This simulates realistic user behavior including:
- Logins
- Video watching
- Lesson completion
- New purchases
- Course reviews
- Streak maintenance

```bash
# Simulate 1 day of activity (default)
npm run simulate:activity

# Simulate multiple days
SIMULATION_DAYS=7 npm run simulate:activity
```

**Expected Duration**: 5-15 minutes per day simulated

### Step 3: Analyze Performance

This runs comprehensive performance tests on:
- User queries
- Leaderboard queries
- Purchase/revenue queries
- Progress tracking
- Course analytics
- Concurrent load testing

```bash
npm run analyze:performance
```

**Expected Duration**: 2-5 minutes

### Step 4: Run Full Test Suite

Run all three steps in sequence:

```bash
npm run test:full
```

## 📊 What Gets Created

### Users (50,000)
- **Name Distribution**: Mix of Arabic, English, and French names
- **Email Domains**: gmail.com, yahoo.com, hotmail.com, outlook.com, protonmail.com, icloud.com
- **Phone Numbers**: International format with country codes
- **Registration**: Weighted towards recent months (more new users)
- **Activity**: 80% active in last 30 days, 20% dormant

### Purchases (~35,000)
- **Status Distribution**: 95% confirmed, 3% pending, 2% failed
- **Per User**: 0-3 purchases (weighted towards 1)
- **Transaction Hashes**: Realistic blockchain-style hashes for confirmed purchases
- **Pricing**: Course price with occasional discounts (10% variation)

### Student Progress (~35,000)
- **XP Range**: 0-15,000 XP
- **Levels**: 1-16 (calculated from XP)
- **Streaks**: 0-6 days (weighted towards lower streaks)
- **Completion**: 20% completion rate
- **Certificates**: 80% of completed courses have certificates issued

### Daily Activities (~600,000)
- **Time Range**: Last 30 days for active users
- **Lessons**: 0-5 per day
- **Videos**: 0-3 per day
- **PDFs**: 0-2 per day
- **Time Spent**: 5 minutes to 2 hours per session
- **XP Earned**: 50-500 per day

### Course Reviews (~10,000)
- **Rating Distribution**: Heavily weighted towards 5 stars (58%), then 4 (25%), 3 (10%), 2 (5%), 1 (2%)
- **Comments**: 70% have comments, 30% rating-only
- **Review Rate**: ~30% of purchases get reviewed

## 🎯 User Behavior Simulation

The activity simulator assigns each user a behavior type:

| Behavior Type | Weight | Actions/Day | Description |
|--------------|--------|-------------|-------------|
| **Highly Active** | 10% | 5-15 | Power users, daily learners |
| **Active** | 25% | 2-5 | Regular learners |
| **Moderate** | 35% | 1-3 | Occasional learners |
| **Casual** | 20% | 0-1 | Infrequent users |
| **Inactive** | 10% | 0 | Dormant accounts |

### Simulated Actions

Each action has a weighted probability:

- **Watch Video** (40%): Increments videos watched, adds XP (50-200), updates daily activity
- **Complete Lesson** (30%): Increments lessons completed, adds XP (100-300), updates daily activity
- **Make Purchase** (5%): Buys a new course, creates progress record
- **Leave Review** (10%): Reviews a purchased course with rating and comment
- **Update Streak** (15%): Maintains or resets streak based on last activity

## 📈 Performance Metrics

The analysis script measures:

### User Queries
- Count all users
- Get user by email (indexed lookup)
- Get user with purchases (join query)
- Get active users (date filter)

### Leaderboard Queries
- Top 100 by XP
- Top 100 by level
- Top 100 by streak
- User rank calculation

### Revenue Queries
- Total purchases count
- Confirmed purchases
- Total revenue
- Revenue by course tier
- Monthly revenue trend

### Progress Queries
- Total progress records
- Average XP/level/streak
- Completion rate
- Daily active users
- Total time spent

### Load Testing
- 100 concurrent leaderboard queries
- Average query time
- Database response under load

## 🔍 Expected Results

### Query Performance (with proper indexes)
- User by email: <5ms
- User with purchases: <20ms
- Leaderboard top 100: <50ms
- Revenue aggregation: <100ms
- Active users count: <30ms

### Platform Statistics
- **Conversion Rate**: ~70% (users with purchases)
- **Average Purchases/User**: ~0.7
- **Completion Rate**: ~20%
- **Review Rate**: ~30%
- **Average Rating**: ~4.5/5
- **Active Users (30d)**: ~80%

## 🛠️ Customization

### Modify User Count

Edit `scripts/seed-50k-users.ts`:

```typescript
const TOTAL_USERS = 100000; // Change to desired number
```

### Adjust Behavior Weights

Edit `scripts/simulate-user-activity.ts`:

```typescript
const USER_BEHAVIORS = {
  HIGHLY_ACTIVE: { weight: 15, actionsPerDay: [8, 20] }, // More active users
  // ... adjust as needed
};
```

### Change Purchase Rate

Edit `scripts/seed-50k-users.ts`:

```typescript
if (Math.random() < 0.9) { // 90% instead of 70%
  // Purchase logic
}
```

## 🧹 Cleanup

To remove test data:

```sql
-- Delete all test users (be careful!)
DELETE FROM users WHERE email LIKE '%@gmail.com' OR email LIKE '%@yahoo.com';

-- Or delete by date range
DELETE FROM users WHERE created_at > '2023-01-01';

-- Cascade will automatically delete related records (purchases, progress, etc.)
```

## 📊 Database Indexes

Ensure these indexes exist for optimal performance:

```sql
-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Purchase indexes
CREATE INDEX IF NOT EXISTS idx_purchase_user ON "Purchase"("userId");
CREATE INDEX IF NOT EXISTS idx_purchase_tier ON "Purchase"("tierId");
CREATE INDEX IF NOT EXISTS idx_purchase_status ON "Purchase"(status);

-- Progress indexes
CREATE INDEX IF NOT EXISTS idx_progress_user ON "StudentProgress"("userId");
CREATE INDEX IF NOT EXISTS idx_progress_tier ON "StudentProgress"("tierId");
CREATE INDEX IF NOT EXISTS idx_progress_xp ON "StudentProgress"(xp DESC);
CREATE INDEX IF NOT EXISTS idx_progress_level ON "StudentProgress"(level DESC);
CREATE INDEX IF NOT EXISTS idx_progress_streak ON "StudentProgress"(streak DESC);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_daily_activity_user ON "DailyActivity"("userId");
CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON "DailyActivity"("activityDate");

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_review_tier ON "CourseReview"("tierId");
CREATE INDEX IF NOT EXISTS idx_review_user ON "CourseReview"("userId");
```

## 🚨 Troubleshooting

### Out of Memory
- Reduce `BATCH_SIZE` in seed script (default: 500)
- Run simulation in smaller chunks
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run seed:50k`

### Slow Performance
- Check database indexes
- Ensure PostgreSQL has sufficient resources
- Consider using connection pooling
- Monitor database CPU/memory usage

### Duplicate Key Errors
- Normal for some operations (reviews, daily activities)
- Script handles these gracefully with try/catch
- Check for unique constraint violations in logs

## 📝 Notes

- **Realistic Data**: Names, emails, and behaviors are designed to mimic real users from MENA, Europe, and North America
- **Scalability**: Scripts are designed to handle 100K+ users with proper batching
- **Safety**: All test data uses fake emails and hashed passwords
- **Reversible**: Easy to clean up test data with SQL queries
- **Production-Ready**: Can be adapted for staging environment testing

## 🎓 Use Cases

1. **Performance Testing**: Identify slow queries and bottlenecks
2. **Leaderboard Validation**: Ensure leaderboard scales with many users
3. **Revenue Analytics**: Test reporting dashboards with realistic data
4. **Database Optimization**: Find missing indexes and query optimization opportunities
5. **Frontend Testing**: Test UI with realistic data volumes
6. **API Load Testing**: Combine with artillery for full API load tests

## 🔗 Related Scripts

- `artillery.yml`: API load testing configuration
- `scripts/html-to-pdf.ts`: Generate PDF reports
- `prisma/schema.prisma`: Database schema definition

---

**Happy Testing! 🚀**

For questions or issues, check the console output for detailed error messages and performance metrics.
