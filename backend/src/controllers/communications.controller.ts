// backend/src/controllers/communications.controller.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendMail } from '../utils/mailer';

/* --------------------------------- Helpers -------------------------------- */

function buildTicketCore(args: {
  name?: string | null;
  email?: string | null;
  createdAt?: Date | string | null;
  courseId?: string | null;
}) {
  const name = (args.name || '').toString().trim();
  const email = (args.email || '').toString().trim();
  const baseForInitials = name || email.split('@')[0] || 'U';
  const initials =
    baseForInitials
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || '')
      .join('') || 'U';

  const d = args.createdAt ? new Date(args.createdAt) : new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const MM = String(d.getMinutes()).padStart(2, '0');
  const SS = String(d.getSeconds()).padStart(2, '0');

  const courseSuffix = (args.courseId || '')
    .toString()
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(-6)
    .toUpperCase();

  return {
    initials,
    datePart: `${yy}${mm}${dd}`,
    timePart: `${HH}${MM}${SS}`,
    coursePart: courseSuffix ? `-${courseSuffix}` : '',
  };
}

function buildTicketId(args: {
  name?: string | null;
  email?: string | null;
  createdAt?: Date | string | null;
  courseId?: string | null;
}): string {
  const core = buildTicketCore(args);
  return `TCK-${core.initials}-${core.datePart}-${core.timePart}${core.coursePart}`;
}

async function generateUniqueTicketId(baseArgs: {
  name?: string | null;
  email?: string | null;
  createdAt?: Date | string | null;
  courseId?: string | null;
}) {
  // Try up to 5 times; add a short suffix on collision (very unlikely).
  for (let attempt = 0; attempt < 5; attempt++) {
    const base = buildTicketId(baseArgs);
    const suffix = attempt === 0 ? '' : `-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const candidate = `${base}${suffix}`;
    const exists = await prisma.communication.findUnique({ where: { ticketId: candidate } });
    if (!exists) return candidate;
  }
  // Fallback: long random
  return `TCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function previewOf(s: string, n = 120) {
  const txt = String(s || '');
  return txt.length > n ? txt.slice(0, n) + '…' : txt;
}

// Round a Date to the next 30-min boundary (server-side safety)
function roundToStep(d: Date, minutes = 30) {
  const ms = minutes * 60 * 1000;
  return new Date(Math.ceil(d.getTime() / ms) * ms);
}

// Treat incoming YYYY-MM-DD as a UTC day window for slot lookup
function dayRangeUtc(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start, end };
}

// Generate 30-min slots within a UTC window. Adjust hours if you prefer.
const SLOT_MINUTES = 30;
const WORK_START_HOUR_UTC = 8;   // 08:00 UTC
const WORK_END_HOUR_UTC = 16;    // 16:00 UTC

function generateSlotsUtc(dateStr: string) {
  const d0 = new Date(`${dateStr}T00:00:00.000Z`);
  const slots: Date[] = [];
  for (let h = WORK_START_HOUR_UTC; h < WORK_END_HOUR_UTC; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), d0.getUTCDate(), h, m)));
    }
  }
  return slots;
}

/* ------------------------------- Public APIs ------------------------------ */

// POST /communications
export const createCommunication = async (req: Request, res: Response) => {
  try {
    const { name, email, message, courseId, courseName, locale, url, utm, phone } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email and message are required' });
    }

    const now = new Date();
    const ticketId = await generateUniqueTicketId({
      name,
      email,
      createdAt: now, // same “now” as createdAt default
      courseId: courseId || undefined,
    });

    const record = await prisma.communication.create({
      data: {
        ticketId,
        name: String(name),
        email: String(email),
        message: String(message),
        courseId: courseId ? String(courseId) : undefined,
        courseName: courseName ? String(courseName) : undefined,
        locale: locale ? String(locale) : undefined,
        url: url ? String(url) : undefined,
        utm: utm ? (utm as any) : undefined,
        phone: phone ? String(phone) : undefined,
        // status defaults to OPEN, priority defaults to MEDIUM
      },
    });

    return res.status(201).json(record);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create communication' });
  }
};

