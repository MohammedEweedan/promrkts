# 🎮 Student Progress Tracking & Gamification System

## Overview

This system tracks student progress across courses and rewards them with XP, levels, badges, and streaks to increase engagement and completion rates.

## Features

### ✅ Progress Tracking
- **Per-Course Progress**: Track lessons completed, videos watched, PDFs viewed
- **Resource-Level Tracking**: Individual progress for each video/PDF with time spent and last position
- **Overall Progress**: Aggregate stats across all courses
- **Daily Activity**: Track daily engagement metrics

### 🏆 Gamification Elements
- **XP System**: Earn experience points for completing activities
- **Levels**: Level up every 1,000 XP
- **Streaks**: Track consecutive days of activity
- **Badges**: Unlock achievements based on various criteria
- **Leaderboard**: Compete with other students

### 🎯 XP Rewards
```typescript
VIDEO_WATCHED: 50 XP
PDF_VIEWED: 30 XP
LESSON_COMPLETED: 100 XP
COURSE_COMPLETED: 500 XP
DAILY_LOGIN: 10 XP
STREAK_BONUS: 20 XP per day
```

## Database Schema

### StudentProgress
Tracks overall progress for a user in a specific course:
- `lessonsCompleted`, `videosWatched`, `pdfsViewed`
- `xp`, `level`, `streak`
- `completedAt`, `certificateIssued`

### ResourceProgress
Tracks progress for individual resources (videos/PDFs):
- `completed`, `timeSpent`, `lastPosition`
- Linked to `StudentProgress` and `Resource`

### Badge
Defines available badges:
- `name`, `description`, `imageUrl`
- `category`: MILESTONE, ACHIEVEMENT, STREAK, SPECIAL
- `rarity`: common, rare, epic, legendary
- `unlockCriteria`: JSON defining unlock conditions

### UserBadge
Tracks which badges users have unlocked

### DailyActivity
Records daily engagement metrics per user

## API Endpoints

### Progress Endpoints

#### `GET /progress/course/:tierId`
Get progress for a specific course
```json
{
  "id": "uuid",
  "userId": "uuid",
  "tierId": "uuid",
  "lessonsCompleted": 5,
  "videosWatched": 10,
  "pdfsViewed": 8,
  "xp": 850,
  "level": 1,
  "streak": 7,
  "completionPercentage": 65.5,
  "totalResources": 20,
  "completedResources": 13
}
```

#### `GET /progress/overview`
Get overall progress across all courses
```json
{
  "totalXP": 2500,
  "totalLevel": 3,
  "maxStreak": 15,
  "coursesCompleted": 2,
  "coursesInProgress": 3,
  "totalCourses": 5,
  "recentActivity": [...],
  "courses": [...]
}
```

#### `POST /progress/resource/:resourceId`
Track resource progress (video/PDF)
```json
{
  "completed": true,
  "timeSpent": 300,
  "lastPosition": 120
}
```

Response:
```json
{
  "resourceProgress": {...},
  "xpEarned": 50,
  "message": "Resource completed! XP awarded."
}
```

#### `POST /progress/lesson/:tierId`
Mark lesson as completed
```json
{}
```

Response:
```json
{
  "message": "Lesson completed! XP awarded.",
  "xpEarned": 100,
  "courseCompleted": false
}
```

#### `GET /progress/leaderboard`
Get top 100 students by XP
```json
[
  {
    "userId": "uuid",
    "name": "John Doe",
    "totalXP": 5000,
    "level": 6
  }
]
```

### Badge Endpoints

#### `GET /badges`
Get all active badges

#### `GET /badges/my`
Get user's unlocked badges

#### `GET /badges/progress`
Get badge progress (how close to unlocking)
```json
[
  {
    "badge": {...},
    "isUnlocked": false,
    "current": 3,
    "required": 5,
    "progressPercentage": 60
  }
]
```

#### `POST /badges` (Admin)
Create a new badge
```json
{
  "name": "First Steps",
  "description": "Complete your first lesson",
  "category": "MILESTONE",
  "rarity": "common",
  "unlockCriteria": {
    "type": "lessons_completed",
    "count": 1
  }
}
```

#### `POST /badges/seed` (Admin)
Seed 15 default badges

## Badge Unlock Criteria Types

### `lessons_completed`
```json
{ "type": "lessons_completed", "count": 10 }
```

### `videos_watched`
```json
{ "type": "videos_watched", "count": 5 }
```

### `pdfs_viewed`
```json
{ "type": "pdfs_viewed", "count": 5 }
```

### `courses_completed`
```json
{ "type": "courses_completed", "count": 1 }
```

### `streak`
```json
{ "type": "streak", "days": 7 }
```

### `level`
```json
{ "type": "level", "level": 5 }
```

### `course_completed`
```json
{ "type": "course_completed", "tierId": "uuid" }
```

## Frontend Components

### `<ProgressTracker />`
Displays overall progress with stats cards and course-by-course breakdown
- Total XP, Level, Streak, Courses Completed
- Progress bars for each course
- Activity metrics

### `<BadgeShowcase />`
Shows all badges with unlock progress
- Tabs: Unlocked, Locked, All
- Visual badge cards with rarity colors
- Progress bars for locked badges

