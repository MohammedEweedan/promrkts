import crypto from 'crypto';
import forge from 'node-forge';
import * as bcrypt from 'bcryptjs';

// Encryption configuration
const AES_ALGORITHM = 'aes-256-gcm';
const RSA_ALGORITHM = 'RSA-OAEP';
const RSA_HASH = 'SHA-256';
const RSA_KEY_SIZE = 2048;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

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
   * Generate a new RSA key pair for end-to-end encryption
   */
  static generateKeyPair(): KeyPair {
    const keyPair = forge.pki.rsa.generateKeyPair(RSA_KEY_SIZE);
    return {
      publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
      privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
    };
  }

  /**
   * Encrypt a private key with a password hash
   */
  static encryptPrivateKey(privateKey: string, passwordHash: string): string {
    const key = crypto.scryptSync(passwordHash, 'salt', 32);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt a private key with a password hash
   */
  static decryptPrivateKey(encryptedPrivateKey: string, passwordHash: string): string {
    const key = crypto.scryptSync(passwordHash, 'salt', 32);
    const parts = encryptedPrivateKey.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Encrypt message content for a specific receiver
   */
  static encryptMessage(content: string, receiverPublicKey: string, senderPrivateKey: string): EncryptedMessage {
    // Generate a random AES key for this message
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Encrypt the content with AES-GCM
    const cipher = crypto.createCipheriv(AES_ALGORITHM, aesKey, iv);
    cipher.setAAD(Buffer.from('promrkts-message', 'utf8'));
    
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Encrypt the AES key with the receiver's RSA public key
    const encryptedKey = crypto.publicEncrypt(
      {
        key: receiverPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: RSA_HASH,
      },
      aesKey
    );
    
    // Sign the message with sender's private key
    const messageToSign = Buffer.from(encrypted + iv.toString('hex') + tag.toString('hex'));
    const signature = crypto.sign(RSA_HASH, messageToSign, {
      key: senderPrivateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    });
    
    // Get sender's public key
    const senderPublicKey = this.extractPublicKeyFromPrivate(senderPrivateKey);
    
    return {
      encryptedContent: encrypted,
      encryptionKey: encryptedKey.toString('base64'),
      senderPublicKey: senderPublicKey,
      signature: signature.toString('base64'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt message content
   */
  static decryptMessage(
    encryptedMessage: EncryptedMessage,
    receiverPrivateKey: string,
    senderPublicKey: string
  ): DecryptedMessage {
    try {
      // Decrypt the AES key with receiver's private key
      const aesKey = crypto.privateDecrypt(
        {
          key: receiverPrivateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: RSA_HASH,
        },
        Buffer.from(encryptedMessage.encryptionKey, 'base64')
      );
      
      // Decrypt the content with AES-GCM
      const decipher = crypto.createDecipheriv(AES_ALGORITHM, aesKey, Buffer.from(encryptedMessage.iv, 'hex'));
      decipher.setAAD(Buffer.from('promrkts-message', 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptedMessage.tag, 'hex'));
      
      let decrypted = decipher.update(encryptedMessage.encryptedContent, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Verify the signature
      let isVerified = false;
      if (encryptedMessage.signature) {
        const messageToVerify = Buffer.from(encryptedMessage.encryptedContent + 
                                             encryptedMessage.iv + 
                                             encryptedMessage.tag);
        
        try {
          isVerified = crypto.verify(
            RSA_HASH,
            messageToVerify,
            senderPublicKey,
            Buffer.from(encryptedMessage.signature, 'base64')
          );
        } catch (error) {
          console.error('Signature verification failed:', error);
          isVerified = false;
        }
      } else {
        isVerified = false;
      }
      
      return {
        content: decrypted,
        isVerified,
      };
    } catch (error) {
      console.error('Message decryption failed:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Extract public key from private key
   */
  static extractPublicKeyFromPrivate(privateKey: string): string {
    const key = forge.pki.privateKeyFromPem(privateKey);
    const publicKey = forge.pki.rsa.setPublicKey(key.n, key.e);
    return forge.pki.publicKeyToPem(publicKey);
  }

  /**
   * Generate a secure password hash for key encryption
   */
  static generatePasswordHash(password: string): string {
    return bcrypt.hashSync(password, 12);
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  /**
   * Generate a random session key for temporary encryption
   */
  static generateSessionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt file data (for images, documents, etc.)
   */
  static encryptFile(buffer: Buffer, receiverPublicKey: string, senderPrivateKey: string): EncryptedMessage {
    const content = buffer.toString('base64');
    return this.encryptMessage(content, receiverPublicKey, senderPrivateKey);
  }

  /**
   * Decrypt file data
   */
  static decryptFile(
    encryptedMessage: EncryptedMessage,
    receiverPrivateKey: string,
    senderPublicKey: string
  ): Buffer {
    const decrypted = this.decryptMessage(encryptedMessage, receiverPrivateKey, senderPublicKey);
    return Buffer.from(decrypted.content, 'base64');
  }

  /**
   * Validate RSA key format
   */
  static isValidPublicKey(publicKey: string): boolean {
    try {
      forge.pki.publicKeyFromPem(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate RSA private key format
   */
  static isValidPrivateKey(privateKey: string): boolean {
    try {
      forge.pki.privateKeyFromPem(privateKey);
      return true;
    } catch {
      return false;
    }
  }
}
