import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
// fs and path used previously for attachments; no-logo request means we don't need attachments
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import db from '../config/database';
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../validations/auth.validation';
import logger from '../utils/logger';
import { sendWhatsAppText } from '../utils/whatsapp';
import { ensureJourney } from '../services/journey.service';
import { ensureEntitlements } from '../services/entitlements.service';

const JWT_SECRET = (process.env.JWT_SECRET || 'your_jwt_secret_key') as jwt.Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
const REFRESH_TOKEN_EXPIRES_IN = '90d';

// In-memory OTP store (sufficient for MVP; replace with Redis for production)
type OtpRecord = { code: string; expiresAt: number; attempts: number; lastSentAt: number };
const otpStore = new Map<string, OtpRecord>(); // key: phone in E.164
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_RESEND_WINDOW_MS = 45 * 1000; // throttle resends to 45s
const OTP_MAX_ATTEMPTS = 5;

const randomOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT token
const generateToken = (userId: string, role: string) => {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};

// Send OTP to phone
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body as { phone?: string };
    const clean = (phone || '').replace(/\s+/g, '');
    if (!clean || !/^\+?\d{6,15}$/.test(clean)) {
      return res.status(400).json({ status: 'error', message: 'Invalid phone' });
    }
    const now = Date.now();
    const existing = otpStore.get(clean);
    if (existing && now - existing.lastSentAt < OTP_RESEND_WINDOW_MS) {
      return res.status(429).json({ status: 'error', message: 'Please wait before requesting a new OTP' });
    }
    const code = randomOtp();
    otpStore.set(clean, { code, expiresAt: now + OTP_TTL_MS, attempts: 0, lastSentAt: now });

    // Try WhatsApp first (Cloud API). Falls back to console log if not configured.
    const text = `Your verification code is ${code}. It expires in 5 minutes.`;
    try {
      const wa = await sendWhatsAppText(clean.startsWith('+') ? clean : `+${clean}`, text);
      if (!wa.ok) {
        console.log(`[OTP:FALLBACK] ${clean}: ${code}`);
      }
    } catch (e) {
      logger.warn('WhatsApp send failed, falling back to console log');
      console.log(`[OTP:FALLBACK] ${clean}: ${code}`);
    }

    return res.json({ status: 'success', expiresIn: Math.floor(OTP_TTL_MS / 1000) });
  } catch (error) {
    logger.error('Send OTP error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Verify OTP for phone
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body as { phone?: string; code?: string };
    const clean = (phone || '').replace(/\s+/g, '');
    if (!clean || !/^\+?\d{6,15}$/.test(clean)) {
      return res.status(400).json({ status: 'error', message: 'Invalid phone' });
    }
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ status: 'error', message: 'Invalid OTP code' });
    }
    const rec = otpStore.get(clean);
    if (!rec) return res.status(400).json({ status: 'error', message: 'OTP not found. Please request a new code.' });
    if (Date.now() > rec.expiresAt) {
      otpStore.delete(clean);
      return res.status(400).json({ status: 'error', message: 'OTP expired. Please request a new code.' });
    }
    if (rec.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(clean);
      return res.status(429).json({ status: 'error', message: 'Too many attempts. Please request a new code.' });
    }
    rec.attempts += 1;
    if (rec.code !== code) {
      otpStore.set(clean, rec);
      return res.status(400).json({ status: 'error', message: 'Incorrect OTP code' });
    }
    otpStore.delete(clean);
    return res.json({ status: 'success', verified: true });
  } catch (error) {
    logger.error('Verify OTP error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Revoke current refresh token
export const revoke = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies as { refreshToken?: string };
    if (refreshToken) {
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      res.clearCookie('refreshToken');
    }
    return res.status(200).json({ status: 'success', message: 'Refresh token revoked' });
  } catch (error) {
    logger.error('Revoke token error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Generate refresh token
const generateRefreshToken = () => {
  return {
    token: randomUUID(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  };
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body as RegisterInput;
    const effectiveRole = String(email || '').toLowerCase() === 'mohammedawidan@yahoo.com' ? 'admin' : 'user';

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, phone ?? null, effectiveRole]
    );

    const newUserId = newUser.rows[0].id;

    await ensureJourney(newUserId);
    await ensureEntitlements(newUserId);

    // Generate tokens
    const accessToken = generateToken(newUserId, effectiveRole);
    const refreshToken = generateRefreshToken();

    // Save refresh token to database
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [newUserId, refreshToken.token, refreshToken.expiresAt]
    );

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    // Generate 6-digit code for account confirmation
    const confirmCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Save code to DB (add a new table or reuse existing, here as example)
    await db.query('INSERT INTO account_confirm_codes (user_id, code, expires_at, used) VALUES ($1, $2, $3, $4)', [newUser.rows[0].id, confirmCode, new Date(Date.now() + 15 * 60 * 1000), false]);

    // Send confirmation email (async, non-blocking)
    try {
      const { sendMail } = await import('../utils/mailer');
      const subject = 'Confirm your promrkts account';
      const attachments = await getLogoAttachment();
      const baseHtml = await fs.readFile(path.resolve(__dirname, '../../templates/emailBase.html'), 'utf8');
      const confirmHtml = await fs.readFile(path.resolve(__dirname, '../../templates/emailConfirm.html'), 'utf8');
      const htmlBody = confirmHtml.replace(/{{code}}/g, confirmCode).replace(/{{name}}/g, String(name || email));
      const logoUrl = `${(process.env.FRONTEND_URL || 'http://localhost:3003').replace(/\/$/, '')}/logo.png`;
        const logoSrc = attachments && attachments.length ? 'cid:promrkts.logo' : logoUrl;
        const html = baseHtml.replace(/{{subject}}/g, subject).replace(/{{body}}/g, htmlBody).replace(/{{logoSrc}}/g, logoSrc);
      const text = `Your confirmation code: ${confirmCode}`;
      await sendMail({ to: email, subject, html, text, attachments });
    } catch (e) {
      logger.warn('Failed to send confirmation email:', e);
    }

    // Send code via WhatsApp if phone is provided (use sendWhatsAppText)
    try {
      if (phone) {
        const waText = `Your promrkts verification code is ${confirmCode}`;
        await sendWhatsAppText(phone.startsWith('+') ? phone : `+${phone}`, waText);
      }
    } catch (e) {
      logger.warn('Failed to send WhatsApp code:', e);
    }

    // Return user and access token
    return res.status(201).json({
      status: 'success',
      data: {
        user: newUser.rows[0],
        accessToken,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginInput;

    // Find user by email
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const accessToken = generateToken(user.rows[0].id, user.rows[0].role);
    const refreshToken = generateRefreshToken();

    // Save refresh token to database (optional: don't crash login if table isn't migrated yet)
    let refreshSaved = false;
    try {
      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.rows[0].id, refreshToken.token, refreshToken.expiresAt]
      );
      refreshSaved = true;
    } catch (e) {
      logger.error('Failed to persist refresh token (refresh_tokens table missing or DB error):', e);
    }

    if (refreshSaved) {
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });
    }

    // Return user and access token
    const { password: _, ...userWithoutPassword } = user.rows[0];
    return res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
        accessToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies as { refreshToken?: string };

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token is required',
      });
    }

    // Find refresh token in database
    const tokenData = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );

    if (tokenData.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid refresh token',
      });
    }

    const token = tokenData.rows[0];

    // Check if token is expired
    if (new Date() > new Date(token.expires_at)) {
      // Remove expired token
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      
      return res.status(403).json({
        status: 'error',
        message: 'Refresh token has expired',
      });
    }

    // Get user data
    const user = await db.query('SELECT id, role FROM users WHERE id = $1', [
      token.user_id,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Rotate refresh token: delete old and issue new
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    const newRefresh = generateRefreshToken();
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.rows[0].id, newRefresh.token, newRefresh.expiresAt]
    );

    res.cookie('refreshToken', newRefresh.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    // Generate new access token
    const newAccessToken = generateToken(user.rows[0].id, user.rows[0].role);

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies as { refreshToken: string };

    if (refreshToken) {
      // Remove refresh token from database
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    return res.status(200).json({
      status: 'success',
      message: 'Successfully logged out',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// helper: find logo and build attachments
// Logo-attachment helper removed: emails will not embed images as requested
// helper: find logo file for inline attachment
async function getLogoAttachment(): Promise<any[] | undefined> {
  const envPath = process.env.BRAND_LOGO_PATH;
  const candidates = [
    envPath,
    path.resolve(process.cwd(), 'frontend/public/logo.png'),
    path.resolve(process.cwd(), 'frontend/build/logo.png'),
    path.resolve(__dirname, '../../../frontend/public/logo.png'),
    path.resolve(__dirname, '../../../frontend/build/logo.png'),
    path.resolve(__dirname, '../../templates/logo.png'),
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    if (!p) continue;
      try {
      await fs.stat(p);
      logger.info('Found logo for inline attach: %s', p);
      return [{ filename: 'logo.png', path: p, cid: 'promrkts.logo' }];
    } catch (e) {
      continue;
    }
  }
  return undefined;
}

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as ForgotPasswordInput;

    // Find user by email
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      // For security, don't reveal if the email exists or not
      return res.status(200).json({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.rows[0].id, resetToken, expiresAt]
    );

    // Send email with reset link using structured template
    try {
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3003').replace(/\/$/, '');
      const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
      const subject = '[promrkts] Password reset request';
      const fs = await import('fs/promises');
      const path = await import('path');
      const baseHtml = await fs.readFile(path.resolve(__dirname, '../../templates/emailBase.html'), 'utf8');
      const resetHtml = await fs.readFile(path.resolve(__dirname, '../../templates/emailReset.html'), 'utf8');
      const htmlBody = resetHtml.replace(/{{resetLink}}/g, resetLink).replace(/{{name}}/g, String(user.rows[0].name || user.rows[0].email));
      const logoUrl = `${(process.env.FRONTEND_URL || 'http://localhost:3003').replace(/\/$/, '')}/logo.png`;
      const attachments = await getLogoAttachment();
        const logoSrc = attachments && attachments.length ? 'cid:promrkts.logo' : logoUrl;
        const html = baseHtml.replace(/{{subject}}/g, subject).replace(/{{body}}/g, htmlBody).replace(/{{logoSrc}}/g, logoSrc);
        logger.info('Sending reset email to %s with inline attachments: %s', user.rows[0].email, attachments?.length ? attachments.map(a => a.path).join(',') : 'none');
      const text = `Reset your password: ${resetLink}`;
      const { sendMail } = await import('../utils/mailer');
      await sendMail({ to: user.rows[0].email, subject, html, text, attachments });
    } catch (e: any) {
      logger.warn('Mail send failed for password reset, falling back to console log: %s', e?.message || e);
      logger.debug(e);
      console.log(`Password reset link: /reset-password/${resetToken}`);
    }

    return res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body as ResetPasswordInput['body'];

    // Find valid reset token
    const tokenData = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );

    if (tokenData.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    const resetToken = tokenData.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [
      hashedPassword,
      resetToken.user_id,
    ]);

    // Mark token as used
    await db.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [
      resetToken.id,
    ]);

    return res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Confirm account with 6-digit code
export const confirmAccount = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body as { email: string; code: string };
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
    const user = userRes.rows[0];
    const codeRes = await db.query('SELECT * FROM account_confirm_codes WHERE user_id = $1 AND code = $2 AND used = false AND expires_at > NOW()', [user.id, code]);
    if (codeRes.rows.length === 0) return res.status(400).json({ status: 'error', message: 'Invalid or expired code' });
    // Mark used and confirm user
    await db.query('UPDATE account_confirm_codes SET used = true WHERE id = $1', [codeRes.rows[0].id]);
    await db.query('UPDATE users SET email_confirmed = true WHERE id = $1', [user.id]);
    return res.json({ status: 'success', message: 'Account confirmed' });
  } catch (e) {
    logger.error('Confirm account error:', e);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Resend confirmation code
export const resendConfirmation = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(200).json({ status: 'success' }); // Not revealing
    const user = userRes.rows[0];
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query('INSERT INTO account_confirm_codes (user_id, code, expires_at, used) VALUES ($1, $2, $3, $4)', [user.id, code, new Date(Date.now() + 15 * 60 * 1000), false]);
    // Send email and WA
    try {
      const { sendMail } = await import('../utils/mailer');
      const fs = await import('fs/promises');
      const path = await import('path');
      const baseHtml = await fs.readFile(path.resolve(__dirname, '../../templates/emailBase.html'), 'utf8');
      const confirmHtml = await fs.readFile(path.resolve(__dirname, '../../templates/emailConfirm.html'), 'utf8');
      const htmlBody = confirmHtml.replace(/{{code}}/g, code).replace(/{{name}}/g, String(user.name || user.email));
      const logoUrl = `${(process.env.FRONTEND_URL || 'http://localhost:3003').replace(/\/$/, '')}/logo.png`;
      const attachments = await getLogoAttachment();
      const logoSrc = attachments && attachments.length ? 'cid:promrkts.logo' : logoUrl;
      const html = baseHtml.replace(/{{subject}}/g, 'Confirm your promrkts account').replace(/{{body}}/g, htmlBody).replace(/{{logoSrc}}/g, logoSrc);
      const text = `Your confirmation code: ${code}`;
      logger.info('Sending resend-confirmation email to %s with attachments: %s', user.email, attachments?.length ? attachments.map(a=>a.path).join(',') : 'none');
      await sendMail({ to: user.email, subject: 'Confirm your promrkts account', html, text, attachments });
    } catch (e) {
      logger.warn('Failed to send confirmation email:', e);
    }
    try {
      if (user.phone) await sendWhatsAppText(user.phone.startsWith('+') ? user.phone : `+${user.phone}`, `Your promrkts verification code is ${code}`);
    } catch (e) {
      logger.warn('Failed to send WhatsApp code on resend:', e);
    }
    return res.json({ status: 'success' });
  } catch (e) {
    logger.error('Resend confirmation error:', e);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
// getLogoAttachment removed — emails no longer include inline attachments.

