# 🚀 Gamification System Setup Guide

## Quick Start

### 1. Run Database Migration
```bash
cd backend
npx prisma migrate dev --name add_gamification_system
npx prisma generate
```

### 2. Restart Backend Server
```bash
# If running locally
npm run dev

# Or if using Vercel
vercel --prod
```

### 3. Seed Default Badges (Admin Required)

**Option A: Via API**
```bash
curl -X POST http://localhost:3003/badges/seed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Option B: Via Admin Panel**
1. Login as admin
2. Navigate to `/admin`
3. Use API testing tool or create a simple UI button to call `/badges/seed`

### 4. Test the System

**Frontend Routes:**
- `/progress` - View your progress dashboard
- `/dashboard` - Updated with progress widgets (if integrated)

**API Endpoints:**
- `GET /progress/overview` - Your overall progress
- `GET /badges/my` - Your unlocked badges
- `GET /badges/progress` - Badge unlock progress
- `GET /progress/leaderboard` - Top students

## What's Been Added

### Backend (API)
✅ **Database Models:**
- `StudentProgress` - Track course progress per user
- `ResourceProgress` - Track individual video/PDF progress
- `Badge` - Define achievement badges
- `UserBadge` - Track unlocked badges
- `DailyActivity` - Daily engagement metrics

✅ **Controllers:**
- `progress.controller.ts` - Progress tracking endpoints
- `badges.controller.ts` - Badge management endpoints

✅ **Routes:**
- `/progress/*` - Progress tracking routes
- `/badges/*` - Badge routes

✅ **Features:**
- XP system (50 XP per video, 30 per PDF, 100 per lesson, 500 per course)
- Level system (1000 XP per level)
- Streak tracking (consecutive days)
- Automatic badge unlocking
- Leaderboard (top 100 students)

### Frontend (React)
✅ **Components:**
- `ProgressTracker.tsx` - Overall progress display
- `BadgeShowcase.tsx` - Badge collection display
- `Leaderboard.tsx` - Student rankings
- `ResourceProgressTracker.tsx` - Headless progress tracker
- `useResourceProgress` - Hook for tracking resources

✅ **Pages:**
- `Progress.tsx` - Main progress dashboard at `/progress`

✅ **Route:**
- `/progress` - Progress dashboard page

## Integration Examples

### Track Video Completion
```tsx
// In your video player component
import { useResourceProgress } from '../components/ResourceProgressTracker';

const VideoPlayer = ({ resourceId }) => {
  const { markCompleted, updatePosition } = useResourceProgress(resourceId, 'video');
  
  const handleVideoEnd = async () => {
    await markCompleted();
    // User gets 50 XP automatically
  };
  
  return <video onEnded={handleVideoEnd} />;
};
```

### Track PDF Viewing
```tsx
// In your PDF viewer component
import { useResourceProgress } from '../components/ResourceProgressTracker';

const PDFViewer = ({ resourceId }) => {
  const { markCompleted, updatePosition } = useResourceProgress(resourceId, 'pdf');
  
  const handleLastPage = async () => {
    await markCompleted();
    // User gets 30 XP automatically
  };
  
  return <PDFReader onComplete={handleLastPage} />;
};
```

### Mark Lesson Complete
```tsx
// In your lesson component
const completeLesson = async (tierId) => {
  const response = await api.post(`/progress/lesson/${tierId}`);
  // User gets 100 XP
  // If course is fully completed, user gets bonus 500 XP
  console.log(response.data.message);
};
```

### Show Progress in Dashboard
```tsx
import ProgressTracker from '../components/ProgressTracker';
import BadgeShowcase from '../components/BadgeShowcase';

const Dashboard = () => {
  return (
    <Container>
      <Tabs>
        <TabPanel>
          <ProgressTracker />
        </TabPanel>
        <TabPanel>
          <BadgeShowcase />
        </TabPanel>
      </Tabs>
    </Container>
  );
};
```

## Default Badges (15 Total)

### Common (3)
- 🎯 First Steps - Complete 1 lesson
- 🎥 Video Enthusiast - Watch 5 videos
- 📚 Bookworm - Read 5 PDFs

### Rare (4)
- 📖 Dedicated Learner - Complete 10 lessons
- 🏆 Course Master - Complete 1 course
- 🔥 Week Warrior - 7-day streak

### Epic (6)
- 🎓 Trading Scholar - Complete 3 courses
- ⚡ Month Champion - 30-day streak
- 📊 Level 10 Expert - Reach level 10
- 🎬 Video Marathon - Watch 25 videos
- 📄 Knowledge Seeker - Read 25 PDFs
- 💪 Elite Student - Complete 50 lessons

### Legendary (2)
- 🌟 Unstoppable - 100-day streak
- 👑 Master Trader - Reach level 20

## Customization

### Add Your Own Badges
```bash
# Via API (admin only)
POST /badges
{
  "name": "Prop Firm Ready",
  "description": "Complete the prop firm course",
  "category": "SPECIAL",
  "rarity": "legendary",
  "unlockCriteria": {
    "type": "course_completed",
    "tierId": "YOUR_COURSE_ID"
  },
  "imageUrl": "/badges/prop-firm.png"
}
```

### Adjust XP Values
Edit `backend/src/controllers/progress.controller.ts`:
```typescript
const XP_REWARDS = {
  VIDEO_WATCHED: 50,      // Change to 100 for more XP
  PDF_VIEWED: 30,         // Change to 50
  LESSON_COMPLETED: 100,  // Change to 200
  COURSE_COMPLETED: 500,  // Change to 1000
  DAILY_LOGIN: 10,
  STREAK_BONUS: 20,
};
```

## Monitoring & Analytics

### Check User Progress
```bash
GET /progress/overview
```

### View Leaderboard
```bash
GET /progress/leaderboard
```

### Admin: View All Badges
```bash
GET /badges
```

### Admin: View Badge Unlock Stats
Query the database:
```sql
SELECT 
  b.name,
  COUNT(ub.id) as unlocked_count
FROM "Badge" b
LEFT JOIN "UserBadge" ub ON b.id = ub."badgeId"
GROUP BY b.id, b.name
ORDER BY unlocked_count DESC;
```

## Troubleshooting

### Migration Fails
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create migration manually
npx prisma migrate dev --create-only
# Edit the migration file, then:
npx prisma migrate dev
```

### Badges Not Unlocking
1. Check badge criteria in database
2. Verify `checkAndUnlockBadges()` is called after XP events
3. Check user's progress: `GET /progress/overview`

### Progress Not Saving
1. Ensure user is authenticated
2. Check resource exists in database
3. Verify purchase/enrollment for the course
4. Check browser console for errors

## Next Steps

1. ✅ Run migration
2. ✅ Seed badges
3. ✅ Test progress tracking
4. 🎨 Customize badge images (optional)
5. 📊 Add progress widgets to existing pages
6. 🔔 Add notifications for badge unlocks
7. 📱 Add mobile-friendly progress views

## Support

See `GAMIFICATION_GUIDE.md` for detailed documentation.

For issues, check:
- Backend logs: `npm run dev` output
- Frontend console: Browser DevTools
- Database: `npx prisma studio`
