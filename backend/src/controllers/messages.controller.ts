import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { EncryptionService, EncryptedMessage, DecryptedMessage } from '../services/encryption.service';
import { authenticate, AuthRequest } from '../middleware/auth';


// Extend AuthRequest to include encryption keys
interface MessageAuthRequest extends AuthRequest {
  encryptionKeys?: {
    publicKey: string;
    privateKey: string;
  };
}

// Middleware to load user's encryption keys
export const loadEncryptionKeys = async (req: MessageAuthRequest, res: Response, next: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const encryptionKey = await prisma.userEncryptionKey.findFirst({
      where: {
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!encryptionKey) {
      return res.status(404).json({ error: 'Encryption keys not found' });
    }

    // Decrypt private key using user's password hash (stored in session or token)
    // For now, we'll assume the private key is already decrypted or use a session key
    // In production, this should be decrypted with the user's password or biometric
    req.encryptionKeys = {
      publicKey: encryptionKey.publicKey,
      privateKey: encryptionKey.privateKey, // This should be decrypted in production
    };

    next();
  } catch (error) {
    console.error('Error loading encryption keys:', error);
    res.status(500).json({ error: 'Failed to load encryption keys' });
  }
};

// Generate encryption key pair for user
export const generateEncryptionKeys = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user already has encryption keys
    const existingKeys = await prisma.userEncryptionKey.findFirst({
      where: { userId: req.user.id },
    });

    if (existingKeys) {
      return res.status(400).json({ error: 'Encryption keys already exist' });
    }

    // Generate new key pair
    const keyPair = EncryptionService.generateKeyPair();

    // Store encrypted private key (in production, encrypt with user's password)
    const encryptedPrivateKey = EncryptionService.encryptPrivateKey(
      keyPair.privateKey,
      req.user.id // Use user ID as temporary salt, should use password hash
    );

    // Save to database
    await prisma.userEncryptionKey.create({
      data: {
        userId: req.user.id,
        publicKey: keyPair.publicKey,
        privateKey: encryptedPrivateKey,
        keyVersion: 1,
        isActive: true,
      },
    });

    // Return only public key to client
    res.json({
      publicKey: keyPair.publicKey,
      message: 'Encryption keys generated successfully',
    });
  } catch (error) {
    console.error('Error generating encryption keys:', error);
    res.status(500).json({ error: 'Failed to generate encryption keys' });
  }
};

// Get user's public key
export const getPublicKey = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const encryptionKey = await prisma.userEncryptionKey.findFirst({
      where: {
        userId,
        isActive: true,
      },
      select: {
        publicKey: true,
      },
    });

    if (!encryptionKey) {
      return res.status(404).json({ error: 'User encryption keys not found' });
    }

    res.json({
      publicKey: encryptionKey.publicKey,
    });
  } catch (error) {
    console.error('Error getting public key:', error);
    res.status(500).json({ error: 'Failed to get public key' });
  }
};

