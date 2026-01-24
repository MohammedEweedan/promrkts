# Apply i18n and Theme Updates

## Summary
This document contains all the updates needed for your progress/badges/leaderboard components to use:
- ✅ i18n (EN, FR, AR)
- ✅ Theme colors (`#65a8bf` border, `bg.surface`)
- ✅ Dark/light mode support
- ✅ Backend URL for badge images

## Status
✅ **COMPLETED:**
- `frontend/src/components/BadgeShowcase.tsx` - Fully updated
- `frontend/src/pages/Progress.tsx` - Fully updated

## Step 1: Add Missing i18n Keys

Add these to `frontend/src/i18n.ts` in the **FR** and **AR** sections (EN already has them):

### French (fr.translation)
```javascript
progress: {
  loading: 'Chargement...',
  no_data: 'Aucune donnée disponible',
  recent_activity: 'Activité Récente',
},
badges: {
  all: 'Tous',
},
leaderboard: {
  loading: 'Chargement...',
  no_data: 'Aucune donnée disponible',
  onboarding: {
    title: 'Bienvenue au Classement!',
    subtitle: 'Gagnez de l\'XP et montez dans le classement',
    how_it_works: 'Comment ça marche',
    earn_xp: 'Gagnez de l\'XP',
    earn_xp_desc: 'Terminez des leçons, regardez des vidéos et lisez des PDFs',
    level_up: 'Montez de Niveau',
    level_up_desc: 'Accumulez de l\'XP pour débloquer de nouveaux niveaux',
    compete: 'Compétez',
    compete_desc: 'Voyez comment vous vous comparez aux autres étudiants',
    pro_tip: 'Astuce Pro',
    pro_tip_desc: 'Débloquez des badges en atteignant des jalons!',
    get_started: 'Commencer',
    view_progress: 'Voir Mes Progrès',
  },
},
admin: {
  badge_stats: {
    title: 'Statistiques des Badges',
    total_badges: 'Total des Badges',
    most_popular: 'Le Plus Populaire',
    rarest: 'Le Plus Rare',
    students: 'étudiants',
    available: 'Disponible à débloquer',
    unlock_stats: 'Statistiques de Déblocage',
  },
},
```

### Arabic (ar.translation)
```javascript
progress: {
  loading: 'جار التحميل...',
  no_data: 'لا توجد بيانات متاحة',
  recent_activity: 'النشاط الأخير',
},
badges: {
  all: 'الكل',
},
leaderboard: {
  loading: 'جار التحميل...',
  no_data: 'لا توجد بيانات متاحة',
  onboarding: {
    title: 'مرحباً بك في لوحة المتصدرين!',
    subtitle: 'اكسب نقاط الخبرة وتقدم في الترتيب',
    how_it_works: 'كيف يعمل',
    earn_xp: 'اكسب نقاط الخبرة',
    earn_xp_desc: 'أكمل الدروس، شاهد الفيديوهات واقرأ ملفات PDF',
    level_up: 'ارتقِ بالمستوى',
    level_up_desc: 'اجمع نقاط الخبرة لفتح مستويات جديدة',
    compete: 'تنافس',
    compete_desc: 'شاهد كيف تقارن نفسك بالطلاب الآخرين',
    pro_tip: 'نصيحة محترف',
    pro_tip_desc: 'افتح الشارات بالوصول إلى المعالم!',
    get_started: 'ابدأ',
    view_progress: 'عرض تقدمي',
  },
},
admin: {
  badge_stats: {
    title: 'إحصائيات الشارات',
    total_badges: 'إجمالي الشارات',
    most_popular: 'الأكثر شعبية',
    rarest: 'الأندر',
    students: 'طلاب',
    available: 'متاح للفتح',
    unlock_stats: 'إحصائيات الفتح',
  },
},
```

## Step 2: Quick Component Updates

For each remaining component, apply these patterns:

### Pattern A: Add imports and constants
```tsx
import { useTranslation } from 'react-i18next';

const GOLD = '#65a8bf';
const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL) || 'http://localhost:3003';
```

### Pattern B: Add translation hook
```tsx
const { t } = useTranslation();
```

### Pattern C: Replace theme colors
```tsx
// OLD
const bgColor = useColorModeValue('white', 'gray.800');
const borderColor = useColorModeValue('gray.200', 'gray.700');

// NEW (remove these variables, use directly)
bg="bg.surface"
borderColor={GOLD}
```

### Pattern D: Wrap text strings
```tsx
// OLD
<Text>Loading...</Text>

// NEW
<Text>{t('common.loading', 'Loading...')}</Text>
```

## Step 3: Test Everything

```bash
# In frontend directory
npm start

# Then test:
# 1. Switch languages (EN/FR/AR)
# 2. Toggle dark/light mode
# 3. Visit /progress page
# 4. Check badge images load
# 5. Verify all text is translated
```

## Quick Reference: Translation Keys

### Progress
- `progress.title` - "My Progress"
- `progress.overview` - "Overview"
- `progress.badges` - "Badges"
- `progress.leaderboard` - "Leaderboard"
- `progress.level` - "Level"
- `progress.xp` - "XP"
- `progress.streak` - "Streak"
- `progress.loading` - "Loading..."

### Badges
- `badges.title` - "Badges"
- `badges.unlocked` - "Unlocked"
- `badges.locked` - "Locked"
- `badges.all` - "All"
- `badges.no_badges_yet` - "No badges unlocked yet"
- `badges.complete_lessons` - "Complete lessons and courses to earn badges!"

### Leaderboard
- `leaderboard.title` - "Leaderboard"
- `leaderboard.top_students` - "Top Students"
- `leaderboard.rank` - "Rank"
- `leaderboard.student` - "Student"
- `leaderboard.you` - "You"

### Common
- `common.loading` - "Loading..."
- `common.save` - "Save"
- `common.close` - "Close"

## Files Already Updated
✅ `frontend/src/components/BadgeShowcase.tsx`
✅ `frontend/src/pages/Progress.tsx`

## Files Needing Updates
⏳ `frontend/src/components/Leaderboard.tsx`
⏳ `frontend/src/components/LeaderboardOnboarding.tsx`
⏳ `frontend/src/components/ProgressTracker.tsx`
⏳ `frontend/src/components/ProgressWidget.tsx`
⏳ `frontend/src/components/admin/BadgeLeaderboard.tsx`

## Need Help?
The pattern is consistent across all files:
1. Add imports
2. Add translation hook
3. Replace hardcoded colors with theme
4. Wrap text with t()
5. Test in all languages and modes
