import { Router } from "express";
import {
  listWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceLayout,
  saveWorkspaceLayout,
  applyPresetToWorkspace,
  getDashboardEntitlements,
  getHeroLayouts,
  saveHeroLayouts,
} from "../controllers/dashboard.controller";

const router = Router();

router.get("/workspaces", ...listWorkspaces);
router.post("/workspaces", ...createWorkspace);
router.patch("/workspaces/:id", ...updateWorkspace);
router.delete("/workspaces/:id", ...deleteWorkspace);
router.get("/workspaces/:id/layout", ...getWorkspaceLayout);
router.put("/workspaces/:id/layout", ...saveWorkspaceLayout);
router.post("/presets/:presetKey/apply", ...applyPresetToWorkspace);
router.get("/entitlements", ...getDashboardEntitlements);
router.get("/hero-layouts", ...getHeroLayouts);
router.put("/hero-layouts", ...saveHeroLayouts);

export default router;