// Send a private message
export const sendMessage = async (req: MessageAuthRequest, res: Response) => {
  try {
    const { 
      receiverId, 
      content, 
      contentType = 'text', 
      metadata,
      encryptedContent,
      encryptionKey,
      senderPublicKey,
      signature,
      iv,
      tag
    } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Accept pre-encrypted messages from mobile clients
    let encryptedMessage: EncryptedMessage;

    if (encryptedContent && encryptionKey && senderPublicKey) {
      // Mobile client sent pre-encrypted message
      encryptedMessage = {
        encryptedContent,
        encryptionKey,
        senderPublicKey,
        signature,
        iv,
        tag: tag || '',
      };
    } else {
      // Backend needs to encrypt the message
      if (!req.encryptionKeys) {
        return res.status(401).json({ error: 'Missing encryption keys' });
      }

      // Get receiver's public key
      const receiverKey = await prisma.userEncryptionKey.findFirst({
        where: {
          userId: receiverId,
          isActive: true,
        },
      });

      if (!receiverKey) {
        return res.status(404).json({ error: 'Receiver has not set up encryption keys' });
      }

      // Encrypt the message
      encryptedMessage = EncryptionService.encryptMessage(
        content,
        receiverKey.publicKey,
        req.encryptionKeys.privateKey
      );
    }

    // Save encrypted message to database
    const message = await prisma.privateMessage.create({
      data: {
        senderId: req.user.id,
        receiverId,
        encryptedContent: encryptedMessage.encryptedContent,
        encryptionKey: encryptedMessage.encryptionKey,
        senderPublicKey: encryptedMessage.senderPublicKey,
        signature: encryptedMessage.signature,
        contentType,
        metadata: metadata || {},
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });

    // Send push notification to receiver if they have push token
    if (message.receiver && 'push_token' in message.receiver && (message.receiver as any).push_token) {
      // TODO: Implement push notification
      console.log('Would send push notification to receiver');
    }

    res.status(201).json({
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      contentType: message.contentType,
      metadata: message.metadata,
      isRead: message.isRead,
      createdAt: message.createdAt,
      sender: message.sender,
      receiver: message.receiver,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get conversation between two users
export const getConversation = async (req: MessageAuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!req.user?.id || !req.encryptionKeys) {
      return res.status(401).json({ error: 'Unauthorized or missing encryption keys' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get all messages between the two users
    const messages = await prisma.privateMessage.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id },
        ],
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Decrypt messages
    const decryptedMessages = messages.map((message: { senderId: string; encryptedContent: any; encryptionKey: any; senderPublicKey: string; signature: any; id: any; receiverId: any; contentType: any; metadata: any; isRead: any; createdAt: any; sender: any; receiver: any; }) => {
      let decryptedContent: string | null = null;
      let isVerified = false;

      try {
        if (!req.user?.id || !req.encryptionKeys) {
          throw new Error('Missing authentication or encryption keys');
        }

        if (message.senderId === req.user.id) {
          // User sent this message, decrypt with their own key
          const decrypted: DecryptedMessage = EncryptionService.decryptMessage(
            {
              encryptedContent: message.encryptedContent,
              encryptionKey: message.encryptionKey,
              senderPublicKey: message.senderPublicKey,
              signature: message.signature || undefined,
              iv: '', // We'll need to store IV and tag in the DB
              tag: '', // We'll need to store IV and tag in the DB
            },
            req.encryptionKeys.privateKey,
            message.senderPublicKey
          );
          decryptedContent = decrypted.content;
          isVerified = decrypted.isVerified;
        } else {
          // User received this message, decrypt with their own key
          const decrypted: DecryptedMessage = EncryptionService.decryptMessage(
            {
              encryptedContent: message.encryptedContent,
              encryptionKey: message.encryptionKey,
              senderPublicKey: message.senderPublicKey,
              signature: message.signature || undefined,
              iv: '', // We'll need to store IV and tag in the DB
              tag: '', // We'll need to store IV and tag in the DB
            },
            req.encryptionKeys.privateKey,
            message.senderPublicKey
          );
          decryptedContent = decrypted.content;
          isVerified = decrypted.isVerified;
        }
      } catch (error) {
        console.error('Error decrypting message:', error);
        decryptedContent = '[Unable to decrypt message]';
        isVerified = false;
      }

      return {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: decryptedContent,
        contentType: message.contentType,
        metadata: message.metadata,
        isRead: message.isRead,
        isVerified,
        createdAt: message.createdAt,
        sender: message.sender,
        receiver: message.receiver,
      };
    });

    // Mark messages as read
    await prisma.privateMessage.updateMany({
      where: {
        senderId: userId,
        receiverId: req.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Get user's message conversations
export const getConversations = async (req: MessageAuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the most recent message from each conversation
    const conversations = await prisma.privateMessage.groupBy({
      by: ['senderId', 'receiverId'],
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id },
        ],
        isDeleted: false,
      },
      _max: {
        createdAt: true,
      },
    });

    // Get full conversation details
    const conversationDetails = await Promise.all(
      conversations.map(async (conv: { senderId: string; receiverId: any; }) => {
        if (!req.user?.id) {
          throw new Error('User not authenticated');
        }

        const otherUserId = conv.senderId === req.user.id ? conv.receiverId : conv.senderId;
        
        const otherUser = await prisma.users.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        });

        const lastMessage = await prisma.privateMessage.findFirst({
          where: {
            OR: [
              { senderId: req.user.id, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: req.user.id },
            ],
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        const unreadCount = await prisma.privateMessage.count({
          where: {
            senderId: otherUserId,
            receiverId: req.user.id,
            isRead: false,
            isDeleted: false,
          },
        });

        return {
          user: otherUser,
          lastMessage: {
            id: lastMessage?.id,
            contentType: lastMessage?.contentType,
            isRead: lastMessage?.isRead,
            createdAt: lastMessage?.createdAt,
          },
          unreadCount,
        };
      })
    );

    res.json(conversationDetails);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Delete a message
export const deleteMessage = async (req: MessageAuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const message = await prisma.privateMessage.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id },
        ],
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Soft delete the message
    await prisma.privateMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Mark message as read
export const markAsRead = async (req: MessageAuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const message = await prisma.privateMessage.findFirst({
      where: {
        id: messageId,
        receiverId: req.user.id,
        isDeleted: false,
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await prisma.privateMessage.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};
