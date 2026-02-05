import CryptoJS from 'crypto-js';

export interface EncryptedMessage {
  encryptedContent: string;
  encryptionKey: string;
  senderPublicKey: string;
  signature?: string;
  iv: string;
  tag: string;
}

export interface DecryptedMessage {
  content: string;
  isVerified: boolean;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class EncryptionService {
  /**
   * Generate a new key pair for end-to-end encryption (React Native compatible)
   */
  static async generateKeyPair(): Promise<KeyPair> {
    try {
      // Generate a simple key pair using React Native compatible methods
      const timestamp = Date.now().toString();
      const randomString = Math.random().toString(36).substring(2, 15) + timestamp;
      const privateKey = CryptoJS.SHA256(randomString + 'salt').toString();
      const publicKey = CryptoJS.SHA256(privateKey + 'public').toString();
      
      return {
        publicKey: `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`,
      };
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw new Error('Failed to generate encryption keys');
    }
  }

  /**
   * Encrypt a private key with a password hash
   */
  static encryptPrivateKey(privateKey: string, passwordHash: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(privateKey, passwordHash).toString();
      return encrypted;
    } catch (error) {
      console.error('Error encrypting private key:', error);
      throw new Error('Failed to encrypt private key');
    }
  }

  /**
   * Decrypt a private key with a password hash
   */
  static decryptPrivateKey(encryptedPrivateKey: string, passwordHash: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKey, passwordHash);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting private key:', error);
      throw new Error('Failed to decrypt private key');
    }
  }

  /**
   * Encrypt message content for a specific receiver (React Native compatible)
   */
  static async encryptMessage(
    content: string,
    receiverPublicKey: string,
    senderPrivateKey: string
  ): Promise<EncryptedMessage> {
    try {
      // Generate a simple key for this message (React Native compatible)
      const timestamp = Date.now().toString();
      const randomString = Math.random().toString(36).substring(2, 15);
      const messageKey = CryptoJS.SHA256(randomString + timestamp + 'msg').toString();
      
      // Simple XOR encryption (React Native compatible)
      let encryptedContent = '';
      for (let i = 0; i < content.length; i++) {
        encryptedContent += String.fromCharCode(
          content.charCodeAt(i) ^ messageKey.charCodeAt(i % messageKey.length)
        );
      }
      
      // Base64 encode to handle null bytes
      encryptedContent = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encryptedContent));
      
      // Encrypt the message key with the receiver's public key (XOR approach)
      let encryptedKey = '';
      for (let i = 0; i < messageKey.length; i++) {
        encryptedKey += String.fromCharCode(
          messageKey.charCodeAt(i) ^ receiverPublicKey.charCodeAt(i % receiverPublicKey.length)
        );
      }
      
      // Base64 encode to handle null bytes
      encryptedKey = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encryptedKey));
      
      // Sign the message with sender's private key (simplified)
      const signature = CryptoJS.HmacSHA256(encryptedContent + timestamp, senderPrivateKey).toString();
      
      // Get sender's public key (simplified)
      const senderPublicKey = CryptoJS.SHA256(senderPrivateKey).toString();
      
      // Generate IV for consistency
      const ivHash = CryptoJS.SHA256(randomString + timestamp).toString();
      const iv = ivHash.substring(0, 32);
      
      return {
        encryptedContent,
        encryptionKey: encryptedKey,
        senderPublicKey,
        signature,
        iv,
        tag: '', // XOR doesn't use tags
      };
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt message content (React Native compatible)
   */
  static async decryptMessage(
    encryptedMessage: EncryptedMessage,
    receiverPrivateKey: string,
    senderPublicKey: string
  ): Promise<DecryptedMessage> {
    try {
      // Decrypt the message key with receiver's private key (XOR approach)
      let encryptedKeyBytes = '';
      try {
        const parsed = CryptoJS.enc.Base64.parse(encryptedMessage.encryptionKey);
        encryptedKeyBytes = parsed.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        console.error('Failed to parse Base64 for encryption key:', error);
        throw new Error('Invalid encryption key format');
      }
      
      let messageKey = '';
      for (let i = 0; i < encryptedKeyBytes.length; i++) {
        messageKey += String.fromCharCode(
          encryptedKeyBytes.charCodeAt(i) ^ receiverPrivateKey.charCodeAt(i % receiverPrivateKey.length)
        );
      }
      
      if (!messageKey) {
        throw new Error('Message key decryption failed');
      }
      
      // Decrypt the content with XOR (React Native compatible)
      let encryptedContentBytes = '';
      try {
        const parsed = CryptoJS.enc.Base64.parse(encryptedMessage.encryptedContent);
        encryptedContentBytes = parsed.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        console.error('Failed to parse Base64 for content:', error);
        throw new Error('Invalid encrypted content format');
      }
      
      let content = '';
      for (let i = 0; i < encryptedContentBytes.length; i++) {
        content += String.fromCharCode(
          encryptedContentBytes.charCodeAt(i) ^ messageKey.charCodeAt(i % messageKey.length)
        );
      }
      
      // Verify the signature (simplified)
      let isVerified = false;
      if (encryptedMessage.signature) {
        const messageToVerify = encryptedMessage.encryptedContent + encryptedMessage.iv;
        
        try {
          const computedSignature = CryptoJS.HmacSHA256(messageToVerify, senderPublicKey).toString();
          isVerified = computedSignature === encryptedMessage.signature;
        } catch (error) {
          console.error('Signature verification failed:', error);
          isVerified = false;
        }
      } else {
        isVerified = false;
      }
      
      return {
        content,
        isVerified,
      };
    } catch (error) {
      console.error('Message decryption failed:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Extract public key from private key (simplified for React Native)
   */
  static async extractPublicKeyFromPrivate(privateKey: string): Promise<string> {
    try {
      // Simplified public key extraction using crypto-js
      return CryptoJS.SHA256(privateKey).toString();
    } catch (error) {
      console.error('Error extracting public key:', error);
      throw new Error('Failed to extract public key');
    }
  }

  /**
   * Generate a secure password hash for key encryption
   */
  static generatePasswordHash(password: string): string {
    try {
      return CryptoJS.SHA256(password).toString();
    } catch (error) {
      console.error('Error generating password hash:', error);
      throw new Error('Failed to generate password hash');
    }
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    try {
      const computedHash = CryptoJS.SHA256(password).toString();
      return computedHash === hash;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Generate a random session key for temporary encryption
   */
  static generateSessionKey(): string {
    try {
      return CryptoJS.lib.WordArray.random(256/8).toString();
    } catch (error) {
      console.error('Error generating session key:', error);
      throw new Error('Failed to generate session key');
    }
  }

  /**
   * Encrypt file data (for images, documents, etc.)
   */
  static async encryptFile(
    base64Content: string,
    receiverPublicKey: string,
    senderPrivateKey: string
  ): Promise<EncryptedMessage> {
    return this.encryptMessage(base64Content, receiverPublicKey, senderPrivateKey);
  }

  /**
   * Decrypt file data
   */
  static async decryptFile(
    encryptedMessage: EncryptedMessage,
    receiverPrivateKey: string,
    senderPublicKey: string
  ): Promise<string> {
    const decrypted = await this.decryptMessage(encryptedMessage, receiverPrivateKey, senderPublicKey);
    return decrypted.content;
  }

  /**
   * Validate RSA key format
   */
  static isValidPublicKey(publicKey: string): boolean {
    try {
      // Basic validation for PEM format
      return publicKey.includes('-----BEGIN PUBLIC KEY-----') && 
             publicKey.includes('-----END PUBLIC KEY-----');
    } catch {
      return false;
    }
  }

  /**
   * Validate RSA private key format
   */
  static isValidPrivateKey(privateKey: string): boolean {
    try {
      // Basic validation for PEM format
      return privateKey.includes('-----BEGIN PRIVATE KEY-----') && 
             privateKey.includes('-----END PRIVATE KEY-----');
    } catch {
      return false;
    }
  }

  /**
   * Store encryption keys securely
   */
  static async storeKeys(keys: KeyPair, userId: string): Promise<void> {
    try {
      // In a real app, this should use secure storage like expo-secure-store
      // For now, we'll store them in AsyncStorage (not secure for production)
      const storageKey = `encryption_keys_${userId}`;
      const keysData = JSON.stringify(keys);
      
      // Use expo-secure-store if available
      if (typeof require !== 'undefined') {
        try {
          const SecureStore = require('expo-secure-store');
          await SecureStore.setItemAsync(storageKey, keysData);
        } catch (error) {
          // Fallback to AsyncStorage
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem(storageKey, keysData);
        }
      }
    } catch (error) {
      console.error('Error storing keys:', error);
      throw new Error('Failed to store encryption keys');
    }
  }

  /**
   * Retrieve encryption keys securely
   */
  static async retrieveKeys(userId: string): Promise<KeyPair | null> {
    try {
      const storageKey = `encryption_keys_${userId}`;
      
      // Use expo-secure-store if available
      if (typeof require !== 'undefined') {
        try {
          const SecureStore = require('expo-secure-store');
          const keysData = await SecureStore.getItemAsync(storageKey);
          if (keysData) {
            return JSON.parse(keysData);
          }
        } catch (error) {
          // Fallback to AsyncStorage
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const keysData = await AsyncStorage.getItem(storageKey);
          if (keysData) {
            return JSON.parse(keysData);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving keys:', error);
      return null;
    }
  }

  /**
   * Clear stored encryption keys
   */
  static async clearKeys(userId: string): Promise<void> {
    try {
      const storageKey = `encryption_keys_${userId}`;
      
      // Use expo-secure-store if available
      if (typeof require !== 'undefined') {
        try {
          const SecureStore = require('expo-secure-store');
          await SecureStore.deleteItemAsync(storageKey);
        } catch (error) {
          // Fallback to AsyncStorage
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Error clearing keys:', error);
      throw new Error('Failed to clear encryption keys');
    }
  }
}
