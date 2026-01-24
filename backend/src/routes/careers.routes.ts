import { Router } from "express";
import {
  getOpenJobs,
  getJobById,
  createJob,
  updateJob,
  applyToJob,
  getApplicationsForJob,
} from "../controllers/careers.controller";
import { uploadCV } from "../config/upload";

const router = Router();

// Public
router.get("/jobs", getOpenJobs);
router.get("/jobs/:id", getJobById);
router.post("/jobs/:id/apply", uploadCV.single("cv"), applyToJob);

// Admin (add requireAdmin when ready)
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.patch("/jobs/:id", updateJob);
router.get("/jobs/:id/applications", getApplicationsForJob);

export default router;
