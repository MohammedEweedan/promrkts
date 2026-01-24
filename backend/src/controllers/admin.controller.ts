import { Request, Response } from 'express';
import { PrismaClient, Prisma, DiscountType } from '@prisma/client';
import type { PromoCode } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient() as any;

// Verify user account
export const verifyUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await prisma.users.update({ where: { id }, data: { status: 'verified' } });
    return res.json({ data: updated });
  } catch (e: any) {
    return res.status(400).json({ message: 'Unable to verify user' });
  }
};

// Update marketing banner
export const updateBanner = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { imageUrl, title, subtitle, badge, href } = req.body || {};
  try {
    const rows = await prisma.$queryRawUnsafe(
      `UPDATE banners
       SET image_url = COALESCE($2, image_url),
           title = COALESCE($3, title),
           subtitle = COALESCE($4, subtitle),
           badge = COALESCE($5, badge),
           href = COALESCE($6, href)
       WHERE id = $1::uuid
       RETURNING id, image_url, title, subtitle, badge, href, created_at`,
      id, imageUrl || null, title || null, subtitle || null, badge || null, href || null
    );
    const row = rows?.[0] || null;
    if (!row) return res.status(404).json({ message: 'Not found' });
    return res.json({ data: {
      id: row.id,
      imageUrl: row.image_url,
      title: row.title,
      subtitle: row.subtitle,
      badge: row.badge,
      href: row.href,
      created_at: row.created_at,
    } });
  } catch (e: any) {
    return res.status(400).json({ message: 'Unable to update banner' });
  }
};

// Delete marketing banner
export const deleteBanner = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const rows = await prisma.$queryRawUnsafe(
      `DELETE FROM banners WHERE id = $1::uuid RETURNING id`,
      id
    );
    if (!rows?.[0]) return res.status(404).json({ message: 'Not found' });
    return res.status(204).send();
  } catch (e: any) {
    return res.status(400).json({ message: 'Unable to delete banner' });
  }
};

// JSON upload: expects { data: base64String, filename?: string }
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const { data, filename } = req.body as any;
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ message: 'Missing data' });
    }
    const match = data.match(/^data:(.*?);base64,(.*)$/);
    const base64 = match ? match[2] : data;
    const buff = Buffer.from(base64, 'base64');
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const name = filename && typeof filename === 'string' ? filename : `upload_${Date.now()}.jpg`;
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fullPath = path.join(uploadsDir, safeName);
    fs.writeFileSync(fullPath, buff);
    const url = `/api/uploads/${safeName}`;
    return res.status(201).json({ url });
  } catch (e) {
    return res.status(500).json({ message: 'Upload failed' });
  }
};

// List all users (admin dashboard)
export const listUsers = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.users.findMany({
      select: { id: true, name: true, email: true, role: true, status: true },
      orderBy: { created_at: 'desc' },
      take: 1000,
    });
    return res.json(rows);
  } catch {
    return res.json([]);
  }
};

// List unverified users
export const listUnverifiedUsers = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.users.findMany({ where: { status: { not: 'verified' } }, orderBy: { created_at: 'desc' }, take: 100 });
    return res.json({ data: rows });
  } catch {
    return res.json({ data: [] });
  }
};

// List unverified businesses
export const listUnverifiedBusinesses = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.businesses.findMany({ where: { verified: false }, orderBy: { created_at: 'desc' }, take: 100 });
    return res.json({ data: rows });
  } catch {
    return res.json({ data: [] });
  }
};

// ---- PROMOS (use Prisma model `PromoCode`) ----
/* --------------------------- PROMO CODE CONTROLLERS --------------------------- */

type PromoBody = {
  code?: string;
  discountType?: 'PERCENT' | 'AMOUNT';
  value?: number;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  maxGlobalRedemptions?: number | null;
  maxPerUser?: number | null;
  minSpendUsd?: number | null;
  applicableTierIds?: string[] | null; // CourseTier IDs
  active?: boolean;
};

