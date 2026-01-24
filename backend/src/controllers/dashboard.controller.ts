import { Request, Response } from "express";
import prisma from "../config/prisma";
import { requireAuth } from "../middleware/authJwt";
import {
  ensureEntitlements,
  getEntitlements,
  ensureDashboardUsage,
} from "../services/entitlements.service";

type AuthedRequest = Request & { user?: { sub: string; role?: string } };

const DEFAULT_LAYOUT = { widgets: [] };
const PRESET_LAYOUTS: Record<string, any> = {
  starter: {
    widgets: [
      { id: "hero", kind: "welcome", x: 0, y: 0, w: 6, h: 4 },
      { id: "markets", kind: "market-overview", x: 6, y: 0, w: 6, h: 8 },
      { id: "news", kind: "economic-calendar", x: 0, y: 4, w: 6, h: 8 },
    ],
  },
  markets: {
    widgets: [
      { id: "fx-grid", kind: "tvForexHeatmap", x: 0, y: 0, w: 6, h: 8 },
      { id: "crypto-grid", kind: "tvCryptoHeatmap", x: 6, y: 0, w: 6, h: 8 },
      { id: "ticker", kind: "tvTickerTape", x: 0, y: 8, w: 12, h: 2 },
    ],
  },
};

async function assertWorkspaceOwner(userId: string, workspaceId: string) {
  const workspace = await prisma.dashboardWorkspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) {
    const err: any = new Error("Workspace not found");
    err.statusCode = 404;
    throw err;
  }
  return workspace;
}

async function ensureDefaultWorkspace(userId: string) {
  const workspaces = await prisma.dashboardWorkspace.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (!workspaces.length) {
    const created = await prisma.dashboardWorkspace.create({
      data: {
        userId,
        name: "My Workspace",
        isDefault: true,
      },
    });
    return [created];
  }
  const hasDefault = workspaces.some((w: { isDefault: boolean }) => w.isDefault);
  if (!hasDefault) {
    await prisma.dashboardWorkspace.update({
      where: { id: workspaces[0].id },
      data: { isDefault: true },
    });
  }
  return prisma.dashboardWorkspace.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

async function enforceDashboardAccess(userId: string) {
  const ent = await getEntitlements(userId);
  if (!ent?.canUseDashboard) {
    const err: any = new Error("Dashboard access requires an active course or subscription");
    err.statusCode = 403;
    throw err;
  }
  return ent;
}

async function enforceWorkspaceCap(userId: string, ent: Awaited<ReturnType<typeof getEntitlements>>) {
  const count = await prisma.dashboardWorkspace.count({ where: { userId } });
  if (count >= ent.maxWorkspaces && ent.maxWorkspaces > -1) {
    const err: any = new Error("Workspace limit reached");
    err.statusCode = 422;
    throw err;
  }
}

function formatError(error: any, res: Response) {
  const status = Number(error?.statusCode || 500);
  return res.status(status).json({ error: error?.message || "Dashboard operation failed" });
}

export const listWorkspaces = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      await ensureEntitlements(userId);
      const ent = await getEntitlements(userId);
      const workspaces = await ensureDefaultWorkspace(userId);
      res.json({ workspaces, entitlements: ent });
    } catch (error) {
      return formatError(error, res);
    }
  },
];

export const createWorkspace = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      const ent = await enforceDashboardAccess(userId);
      await enforceWorkspaceCap(userId, ent);
      const name = (req.body?.name || "").trim() || `Workspace ${new Date().toLocaleDateString()}`;
      const workspace = await prisma.dashboardWorkspace.create({
        data: {
          userId,
          name,
          isDefault: false,
        },
      });
      res.status(201).json(workspace);
    } catch (error) {
      return formatError(error, res);
    }
  },
];

export const updateWorkspace = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      await enforceDashboardAccess(userId);
      const { id } = req.params as { id: string };
      const { name, isDefault } = req.body as { name?: string; isDefault?: boolean };
      const workspace = await assertWorkspaceOwner(userId, id);

      if (typeof isDefault === "boolean" && isDefault) {
        await prisma.dashboardWorkspace.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.dashboardWorkspace.update({
        where: { id: workspace.id },
        data: {
          name: typeof name === "string" && name.trim() ? name.trim() : undefined,
          isDefault: typeof isDefault === "boolean" ? isDefault : undefined,
        },
      });

      res.json(updated);
    } catch (error) {
      return formatError(error, res);
    }
  },
];

