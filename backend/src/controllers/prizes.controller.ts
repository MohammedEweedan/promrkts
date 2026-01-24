import { Request, Response } from 'express';
import prisma from '../config/prisma';

// GET /admin/prizes
export async function listPrizes(req: Request, res: Response) {
  try {
    const prizes = await prisma.prize.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        draws: {
          include: {
            winners: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { executedAt: 'desc' },
        },
      },
    });
    return res.json({ data: prizes });
  } catch (e) {
    return res.status(500).json({ message: 'Unable to list prizes' });
  }
}

// POST /admin/prizes
export async function createPrize(req: Request, res: Response) {
  try {
    const { name, photoUrl } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name is required' });
    const prize = await prisma.prize.create({ data: { name, photoUrl } });
    return res.status(201).json({ data: prize });
  } catch (e) {
    return res.status(400).json({ message: 'Unable to create prize' });
  }
}

// POST /admin/prizes/:id/draw
// audience: ENROLLED | VISITOR
// For ENROLLED: pick top 3 users by total XP
// For VISITOR: accept names list and pick top 3 (first 3 or random)
export async function createPrizeDraw(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const { audience = 'ENROLLED', visitorNames, randomize } = req.body as {
    audience?: 'ENROLLED' | 'VISITOR';
    visitorNames?: string[];
    randomize?: boolean;
  };

  try {
    const prize = await prisma.prize.findUnique({ where: { id } });
    if (!prize) return res.status(404).json({ message: 'Prize not found' });

    const draw = await prisma.prizeDraw.create({ data: { prizeId: id, audience } as any });

    if (audience === 'ENROLLED') {
      // compute leaderboard
      const users = await prisma.users.findMany({
        where: { role: { in: ['user', 'student'] } },
        select: {
          id: true,
          name: true,
          email: true,
          studentProgress: { select: { xp: true } },
        },
      });
      const sorted = users
        .map((u: { id: string; name: string | null; email: string; studentProgress: { xp: number }[] }) => ({
          id: u.id,
          name: u.name || u.email,
          xp: u.studentProgress.reduce((s: number, p: { xp: number }) => s + (p?.xp || 0), 0),
        }))
        .sort((a: { xp: number }, b: { xp: number }) => b.xp - a.xp)
        .slice(0, 3);

      const winners = await Promise.all(
        sorted.map((u: { id: string; name: string }, idx: number) =>
          prisma.prizeWinner.create({
            data: { drawId: draw.id, userId: u.id, position: idx + 1, name: u.name },
          })
        )
      );
      return res.status(201).json({ data: { draw, winners } });
    }

    // VISITOR audience
    const names: string[] = Array.isArray(visitorNames) ? visitorNames.filter(Boolean) : [];
    if (names.length < 3) return res.status(400).json({ message: 'Provide at least 3 visitorNames' });
    const pool = [...names];
    const picks: string[] = [];
    for (let i = 0; i < 3; i++) {
      if (randomize) {
        const ix = Math.floor(Math.random() * pool.length);
        picks.push(pool.splice(ix, 1)[0]);
      } else {
        picks.push(pool.shift()!);
      }
    }
    const winners = await Promise.all(
      picks.map((name, idx) =>
        prisma.prizeWinner.create({ data: { drawId: draw.id, userId: null, position: idx + 1, name } })
      )
    );
    return res.status(201).json({ data: { draw, winners } });
  } catch (e) {
    return res.status(400).json({ message: 'Unable to create draw' });
  }
}
