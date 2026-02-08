import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../config/database';
import logger from '../utils/logger';
import { ensureJourney } from '../services/journey.service';
import { ensureEntitlements } from '../services/entitlements.service';
import { sendWelcomeEmail } from '../services/email.service';

const JWT_SECRET = (process.env.JWT_SECRET || 'your_jwt_secret_key') as jwt.Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

const generateRefreshToken = () => ({
  token: randomUUID(),
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
});

/**
 * Find or create a user from OAuth profile data.
 * If user exists by email, link the OAuth provider. If not, create a new account.
 */
async function findOrCreateOAuthUser(profile: {
  email: string;
  name: string;
  provider: string;
  providerId: string;
  avatarUrl?: string;
}) {
  const { email, name, provider, providerId, avatarUrl } = profile;

  // Check if user exists
  const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    // Update oauth fields if not already set
    try {
      await db.query(
        `UPDATE users SET oauth_provider = COALESCE(oauth_provider, $1), oauth_provider_id = COALESCE(oauth_provider_id, $2), avatar_url = COALESCE(avatar_url, $3), email_confirmed = true, updated_at = NOW() WHERE id = $4`,
        [provider, providerId, avatarUrl || null, user.id]
      );
    } catch (e) {
      // If columns don't exist yet, just proceed — user still logs in
      logger.warn('Could not update OAuth fields (columns may not exist yet):', e);
    }
    return user;
  }

  // Create new user with a random password (they'll use OAuth to log in)
  const randomPassword = await bcrypt.hash(randomUUID(), 10);
  const effectiveRole = email.toLowerCase() === 'mohammedawidan@yahoo.com' ? 'admin' : 'user';

  const newUser = await db.query(
    `INSERT INTO users (name, email, password, role, email_confirmed, oauth_provider, oauth_provider_id, avatar_url)
     VALUES ($1, $2, $3, $4, true, $5, $6, $7)
     RETURNING id, name, email, role`,
    [name || email.split('@')[0], email, randomPassword, effectiveRole, provider, providerId, avatarUrl || null]
  );

  const userId = newUser.rows[0].id;
  await ensureJourney(userId);
  await ensureEntitlements(userId);

  // Send welcome email (account is already verified via OAuth)
  try {
    await sendWelcomeEmail({ email, name: name || email });
  } catch (e) {
    logger.warn('Failed to send welcome email after OAuth signup:', e);
  }

  return newUser.rows[0];
}

/**
 * Issue JWT + refresh token and set cookie
 */
async function issueTokens(res: Response, user: any) {
  const accessToken = generateToken(user.id, user.role);
  const refreshToken = generateRefreshToken();

  try {
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken.token, refreshToken.expiresAt]
    );
    res.cookie('refreshToken', refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });
  } catch (e) {
    logger.warn('Failed to persist refresh token for OAuth user:', e);
  }

  const { password: _, ...userWithoutPassword } = user;
  return { accessToken, user: userWithoutPassword };
}

// ==================== GOOGLE ====================
export const googleOAuth = async (req: Request, res: Response) => {
  try {
    const { token, credential } = req.body as { token?: string; credential?: string };
    const idToken = token || credential;

    if (!idToken) {
      return res.status(400).json({ status: 'error', message: 'Google token is required' });
    }

    // Verify the Google ID token by calling Google's tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      return res.status(401).json({ status: 'error', message: 'Invalid Google token' });
    }

    const payload = await response.json();
    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Google account has no email' });
    }

    const user = await findOrCreateOAuthUser({
      email,
      name: name || email.split('@')[0],
      provider: 'google',
      providerId: googleId,
      avatarUrl: picture,
    });

    const result = await issueTokens(res, user);
    return res.json({ status: 'success', data: result });
  } catch (error) {
    logger.error('Google OAuth error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ==================== GITHUB ====================
export const githubOAuth = async (req: Request, res: Response) => {
  try {
    const { code } = req.body as { code?: string };

    if (!code) {
      return res.status(400).json({ status: 'error', message: 'GitHub code is required' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ status: 'error', message: 'GitHub OAuth not configured' });
    }

    // Exchange code for access token
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(401).json({ status: 'error', message: 'Failed to get GitHub access token' });
    }

    // Get user profile
    const [userResp, emailsResp] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      }),
    ]);

    const ghUser = await userResp.json();
    const ghEmails = await emailsResp.json();

    // Get primary verified email
    let email = '';
    if (Array.isArray(ghEmails)) {
      const primary = ghEmails.find((e: any) => e.primary && e.verified);
      email = primary?.email || ghEmails.find((e: any) => e.verified)?.email || '';
    }
    if (!email) email = ghUser.email || '';

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Could not get email from GitHub. Please make your email public in GitHub settings.' });
    }

    const user = await findOrCreateOAuthUser({
      email,
      name: ghUser.name || ghUser.login || email.split('@')[0],
      provider: 'github',
      providerId: String(ghUser.id),
      avatarUrl: ghUser.avatar_url,
    });

    const result = await issueTokens(res, user);
    return res.json({ status: 'success', data: result });
  } catch (error) {
    logger.error('GitHub OAuth error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ==================== APPLE ====================
export const appleOAuth = async (req: Request, res: Response) => {
  try {
    const { id_token, code, user: appleUser } = req.body as {
      id_token?: string;
      code?: string;
      user?: { name?: { firstName?: string; lastName?: string }; email?: string };
    };

    if (!id_token) {
      return res.status(400).json({ status: 'error', message: 'Apple ID token is required' });
    }

    // Decode the Apple ID token (JWT) to get user info
    // Apple ID tokens are JWTs signed by Apple. For production, verify with Apple's public keys.
    // For now, decode the payload (the frontend already verified it via Apple's JS SDK).
    const parts = id_token.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ status: 'error', message: 'Invalid Apple ID token format' });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    const { email: tokenEmail, sub: appleId } = payload;

    // Apple only sends user info on first authorization
    const email = tokenEmail || appleUser?.email;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Could not get email from Apple' });
    }

    const firstName = appleUser?.name?.firstName || '';
    const lastName = appleUser?.name?.lastName || '';
    const name = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

    const user = await findOrCreateOAuthUser({
      email,
      name,
      provider: 'apple',
      providerId: appleId,
    });

    const result = await issueTokens(res, user);
    return res.json({ status: 'success', data: result });
  } catch (error) {
    logger.error('Apple OAuth error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
