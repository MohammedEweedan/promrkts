import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowInForeground: true,
  }),
});

export type NotificationType = 
  | 'new_post'
  | 'new_comment'
  | 'new_like'
  | 'group_message'
  | 'group_invite'
  | 'news'
  | 'offer'
  | 'price_alert';

interface PushNotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize() {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || 'your-project-id',
      });

      this.expoPushToken = token.data;
      console.log('Push token:', this.expoPushToken);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Create channels for different notification types
        await Notifications.setNotificationChannelAsync('groups', {
          name: 'Group Messages',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('social', {
          name: 'Social Updates',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('news', {
          name: 'News & Offers',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  setupListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      onNotificationTapped?.(response);
    });
  }

  removeListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  async scheduleLocalNotification(data: PushNotificationData) {
    const channelId = this.getChannelId(data.type);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: data.title,
        body: data.body,
        data: { ...data.data, type: data.type },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Show immediately
    });
  }

  async sendPushNotification(data: PushNotificationData) {
    if (!this.expoPushToken) {
      console.log('No push token available');
      return;
    }

    // In production, send this to your backend which will use Expo's push service
    // For now, we'll schedule a local notification
    await this.scheduleLocalNotification(data);
  }

  // Register token with backend
  async registerTokenWithBackend(userId: string) {
    if (!this.expoPushToken) return;

    try {
      // TODO: Send token to your backend
      // await api.post('/notifications/register', {
      //   userId,
      //   token: this.expoPushToken,
      //   platform: Platform.OS,
      // });
      console.log('Token registered with backend');
    } catch (error) {
      console.error('Failed to register token:', error);
    }
  }

  // Unregister token when user logs out
  async unregisterToken() {
    if (!this.expoPushToken) return;

    try {
      // TODO: Remove token from backend
      // await api.post('/notifications/unregister', {
      //   token: this.expoPushToken,
      // });
      console.log('Token unregistered');
    } catch (error) {
      console.error('Failed to unregister token:', error);
    }
  }

  private getChannelId(type: NotificationType): string {
    switch (type) {
      case 'group_message':
      case 'group_invite':
        return 'groups';
      case 'new_post':
      case 'new_comment':
      case 'new_like':
        return 'social';
      case 'news':
      case 'offer':
      case 'price_alert':
        return 'news';
      default:
        return 'default';
    }
  }

  getToken() {
    return this.expoPushToken;
  }

  // Badge management
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default new PushNotificationService();
