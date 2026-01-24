# Push Notifications Setup Guide

## Overview
Push notifications are now fully integrated for:
- ✅ Purchase confirmations
- ✅ Announcements and discounts (admin)
- ✅ Post likes
- ✅ Post comments
- ✅ Group messages (ready for implementation)
- ✅ Direct messages (ready for implementation)

## Backend Setup

### 1. Database Migration
The push notification fields have been added to the users table:
```sql
-- Already applied migration: 20260124232144_add_push_notifications
ALTER TABLE "public"."users" ADD COLUMN "push_token" TEXT;
ALTER TABLE "public"."users" ADD COLUMN "push_notifications_enabled" BOOLEAN DEFAULT true;
```

### 2. Environment Variables
No additional environment variables needed. The system uses Expo's push notification service.

### 3. API Endpoints

#### Register Push Token
```
POST /api/notifications/register-token
Authorization: Bearer <token>
Body: { "pushToken": "ExponentPushToken[...]" }
```

#### Toggle Notifications
```
PUT /api/notifications/toggle
Authorization: Bearer <token>
Body: { "enabled": true/false }
```

#### Send Announcement (Admin Only)
```
POST /api/notifications/announcement
Authorization: Bearer <admin-token>
Body: {
  "title": "New Feature!",
  "body": "Check out our latest update",
  "userIds": ["uuid1", "uuid2"] // Optional, sends to all if omitted
}
```

#### Send Discount (Admin Only)
```
POST /api/notifications/discount
Authorization: Bearer <admin-token>
Body: {
  "title": "50% Off!",
  "description": "Limited time offer",
  "code": "SAVE50",
  "userIds": ["uuid1", "uuid2"]
}
```

## Mobile App Setup

### 1. Install Dependencies
Already installed in package.json:
- expo-notifications
- expo-device

### 2. Configure app.json
Add to your `app.json`:
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#000000",
      "androidMode": "default",
      "androidCollapsedTitle": "{{unread_count}} new notifications"
    },
    "android": {
      "useNextNotificationsApi": true
    },
    "ios": {
      "supportsTablet": true
    }
  }
}
```

### 3. Get Expo Project ID
1. Run `npx expo whoami` to check if logged in
2. If not logged in: `npx expo login`
3. Link project: `npx expo init` or check existing project ID in app.json

### 4. Update Notification Service
Edit `/mobile/src/services/notificationService.ts` line 42:
```typescript
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: 'YOUR_EXPO_PROJECT_ID', // Replace with actual project ID
});
```

### 5. Initialize in App.tsx
Add to your main App.tsx (after authentication):
```typescript
import notificationService from './src/services/notificationService';
import { useEffect, useRef } from 'react';

function App() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications
    notificationService.registerForPushNotifications();

    // Listen for notifications
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    // Handle notification taps
    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('Notification tapped:', response);
        const data = response.notification.request.content.data;
        
        // Navigate based on notification type
        if (data.type === 'post_liked' || data.type === 'post_commented') {
          // Navigate to post detail
          navigation.navigate('PostDetail', { postId: data.postId });
        } else if (data.type === 'purchase_confirmed') {
          // Navigate to purchases/library
          navigation.navigate('Library');
        } else if (data.type === 'group_message') {
          // Navigate to group chat
          navigation.navigate('GroupChat', { groupName: data.groupName });
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    // Your app content
  );
}
```

## Testing Push Notifications

### Test on Physical Device
1. Build and install app on physical device (push notifications don't work in simulator)
2. Grant notification permissions when prompted
3. Check console for push token registration
4. Trigger a test notification:
   - Make a purchase
   - Like a post
   - Comment on a post
   - Have admin send announcement

### Test with Expo Push Tool
Visit: https://expo.dev/notifications
1. Enter your push token (from console logs)
2. Send a test notification
3. Verify it appears on device

### Debug Issues
- Check device notification settings
- Verify push token is saved in database
- Check backend logs for notification sending errors
- Ensure `push_notifications_enabled` is true in database

## Notification Types

### Purchase Confirmed
```typescript
{
  title: "🎉 Purchase Confirmed!",
  body: "Your purchase of [Product] for $[Amount] has been confirmed.",
  data: {
    type: "purchase_confirmed",
    productName: "...",
    amount: 99.99
  }
}
```

### Post Liked
```typescript
{
  title: "❤️ New Like",
  body: "[User] liked your post",
  data: {
    type: "post_liked",
    postId: "..."
  }
}
```

### Post Commented
```typescript
{
  title: "💬 New Comment",
  body: "[User]: [Comment preview]",
  data: {
    type: "post_commented",
    postId: "..."
  }
}
```

### Announcement
```typescript
{
  title: "[Custom Title]",
  body: "[Custom Body]",
  data: {
    type: "announcement"
  }
}
```

### Discount
```typescript
{
  title: "🔥 [Discount Title]",
  body: "[Description]",
  data: {
    type: "discount",
    code: "SAVE50"
  }
}
```

## Admin Dashboard Integration

To send announcements/discounts from admin panel:

```typescript
// Send announcement to all users
await fetch('/api/notifications/announcement', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'New Feature Released!',
    body: 'Check out our latest trading tools',
  }),
});

// Send discount to specific users
await fetch('/api/notifications/discount', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'VIP Exclusive: 50% Off',
    description: 'Limited time offer for our VIP members',
    code: 'VIP50',
    userIds: vipUserIds,
  }),
});
```

## Production Checklist

- [ ] Update Expo project ID in notificationService.ts
- [ ] Configure app.json with notification settings
- [ ] Add notification icon assets
- [ ] Test on physical iOS and Android devices
- [ ] Set up notification analytics tracking
- [ ] Configure notification badges
- [ ] Test all notification types
- [ ] Set up notification scheduling for announcements
- [ ] Configure notification categories (iOS)
- [ ] Test notification deep linking
- [ ] Monitor notification delivery rates

## Troubleshooting

### Notifications not received
1. Check device is physical (not simulator)
2. Verify permissions granted
3. Check push token is registered in database
4. Verify backend logs show notification sent
5. Check Expo push notification status

### Token registration fails
1. Ensure expo-notifications is installed
2. Check Expo project ID is correct
3. Verify device has internet connection
4. Check app.json configuration

### Backend errors
1. Check expo-server-sdk is installed
2. Verify database migration applied
3. Check user has valid push_token
4. Verify push_notifications_enabled is true
