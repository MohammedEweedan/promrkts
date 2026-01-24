import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getRecommendedRoutes = async (req: Request, res: Response) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT id, title, origin, destination, "date" as date, note, currency, created_at
      FROM recommended_routes
      ORDER BY created_at DESC
      LIMIT 24
    `.catch(() => []);
    return res.status(200).json({ data: rows || [] });
  } catch (e: any) {
    return res.status(200).json({ data: [] });
  }
};

export const getPopularTrips = async (req: Request, res: Response) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT id, title, origin, destination, price, currency, created_at
      FROM popular_trips
      ORDER BY created_at DESC
      LIMIT 24
    `.catch(() => []);
    return res.status(200).json({ data: rows || [] });
  } catch (e: any) {
    return res.status(200).json({ data: [] });
  }
};

// Lightweight city suggestions: pull from popular_destinations first, then fallback to a small in-memory list
const FALLBACK_CITIES = [
  { code: 'DXB', city: 'Dubai' },
  { code: 'LHR', city: 'London' },
  { code: 'JFK', city: 'New York' },
  { code: 'CDG', city: 'Paris' },
  { code: 'FRA', city: 'Frankfurt' },
  { code: 'DOH', city: 'Doha' },
  { code: 'SIN', city: 'Singapore' },
  { code: 'HND', city: 'Tokyo' },
  { code: 'BKK', city: 'Bangkok' },
  { code: 'CAI', city: 'Cairo' },
  { code: 'TIP', city: 'Tripoli' },
  { code: 'IST', city: 'Istanbul' },
  { code: 'MCC', city: 'Mecca' },
  { code: 'MED', city: 'Medina' },
  { code: 'TUN', city: 'Tunis' },
];

export const getCitySuggestions = async (req: Request, res: Response) => {
  const q = String(req.query.query || '').trim().toLowerCase();
  try {
    const dests = await (prisma as any).popular_destinations.findMany({ take: 50 });
    let list = (dests as any[])
      .map((d: any) => ({ code: d.code || '', city: d.name || d.title || '' }))
      .filter((d: any) => d.city);
    if (list.length < 5) list = [...list, ...FALLBACK_CITIES];
    if (q) list = list.filter((x: any) => x.city.toLowerCase().includes(q) || x.code.toLowerCase().includes(q));
    list = list.slice(0, 10);
    return res.json({ data: list });
  } catch (e) {
    let list = FALLBACK_CITIES;
    if (q) list = list.filter(x => x.city.toLowerCase().includes(q) || x.code.toLowerCase().includes(q)).slice(0, 10);
    return res.json({ data: list });
  }
};

const AIRLINES = [
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'EK', name: 'Emirates' },
  { code: 'EY', name: 'Etihad Airways' },
  { code: 'LN', name: 'Libyan Airlines' },
  { code: 'EY', name: 'AlAfriqiya Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'BA', name: 'British Airways' },
  { code: 'AF', name: 'Air France' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'TK', name: 'Turkish Airlines' },
  { code: 'AA', name: 'American Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
];

export const getAirlines = async (_req: Request, res: Response) => {
  return res.json({ data: AIRLINES });
};
