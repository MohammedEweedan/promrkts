import prisma from '../config/prisma';
import { Request, Response } from 'express';

export async function listChallenges(_req: Request, res: Response) {
  const rows = await prisma.courseTier.findMany({
    where: { productType: 'CHALLENGE' as any },
    orderBy: { price_stripe: 'asc' },
  });
  return res.json(rows);
}

export async function getChallenge(req: Request, res: Response) {
  const { id } = req.params;
  const uuidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  if (!uuidRe.test(id)) return res.status(400).json({ message: 'Invalid challenge id' });

  const tier = await prisma.courseTier.findFirst({ where: { id, productType: 'CHALLENGE' as any } });
  if (!tier) return res.status(404).json({ message: 'Challenge not found' });
  return res.json(tier);
}