function toDateOrNull(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildPromoCreateData(body: PromoBody): Prisma.PromoCodeCreateInput {
  if (!body.code) throw new Error('code is required');
  if (!body.discountType) throw new Error('discountType is required');
  if (typeof body.value !== 'number') throw new Error('value must be a number');

  return {
    code: body.code.trim(),
    // ✅ use the enum you imported
    discountType: body.discountType as DiscountType,
    value: body.value,
    startsAt: toDateOrNull(body.startsAt) ?? undefined, // undefined means “leave null”
    endsAt: toDateOrNull(body.endsAt) ?? undefined,
    maxGlobalRedemptions:
      typeof body.maxGlobalRedemptions === 'number' ? body.maxGlobalRedemptions : undefined,
    maxPerUser: typeof body.maxPerUser === 'number' ? body.maxPerUser : undefined,
    minSpendUsd: typeof body.minSpendUsd === 'number' ? body.minSpendUsd : undefined,
    // ✅ JSON: only set when provided; don’t pass null here (use undefined)
    applicableTierIds: Array.isArray(body.applicableTierIds)
      ? (body.applicableTierIds as unknown as Prisma.InputJsonValue)
      : undefined,
    active: typeof body.active === 'boolean' ? body.active : true,
  };
}

function buildPromoUpdateData(body: PromoBody): Prisma.PromoCodeUpdateInput {
  const patch: Prisma.PromoCodeUpdateInput = {};

  if (typeof body.code === 'string') patch.code = body.code.trim();
  if (body.discountType) patch.discountType = body.discountType as DiscountType;
  if (typeof body.value === 'number') patch.value = body.value;

  if ('startsAt' in body) patch.startsAt = toDateOrNull(body.startsAt);
  if ('endsAt' in body) patch.endsAt = toDateOrNull(body.endsAt);

  if ('maxGlobalRedemptions' in body)
    patch.maxGlobalRedemptions =
      typeof body.maxGlobalRedemptions === 'number' ? body.maxGlobalRedemptions : null;
  if ('maxPerUser' in body)
    patch.maxPerUser = typeof body.maxPerUser === 'number' ? body.maxPerUser : null;
  if ('minSpendUsd' in body)
    patch.minSpendUsd = typeof body.minSpendUsd === 'number' ? body.minSpendUsd : null;

  if ('applicableTierIds' in body) {
    patch.applicableTierIds = Array.isArray(body.applicableTierIds)
      // ✅ when updating to an array, pass JSON value
      ? (body.applicableTierIds as unknown as Prisma.InputJsonValue)
      // ✅ when clearing, use Prisma.JsonNull (not raw null)
      : Prisma.JsonNull;
  }

  if (typeof body.active === 'boolean') patch.active = body.active;

  return patch;
}

// GET /admin/promos
export const listPromoCodes = async (req: Request, res: Response) => {
  try {
    const promos: PromoCode[] = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      take: 250,
    });

    const withUsage = await Promise.all(
      promos.map(async (p) => {
        const usedCount = await prisma.purchase.count({
          where: { promoId: p.id, status: 'CONFIRMED' },
        });
        const revenueUsd = await prisma.purchase.aggregate({
          _sum: { finalPriceUsd: true },
          where: { promoId: p.id, status: 'CONFIRMED' },
        });
        return {
          ...p,
          usedCount,
          revenueFromPromoUsd: revenueUsd._sum.finalPriceUsd ?? 0,
        };
      })
    );


    return res.json({ data: withUsage });
  } catch {
    return res.json({ data: [] });
  }
};

// POST /admin/promos
export const createPromoCode = async (req: Request, res: Response) => {
  try {
    const data = buildPromoCreateData(req.body as PromoBody);
    const created = await prisma.promoCode.create({ data });
    return res.status(201).json({ data: created });
  } catch (e: any) {
    // Surface useful error messages (e.g., duplicate code)
    const msg =
      e?.code === 'P2002'
        ? 'Promo code already exists'
        : e?.message || 'Unable to create promo';
    return res.status(400).json({ message: msg });
  }
};

// PATCH /admin/promos/:id
export const updatePromoCode = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const patch = req.body ?? {};

  // Only map provided fields; leave others undefined
  const data: Prisma.PromoCodeUpdateInput = {
    code: typeof patch.code === 'string' ? patch.code.trim() : undefined,
    discountType: patch.discountType,
    value: typeof patch.value === 'number' ? patch.value : undefined,
    startsAt: 'startsAt' in patch ? (patch.startsAt ? new Date(patch.startsAt) : null) : undefined,
    endsAt: 'endsAt' in patch ? (patch.endsAt ? new Date(patch.endsAt) : null) : undefined,
    maxGlobalRedemptions:
      'maxGlobalRedemptions' in patch ? patch.maxGlobalRedemptions ?? null : undefined,
    maxPerUser: 'maxPerUser' in patch ? patch.maxPerUser ?? null : undefined,
    minSpendUsd: 'minSpendUsd' in patch ? patch.minSpendUsd ?? null : undefined,
    applicableTierIds:
      'applicableTierIds' in patch
        ? Array.isArray(patch.applicableTierIds)
          ? (patch.applicableTierIds as Prisma.InputJsonValue)
          : Prisma.JsonNull
        : undefined,
    active: typeof patch.active === 'boolean' ? patch.active : undefined,
  };

  try {
    const updated = await prisma.promoCode.update({ where: { id }, data });
    return res.json({ data: updated });
  } catch (e: any) {
    const status = e?.code === 'P2025' ? 404 : 400;
    return res.status(status).json({ message: e?.message ?? 'Unable to update promo' });
  }
};


