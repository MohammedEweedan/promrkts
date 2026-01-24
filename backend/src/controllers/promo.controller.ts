import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAdmin } from '../middleware/authJwt';

export const listPromos = [requireAdmin, async (_req: Request, res: Response) => {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(promos);
}];

export const createPromo = [requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      code,
      discountType,
      value,
      startsAt,
      endsAt,
      maxGlobalRedemptions,
      maxPerUser,
      minSpendUsd,
      applicableTierIds,
      active = true,
    } = req.body || {};

    if (!code || !discountType || value == null) {
      return res.status(400).json({ message: 'code, discountType, value are required' });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: String(code).toUpperCase(),
        discountType,
        value: Number(value),
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        maxGlobalRedemptions: maxGlobalRedemptions != null ? Number(maxGlobalRedemptions) : null,
        maxPerUser: maxPerUser != null ? Number(maxPerUser) : null,
        minSpendUsd: minSpendUsd != null ? Number(minSpendUsd) : null,
        applicableTierIds: Array.isArray(applicableTierIds) ? applicableTierIds : undefined,
        active: !!active,
      },
    });

    res.status(201).json(promo);
  } catch (e: any) {
    res.status(500).json({ message: 'Failed to create promo' });
  }
}];

export const updatePromo = [requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const data: any = {};
    const fields = [
      'code','discountType','value','startsAt','endsAt','maxGlobalRedemptions','maxPerUser','minSpendUsd','applicableTierIds','active'
    ];
    for (const k of fields) {
      if (k in req.body) {
        let v = (req.body as any)[k];
        if (k === 'code') v = String(v).toUpperCase();
        if (k === 'value' || k === 'minSpendUsd') v = v == null ? null : Number(v);
        if (k === 'startsAt' || k === 'endsAt') v = v ? new Date(v) : null;
        if (k === 'maxGlobalRedemptions' || k === 'maxPerUser') v = v == null ? null : Number(v);
        data[k] = v;
      }
    }
    const promo = await prisma.promoCode.update({ where: { id }, data });
    res.json(promo);
  } catch (e: any) {
    res.status(500).json({ message: 'Failed to update promo' });
  }
}];

export const deletePromo = [requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.promoCode.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ message: 'Failed to delete promo' });
  }
}];

// Public: GET /promos/cohort
// Returns a currently valid percent promo with value <= 10, if any.
export const getCohortPromo = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const promo = await prisma.promoCode.findFirst({
      where: {
        active: true,
        discountType: 'PERCENT' as any,
        value: { lte: 10, gt: 0 } as any,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: [{ endsAt: 'asc' as any }, { createdAt: 'desc' }],
    });
    if (!promo) return res.status(204).send();
    return res.json({ code: promo.code, discountType: promo.discountType, value: promo.value });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch cohort promo' });
  }
};
