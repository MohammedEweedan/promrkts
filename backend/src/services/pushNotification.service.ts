import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import prisma from '../config/prisma';

const expo = new Expo();

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
}

class PushNotificationService {
  /**
   * Send push notification to a single user
   */
  async sendToUser(payload: NotificationPayload): Promise<void> {
    try {
      // Get user's push token from database
      const user = await prisma.users.findUnique({
        where: { id: payload.userId },
        select: { 
          id: true, 
          email: true, 
          push_token: true,
          push_notifications_enabled: true,
        },
      });

      if (!user) {
        console.log(`User ${payload.userId} not found`);
        return;
      }

      if (!user.push_notifications_enabled) {
        console.log(`Push notifications disabled for user ${user.email}`);
        return;
      }

      if (!user.push_token) {
        console.log(`No push token for user ${user.email}`);
        return;
      }

      // Validate push token format
      if (!Expo.isExpoPushToken(user.push_token)) {
        console.error(`Invalid push token for user ${user.email}`);
        return;
      }

      await this.sendNotifications([
        {
          to: user.push_token,
          title: payload.title,
          body: payload.body,
          data: payload.data,
          sound: payload.sound || 'default',
          badge: payload.badge,
          priority: payload.priority || 'high',
        },
      ]);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Send push notifications to multiple users
   */
  async sendToUsers(userIds: string[], title: string, body: string, data?: Record<string, any>): Promise<void> {
    const notifications = userIds.map(userId => ({
      userId,
      title,
      body,
      data,
    }));

    await Promise.all(notifications.map(n => this.sendToUser(n)));
  }

  /**
   * Send notification when purchase is confirmed
   */
  async notifyPurchaseConfirmed(userId: string, purchaseDetails: { productName: string; amount: number }): Promise<void> {
    await this.sendToUser({
      userId,
      title: '🎉 Purchase Confirmed!',
      body: `Your purchase of ${purchaseDetails.productName} for $${purchaseDetails.amount} has been confirmed.`,
      data: {
        type: 'purchase_confirmed',
        ...purchaseDetails,
      },
      priority: 'high',
    });
  }

  /**
   * Send announcement to all users or specific segment
   */
  async sendAnnouncement(title: string, body: string, userIds?: string[]): Promise<void> {
    if (userIds && userIds.length > 0) {
      await this.sendToUsers(userIds, title, body, { type: 'announcement' });
    } else {
      // Send to all users with push tokens enabled
      const users = await prisma.users.findMany({
        where: {
          push_notifications_enabled: true,
          push_token: { not: null },
        },
        select: { id: true },
      });
      
      const allUserIds = users.map((u: { id: string }) => u.id);
      await this.sendToUsers(allUserIds, title, body, { type: 'announcement' });
    }
  }

  /**
   * Send discount/promo notification
   */
  async notifyDiscount(userIds: string[], discountDetails: { title: string; description: string; code?: string }): Promise<void> {
    await this.sendToUsers(
      userIds,
      `🔥 ${discountDetails.title}`,
      discountDetails.description,
      {
        type: 'discount',
        code: discountDetails.code,
      }
    );
  }

  /**
   * Send notification when someone likes a post
   */
  async notifyPostLiked(postAuthorId: string, likerName: string, postId: string): Promise<void> {
    await this.sendToUser({
      userId: postAuthorId,
      title: '❤️ New Like',
      body: `${likerName} liked your post`,
      data: {
        type: 'post_liked',
        postId,
      },
    });
  }

  /**
   * Send notification when someone comments on a post
   */
  async notifyPostCommented(postAuthorId: string, commenterName: string, postId: string, commentPreview: string): Promise<void> {
    await this.sendToUser({
      userId: postAuthorId,
      title: '💬 New Comment',
      body: `${commenterName}: ${commentPreview.substring(0, 50)}${commentPreview.length > 50 ? '...' : ''}`,
      data: {
        type: 'post_commented',
        postId,
      },
    });
  }

  /**
   * Send notification for new group message
   */
  async notifyGroupMessage(recipientIds: string[], senderName: string, groupName: string, messagePreview: string): Promise<void> {
    await this.sendToUsers(
      recipientIds,
      `${groupName}`,
      `${senderName}: ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}`,
      {
        type: 'group_message',
        groupName,
      }
    );
  }

  /**
   * Send notification for direct message
   */
  async notifyDirectMessage(recipientId: string, senderName: string, messagePreview: string): Promise<void> {
    await this.sendToUser({
      userId: recipientId,
      title: `💬 ${senderName}`,
      body: messagePreview.substring(0, 100),
      data: {
        type: 'direct_message',
        senderName,
      },
    });
  }

  /**
   * Low-level function to send notifications via Expo
   */
  private async sendNotifications(messages: ExpoPushMessage[]): Promise<void> {
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }

    // Log any errors
    tickets.forEach((ticket, index) => {
      if (ticket.status === 'error') {
        console.error(`Notification error for message ${index}:`, ticket.message);
      }
    });
  }
}

export default new PushNotificationService();