export const deleteWorkspace = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      await enforceDashboardAccess(userId);
      const { id } = req.params as { id: string };
      const workspace = await assertWorkspaceOwner(userId, id);
      await prisma.dashboardWorkspace.delete({ where: { id: workspace.id } });
      await ensureDefaultWorkspace(userId);
      res.json({ status: "ok" });
    } catch (error) {
      return formatError(error, res);
    }
  },
];

export const getWorkspaceLayout = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      await enforceDashboardAccess(userId);
      const { id } = req.params as { id: string };
      await assertWorkspaceOwner(userId, id);
      const layout = await prisma.dashboardLayout.findFirst({
        where: { workspaceId: id },
      });
      res.json(layout || { workspaceId: id, layout: DEFAULT_LAYOUT, presetKey: null });
    } catch (error) {
      return formatError(error, res);
    }
  },
];

export const saveWorkspaceLayout = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      await enforceDashboardAccess(userId);
      const { id } = req.params as { id: string };
      await assertWorkspaceOwner(userId, id);
      const { layout, presetKey } = req.body as { layout?: any; presetKey?: string | null };
      if (!layout || typeof layout !== "object") {
        return res.status(400).json({ error: "layout is required" });
      }
      const saved = await prisma.dashboardLayout.upsert({
        where: { workspaceId: id },
        update: { layout, presetKey: presetKey ?? null },
        create: { workspaceId: id, layout, presetKey: presetKey ?? null },
      });
      await ensureDashboardUsage(userId);
      res.json(saved);
    } catch (error) {
      return formatError(error, res);
    }
  },
];

export const applyPresetToWorkspace = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      await enforceDashboardAccess(userId);
      const { presetKey } = req.params as { presetKey: string };
      const { workspaceId } = req.body as { workspaceId?: string };

      if (!workspaceId) {
        return res.status(400).json({ error: "workspaceId is required" });
      }
      const preset = PRESET_LAYOUTS[presetKey];
      if (!preset) {
        return res.status(404).json({ error: "Unknown preset" });
      }
      await assertWorkspaceOwner(userId, workspaceId);
      const saved = await prisma.dashboardLayout.upsert({
        where: { workspaceId },
        update: { layout: preset, presetKey },
        create: { workspaceId, layout: preset, presetKey },
      });
      await ensureDashboardUsage(userId);
      res.json(saved);
    } catch (error) {
      return formatError(error, res);
    }
  },
];

export const getDashboardEntitlements = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      await ensureEntitlements(userId);
      const ent = await getEntitlements(userId);
      res.json(ent);
    } catch (error) {
      return formatError(error, res);
    }
  },
];

export const getHeroLayouts = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      await ensureEntitlements(userId);
      const record = await prisma.userHeroDashboardLayout.findUnique({
        where: { userId },
      });
      return res.json(
        record
          ? {
              layouts: record.layouts,
              activeName: record.activeName,
              updatedAt: record.updatedAt,
            }
          : { layouts: null, activeName: null, updatedAt: null }
      );
    } catch (error) {
      return formatError(error, res);
    }
  },
];

export const saveHeroLayouts = [
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user!.sub;
      await ensureEntitlements(userId);
      const { layouts, activeName } = req.body as { layouts?: any; activeName?: string | null };

      if (!layouts || typeof layouts !== "object") {
        return res.status(400).json({ error: "layouts is required" });
      }

      const saved = await prisma.userHeroDashboardLayout.upsert({
        where: { userId },
        update: {
          layouts,
          activeName: typeof activeName === "string" ? activeName : activeName === null ? null : undefined,
        },
        create: {
          userId,
          layouts,
          activeName: typeof activeName === "string" ? activeName : null,
        },
      });

      return res.json({
        layouts: saved.layouts,
        activeName: saved.activeName,
        updatedAt: saved.updatedAt,
      });
    } catch (error) {
      return formatError(error, res);
    }
  },
];