// GET /communications/track/:id
// Accepts either ticketId (TCK-...) or raw UUID id
export const getCommunicationPublic = async (req: Request, res: Response) => {
  try {
    const { id: idParam, ticketId: ticketIdParam } = req.params as { id?: string; ticketId?: string };
    const id = (ticketIdParam || idParam || '').trim();
    if (!id) return res.status(400).json({ message: 'Missing id' });

    const upper = id.toUpperCase();
    const startsWithTck = upper.startsWith('TCK-');
    const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(id);

    let item = null as any;
    if (startsWithTck) {
      item = await prisma.communication.findUnique({ where: { ticketId: id } });
    }
    if (!item && looksLikeUuid) {
      item = await prisma.communication.findUnique({ where: { id } });
    }

    if (!item) return res.status(404).json({ message: 'Ticket not found' });

    return res.json({
      id: item.id,
      ticketId: item.ticketId,
      status: item.status, // OPEN | READ | ESCALATED | RESOLVED
      priority: item.priority, // LOW | MEDIUM | HIGH | CRITICAL
      createdAt: item.createdAt,
      courseId: item.courseId || null,
      courseName: item.courseName || null,
      preview: previewOf(item.message),
    });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch ticket' });
  }
};

// GET /communications/my  (auth required)
export const getMyCommunications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.email) return res.status(401).json({ message: 'Unauthorized' });

    const items = await prisma.communication.findMany({
      where: { email: user.email },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({
      items: items.map((it: any) => ({
        id: it.id,
        ticketId: it.ticketId,
        status: it.status,
        priority: it.priority,
        read: it.read,
        createdAt: it.createdAt,
        courseId: it.courseId || null,
        courseName: it.courseName || null,
        preview: previewOf(it.message),
      })),
    });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch tickets' });
  }
};

// GET /communications/availability?date=YYYY-MM-DD
export const getAvailability = async (req: Request, res: Response) => {
  try {
    const date = String(req.query.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'date (YYYY-MM-DD) is required' });
    }

    const { start, end } = dayRangeUtc(date);

    // Already booked at that exact slot timestamp
    const booked = await prisma.communication.findMany({
      where: {
        scheduledAt: { gte: start, lte: end },
        scheduleStatus: { in: ['REQUESTED', 'CONFIRMED'] as any },
      },
      select: { scheduledAt: true },
    });

    const taken = new Set(
      booked
        .map((b: { scheduledAt: Date | null }) => b.scheduledAt)
        .filter(Boolean)
        .map((d: Date | string) => new Date(d as Date).toISOString())
    );

    const now = Date.now();
    const slots = generateSlotsUtc(date).map((d: Date) => {
      const iso = d.toISOString();
      const isFuture = d.getTime() > now;
      return { iso, available: isFuture && !taken.has(iso) };
    });

    return res.json({ date, slotMinutes: SLOT_MINUTES, slots });
  } catch {
    return res.status(500).json({ message: 'Failed to load availability' });
  }
};

// POST /communications/schedule
// Body: { name, email?, phone?, courseId?, courseName?, message?, whenIso, tz, durationMinutes, url?, utm? }
export const scheduleCall = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, courseId, courseName, message, whenIso, tz, durationMinutes, url, utm } =
      req.body || {};

    if (!name || !whenIso || !(email || phone)) {
      return res.status(400).json({ message: 'name, whenIso, and (email or phone) are required' });
    }

    const when = roundToStep(new Date(whenIso), SLOT_MINUTES);
    if (isNaN(when.getTime())) return res.status(400).json({ message: 'Invalid whenIso' });
    if (when.getTime() <= Date.now()) return res.status(400).json({ message: 'Time is in the past' });

    // prevent double booking
    const exists = await prisma.communication.findFirst({
      where: {
        scheduledAt: when,
        scheduleStatus: { in: ['REQUESTED', 'CONFIRMED'] as any },
      },
      select: { id: true },
    });
    if (exists) return res.status(409).json({ message: 'Slot already booked' });

    // Create ticket with scheduling fields
    const now = new Date();
    const ticketId = await generateUniqueTicketId({
      name,
      email: email || undefined,
      createdAt: now,
      courseId: courseId || undefined,
    });

    const record = await prisma.communication.create({
      data: {
        ticketId,
        name: String(name),
        email: email ? String(email) : '',
        phone: phone ? String(phone) : '',
        message: message ? String(message) : 'Scheduled WhatsApp call request',
        courseId: courseId ? String(courseId) : undefined,
        courseName: courseName ? String(courseName) : undefined,
        locale: (req as any).locale || undefined,
        url: url ? String(url) : undefined,
        utm: utm ? (utm as any) : undefined,
        scheduleChannel: 'whatsapp_call',
        scheduleStatus: 'REQUESTED' as any,
        scheduleTz: tz ? String(tz) : undefined,
        scheduleDuration: Number(durationMinutes) || SLOT_MINUTES,
        scheduledAt: when,
      },
    });

    // Optional: notify ops
    try {
      await sendMail({
        to: process.env.LEADS_INBOX || 'leads@promrkts',
        subject: `[Schedule] ${record.name} — ${record.ticketId}`,
        text: `New call request at ${when.toISOString()} (tz: ${tz || 'n/a'})\n\nTicket: ${record.ticketId}`,
      });
    } catch {}

    return res.status(201).json(record);
  } catch {
    return res.status(500).json({ message: 'Failed to schedule call' });
  }
};

