import { Router } from 'express';
import db from '../config/database';

const router = Router();

// Dev-only: get latest confirmation code for an email
router.get('/confirm-token', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return res.status(403).json({ ok: false, message: 'Not allowed in production' });
    }
    const email = String(req.query.email || '');
    if (!email) return res.status(400).json({ ok: false, message: 'email required' });
    const user = await db.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (!user.rows.length) return res.status(404).json({ ok: false, message: 'user not found' });
    const userId = user.rows[0].id;
    const resp = await db.query(
      'SELECT id, code, expires_at, used, created_at FROM account_confirm_codes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    const row = resp.rows[0];
    if (!row) return res.status(404).json({ ok: false, message: 'no codes found' });
    return res.json({ ok: true, code: row.code, expiresAt: row.expires_at, used: row.used });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || String(e) || 'error' });
  }
});

export default router;