### `<Leaderboard />`
Top students leaderboard
- Top 3 podium display
- Full table with rankings
- Medals for top 3

### `<ResourceProgressTracker />`
Headless component to track video/PDF progress
- Auto-tracks time spent
- Saves progress every 30 seconds
- Marks completion

### `useResourceProgress` Hook
Hook for tracking resource progress
```tsx
const { markCompleted, updatePosition, saveProgress } = useResourceProgress(
  resourceId,
  'video'
);

// Mark video as completed
await markCompleted(videoPosition);

// Update position (for resume)
await updatePosition(currentTime);
```

## Usage Examples

### Track Video Progress
```tsx
import { useResourceProgress } from '../components/ResourceProgressTracker';

const VideoPlayer = ({ resourceId }) => {
  const { markCompleted, updatePosition } = useResourceProgress(resourceId, 'video');
  
  const handleVideoEnd = () => {
    markCompleted(videoDuration);
  };
  
  const handleTimeUpdate = (currentTime) => {
    // Save position every 30 seconds
    if (currentTime % 30 === 0) {
      updatePosition(currentTime);
    }
  };
  
  return <video onEnded={handleVideoEnd} onTimeUpdate={handleTimeUpdate} />;
};
```

### Track PDF Progress
```tsx
const PDFViewer = ({ resourceId }) => {
  const { markCompleted, updatePosition } = useResourceProgress(resourceId, 'pdf');
  
  const handlePageChange = (pageNumber) => {
    updatePosition(pageNumber);
  };
  
  const handleComplete = () => {
    markCompleted(totalPages);
  };
  
  return <PDFReader onPageChange={handlePageChange} />;
};
```

### Display Progress in Dashboard
```tsx
import ProgressTracker from '../components/ProgressTracker';
import BadgeShowcase from '../components/BadgeShowcase';

const Dashboard = () => {
  return (
    <VStack spacing={8}>
      <ProgressTracker />
      <BadgeShowcase />
    </VStack>
  );
};
```

## Setup Instructions

### 1. Run Database Migration
```bash
cd backend
npx prisma migrate dev --name add_gamification_system
npx prisma generate
```

### 2. Seed Default Badges (Admin Only)
```bash
# Via API (requires admin auth token)
curl -X POST http://localhost:3003/badges/seed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Or visit `/admin` panel and use the seed endpoint.

### 3. Access Progress Page
Navigate to `/progress` to view your progress dashboard.

## Default Badges

1. **First Steps** (Common) - Complete your first lesson
2. **Video Enthusiast** (Common) - Watch 5 videos
3. **Bookworm** (Common) - Read 5 PDFs
4. **Dedicated Learner** (Rare) - Complete 10 lessons
5. **Course Master** (Rare) - Complete your first course
6. **Trading Scholar** (Epic) - Complete 3 courses
7. **Week Warrior** (Rare) - Maintain a 7-day streak
8. **Month Champion** (Epic) - Maintain a 30-day streak
9. **Unstoppable** (Legendary) - Maintain a 100-day streak
10. **Level 5 Trader** (Rare) - Reach level 5
11. **Level 10 Expert** (Epic) - Reach level 10
12. **Master Trader** (Legendary) - Reach level 20
13. **Video Marathon** (Epic) - Watch 25 videos
14. **Knowledge Seeker** (Epic) - Read 25 PDFs
15. **Elite Student** (Epic) - Complete 50 lessons

## Customization

### Add Custom Badges
```typescript
await prisma.badge.create({
  data: {
    name: 'Prop Firm Ready',
    description: 'Complete the prop firm preparation course',
    category: 'SPECIAL',
    rarity: 'legendary',
    unlockCriteria: {
      type: 'course_completed',
      tierId: 'PROP_FIRM_COURSE_ID'
    },
    imageUrl: '/badges/prop-firm.png',
    displayOrder: 100
  }
});
```

### Adjust XP Rewards
Edit `backend/src/controllers/progress.controller.ts`:
```typescript
const XP_REWARDS = {
  VIDEO_WATCHED: 50,    // Change these values
  PDF_VIEWED: 30,
  LESSON_COMPLETED: 100,
  COURSE_COMPLETED: 500,
};
```

### Change Level Requirements
```typescript
const XP_PER_LEVEL = 1000; // XP needed per level
```

## Performance Considerations

- Progress is tracked in real-time
- Badge checks run automatically after XP-earning activities
- Daily activity is aggregated for analytics
- Leaderboard is cached (consider Redis for production)

## Future Enhancements

- [ ] Weekly/Monthly challenges
- [ ] Team competitions
- [ ] Badge collections (sets)
- [ ] Trading journal integration
- [ ] Social sharing of achievements
- [ ] Custom profile badges
- [ ] Seasonal events
- [ ] Referral bonuses

## Troubleshooting

### Badges not unlocking?
Check the `checkAndUnlockBadges()` function is called after XP-earning activities.

### Progress not saving?
Ensure the `ResourceProgressTracker` component is mounted or the `useResourceProgress` hook is active.

### Leaderboard empty?
Run the seed script to create initial badges and ensure users have completed activities.

## Support

For issues or questions, contact the development team or create an issue in the repository.
