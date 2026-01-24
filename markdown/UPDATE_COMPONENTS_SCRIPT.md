# Component Updates for i18n + Theme

## Summary
All components updated to use:
- `useTranslation()` from 'react-i18next'
- `borderColor="#65a8bf"` (GOLD constant)
- `bg="bg.surface"` for cards
- Proper dark/light mode support via semantic tokens

## Completed
✅ BadgeShowcase.tsx - Updated with i18n and theme colors

## Remaining Components to Update

### 1. Progress.tsx
```tsx
// Add at top
import { useTranslation } from 'react-i18next';

// In component
const { t } = useTranslation();

// Update heading
<Heading size="xl">{t('progress.title', 'My Progress')}</Heading>

// Update tabs
<Tab>📊 {t('progress.overview', 'Overview')}</Tab>
<Tab>🏆 {t('progress.badges', 'Badges')}</Tab>
<Tab>🥇 {t('progress.leaderboard', 'Leaderboard')}</Tab>
```

### 2. Leaderboard.tsx
- Add `const GOLD = '#65a8bf';`
- Replace `borderColor={borderColor}` with `borderColor={GOLD}`
- Replace `bg={bgColor}` with `bg="bg.surface"`
- Add i18n for all text strings

### 3. LeaderboardOnboarding.tsx
- Same theme updates
- Add i18n for onboarding text

### 4. ProgressTracker.tsx
- Same theme updates
- Add i18n for stats labels

### 5. ProgressWidget.tsx
- Same theme updates
- Add i18n for widget text

### 6. admin/BadgeLeaderboard.tsx
- Same theme updates
- Add i18n for admin labels
- Fix image src to prepend BACKEND_URL

## Quick Find & Replace Patterns

### Pattern 1: Border Color
Find: `borderColor={borderColor}`
Replace: `borderColor="#65a8bf"`

### Pattern 2: Background Color
Find: `bg={bgColor}`
Replace: `bg="bg.surface"`

### Pattern 3: Add Translation Hook
Add after imports:
```tsx
const { t } = useTranslation();
```

### Pattern 4: Text Color (remove hardcoded grays)
Find: `color="gray.500"`
Replace: (remove the prop, let theme handle it)

Find: `color="gray.600"`
Replace: (remove the prop)

## Testing Checklist
- [ ] Hard refresh browser (Cmd+Shift+R)
- [ ] Test EN language
- [ ] Test FR language  
- [ ] Test AR language (RTL)
- [ ] Test dark mode
- [ ] Test light mode
- [ ] Verify badge images load
- [ ] Verify all text is translated
- [ ] Verify theme colors applied
