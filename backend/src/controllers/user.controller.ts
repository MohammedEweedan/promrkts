import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import db from '../config/database';
import { ensureJourney } from '../services/journey.service';
import { getEntitlements } from '../services/entitlements.service';

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await db.query('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyJourney = async (req: AuthRequest, res: Response) => {
  try {
    const journey = await ensureJourney(req.user!.id);
    res.json(journey);
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyEntitlements = async (req: AuthRequest, res: Response) => {
  try {
    const ent = await getEntitlements(req.user!.id);
    res.json(ent);
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: total users
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.query('SELECT COUNT(*)::int AS total FROM users');
    const total = result.rows?.[0]?.total ?? 0;
    res.json({ total });
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: signups per day (last 90 days)
export const getUserSignups = async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
       FROM users
       WHERE created_at >= now() - interval '90 days'
       GROUP BY 1
       ORDER BY 1 ASC`
    );
    res.json(result.rows || []);
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, phone, avatar_url } = req.body as { name?: string; phone?: string; avatar_url?: string };
    const result = await db.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), avatar_url = COALESCE($3, avatar_url) WHERE id = $4 RETURNING id, name, email, phone, role, avatar_url, created_at',
      [name ?? null, phone ?? null, avatar_url ?? null, userId]
    );
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
