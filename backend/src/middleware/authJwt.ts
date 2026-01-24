import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type JWTPayload = { sub: string; role: 'admin' | 'student' | string };

export function requireAuth(req: Request & { user?: JWTPayload }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as JWTPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
export function requireAdmin(req: Request & { user?: JWTPayload }, res: Response, next: NextFunction) {
  return requireAuth(req, res, () => {
    const role = String(req.user?.role || '').toLowerCase();
    if (role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  });
}