// DELETE /admin/promos/:id
export const deletePromoCode = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    await prisma.promoCode.delete({ where: { id } });
    return res.status(204).send();
  } catch (e: any) {
    const status = e?.code === 'P2025' ? 404 : 400;
    const msg = e?.code === 'P2025' ? 'Not found' : 'Unable to delete promo';
    return res.status(status).json({ message: msg });
  }
};


// ---- Admins list (for assign dropdowns) ----
export const listAdminsForAssign = async (_req: Request, res: Response) => {
  try {
    const admins = await prisma.users.findMany({
      where: { role: { in: ['admin', 'owner', 'superadmin'] }, status: 'active' },
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });
    return res.json({ data: admins });
  } catch {
    return res.status(500).json({ message: 'Failed to load admins' });
  }
};

// Verify business account
export const verifyBusiness = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await prisma.businesses.update({ where: { id }, data: { verified: true, status: 'active' } });
    return res.json({ data: updated });
  } catch (e: any) {
    return res.status(400).json({ message: 'Unable to verify business' });
  }
};

// Create discovery content records
export const createRecommendedRoute = async (req: Request, res: Response) => {
  const { title, origin, destination, date, note, currency } = req.body || {};
  try {
    // Use raw SQL so it works regardless of Prisma introspection state
    const rows = await prisma.$queryRawUnsafe(
      `INSERT INTO recommended_routes (title, origin, destination, date, note, currency)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, origin, destination, date, note, currency, created_at`,
       title || null, origin || null, destination || null, date ? new Date(date) : null, note || null, currency || 'USD'
    );
    return res.status(201).json({ data: rows?.[0] || null });
  } catch (e: any) {
    return res.status(400).json({ message: 'Unable to create recommended route' });
  }
};

export const createPopularTrip = async (req: Request, res: Response) => {
  const { title, origin, destination, price, currency } = req.body || {};
  try {
    const rows = await prisma.$queryRawUnsafe(
      `INSERT INTO popular_trips (title, origin, destination, price, currency)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, origin, destination, price, currency, created_at`,
       title || null, origin || null, destination || null, price ?? null, currency || 'USD'
    );
    return res.status(201).json({ data: rows?.[0] || null });
  } catch (e: any) {
    return res.status(400).json({ message: 'Unable to create popular trip' });
  }
};

export const createTicketOffer = async (req: Request, res: Response) => {
  const { title, origin, destination, airline, price, currency, expires_at } = req.body || {};
  try {
    const rows = await prisma.$queryRawUnsafe(
      `INSERT INTO ticket_offers (title, origin, destination, airline, price, currency, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, origin, destination, airline, price, currency, expires_at, created_at`,
       title || null, origin || null, destination || null, airline || null, price ?? null, currency || 'USD', expires_at ? new Date(expires_at) : null
    );
    return res.status(201).json({ data: rows?.[0] || null });
  } catch (e: any) {
    return res.status(400).json({ message: 'Unable to create ticket offer' });
  }
};

export const createPopularDestination = async (req: Request, res: Response) => {
  const { name, title, subtitle, imageUrl, currency } = req.body || {};
  try {
    const rows = await prisma.$queryRawUnsafe(
      `INSERT INTO popular_destinations (name, title, subtitle, imageUrl, currency)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, title, subtitle, imageUrl, currency, created_at`,
       name || null, title || null, subtitle || null, imageUrl || null, currency || 'USD'
    );
    return res.status(201).json({ data: rows?.[0] || null });
  } catch (e: any) {
    return res.status(400).json({ message: 'Unable to create destination' });
  }
};

// Create marketing banner
export const createBanner = async (req: Request, res: Response) => {
  const { imageUrl, title, subtitle, badge, href } = req.body || {};
  try {
    const rows = await prisma.$queryRawUnsafe(
      `INSERT INTO banners (image_url, title, subtitle, badge, href)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, image_url, title, subtitle, badge, href, created_at`,
      imageUrl || null, title || null, subtitle || null, badge || null, href || null
    );
    const row = rows?.[0] || null;
    return res.status(201).json({ data: row && {
      id: row.id,
      imageUrl: row.image_url,
      title: row.title,
      subtitle: row.subtitle,
      badge: row.badge,
      href: row.href,
      created_at: row.created_at
    }});
  } catch (e: any) {
    return res.status(400).json({ message: 'Unable to create banner' });
  }
};