/* ------------------------------- Admin APIs ------------------------------- */

// GET /admin/communications
export const listCommunications = async (req: Request, res: Response) => {
  try {
    const { q, unread } = req.query as { q?: string; unread?: string };
    const onlyUnread = unread === 'true' || unread === '1';

    const where: any = {};
    if (onlyUnread) where.read = false;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        { courseName: { contains: q, mode: 'insensitive' } },
        { ticketId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const raw = await prisma.communication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(raw);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list communications' });
  }
};

// GET /admin/communications/:id
export const getCommunicationAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const item = await prisma.communication.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ message: 'Not found' });
    return res.json(item);
  } catch {
    return res.status(500).json({ message: 'Failed to load ticket' });
  }
};

// PATCH /admin/communications/:id
export const updateCommunication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { read } = req.body || {};

    const updated = await prisma.communication.update({
      where: { id },
      data: {
        read: typeof read === 'boolean' ? read : undefined,
      },
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update communication' });
  }
};

// PATCH /admin/communications/:id/priority
export const setPriority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { priority } = req.body as { priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' };
    if (!priority) return res.status(400).json({ message: 'priority is required' });

    const updated = await prisma.communication.update({
      where: { id },
      data: { priority },
    });

    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Failed to set priority' });
  }
};

// PATCH /admin/communications/:id/escalate
export const escalateCommunication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const current = await prisma.communication.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Not found' });

    const nextPriority =
      current.priority === 'CRITICAL'
        ? 'CRITICAL'
        : current.priority === 'HIGH'
        ? 'HIGH'
        : 'CRITICAL';

    const updated = await prisma.communication.update({
      where: { id },
      data: { status: 'ESCALATED', priority: nextPriority },
    });

    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Failed to escalate ticket' });
  }
};

// PATCH /admin/communications/:id/close
export const closeCommunication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const updated = await prisma.communication.update({
      where: { id },
      data: { status: 'RESOLVED', read: true, completedAt: new Date() },
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Failed to close ticket' });
  }
};

// PATCH /admin/communications/:id/resolve
export const resolveCommunication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const updated = await prisma.communication.update({
      where: { id },
      data: { status: 'RESOLVED', read: true, completedAt: new Date() },
    });

    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Failed to resolve ticket' });
  }
};

// PATCH /admin/communications/:id/assign
export const assignCommunication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { assignedAdminId, adminEmail } = req.body as {
      assignedAdminId?: string;
      adminEmail?: string;
    };

    let adminId = assignedAdminId || null;
    if (!adminId && adminEmail) {
      const admin = await prisma.users.findFirst({
        where: { email: adminEmail, role: 'admin' },
        select: { id: true },
      });
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
      adminId = admin.id;
    }

    const updated = await prisma.communication.update({
      where: { id },
      data: { assignedAdminId: adminId },
    });

    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Failed to assign ticket' });
  }
};

// POST /admin/communications/:id/reply
export const replyToCommunication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { subject, html, text, fromName, fromEmail } = req.body || {};

    const item = await prisma.communication.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ message: 'Ticket not found' });

    if (!subject || !(html || text)) {
      return res.status(400).json({ message: 'subject and (html or text) are required' });
    }

    await sendMail({
      to: item.email,
      subject,
      html,
      text,
      fromName,
      fromEmail,
    });

    await prisma.communication.update({
      where: { id },
      data: { read: true, status: item.status === 'OPEN' ? 'READ' : item.status },
    });

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ message: 'Failed to send email' });
  }
};

/* ----------------- Admin helpers (for assignment dropdown) ---------------- */

// GET /admin/admins
export const listAdminsForAssign = async (_req: Request, res: Response) => {
  try {
    const admins = await prisma.users.findMany({
      where: { role: 'admin', status: 'active' },
      select: { id: true, name: true, email: true },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });
    return res.json({ data: admins });
  } catch {
    return res.status(500).json({ message: 'Failed to load admins' });
  }
};
