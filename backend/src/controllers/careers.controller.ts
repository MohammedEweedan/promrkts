import { Request, Response } from "express";
import prisma from "../config/prisma";

// List open jobs (active + not past closing date)
export const getOpenJobs = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const take = Math.min(parseInt(String(req.query.limit || 24), 10) || 24, 100);

    const jobs = await prisma.job.findMany({
      where: { isActive: true, closingDate: { gte: now } },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        expectedPay: true,
        closingDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ data: jobs });
  } catch (e) {
    return res.status(200).json({ data: [] });
  }
};

// Get single job
export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        expectedPay: true,
        closingDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json({ data: job ? [job] : [] });
  } catch (e) {
    return res.status(200).json({ data: [] });
  }
};

// Create job (admin; add your auth middleware in routes)
export const createJob = async (req: Request, res: Response) => {
  try {
    const {
      title = "",
      description = "",
      requirements,
      expectedPay,
      closingDate,
      isActive = true,
    } = req.body || {};

    if (!title || !description || !closingDate) {
      return res.status(200).json({ data: [], error: "Missing required fields" });
    }

    // Accept requirements as array OR comma-separated string; store as JSON array
    let reqs: string[] | null = null;
    if (Array.isArray(requirements)) {
      reqs = requirements.map((x: any) => String(x)).filter(Boolean);
    } else if (typeof requirements === "string") {
      reqs = requirements
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }

    const created = await prisma.job.create({
      data: {
        title: String(title),
        description: String(description),
        requirements: reqs ? (reqs as any) : undefined,
        expectedPay: expectedPay ? String(expectedPay) : null,
        closingDate: new Date(closingDate),
        isActive: Boolean(isActive),
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        expectedPay: true,
        closingDate: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ data: [created] });
  } catch (e) {
    return res.status(200).json({ data: [], error: "Failed to create job" });
  }
};

// Update job (admin)
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      requirements,
      expectedPay,
      closingDate,
      isActive,
    } = req.body || {};

    let reqs: string[] | undefined;
    if (requirements !== undefined) {
      if (Array.isArray(requirements)) {
        reqs = requirements.map((x: any) => String(x)).filter(Boolean);
      } else if (typeof requirements === "string") {
        reqs = requirements
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      } else {
        reqs = [];
      }
    }

    const updated = await prisma.job.update({
      where: { id: String(id) },
      data: {
        title: title !== undefined ? String(title) : undefined,
        description: description !== undefined ? String(description) : undefined,
        requirements: reqs !== undefined ? (reqs as any) : undefined,
        expectedPay: expectedPay !== undefined ? String(expectedPay) : undefined,
        closingDate: closingDate !== undefined ? new Date(closingDate) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        expectedPay: true,
        closingDate: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ data: [updated] });
  } catch (e) {
    return res.status(200).json({ data: [], error: "Failed to update job" });
  }
};

// Apply to a job (with CV upload handled by Multer)
export const applyToJob = async (req: Request, res: Response) => {
  try {
    const { id: jobId } = req.params;
    const { name = "", email = "", phone, coverLetter } = req.body || {};
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!jobId || !name || !email || !file) {
      return res.status(200).json({ data: [], error: "Missing fields (jobId, name, email, cv)" });
    }

    // Ensure job exists & open
    const job = await prisma.job.findUnique({
      where: { id: String(jobId) },
      select: { id: true, isActive: true, closingDate: true },
    });

    if (!job) return res.status(200).json({ data: [], error: "Job not found" });
    if (!job.isActive || new Date(job.closingDate) < new Date()) {
      return res.status(200).json({ data: [], error: "Applications are closed" });
    }

    // Save application
    const created = await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        name: String(name),
        email: String(email),
        phone: phone ? String(phone) : null,
        coverLetter: coverLetter ? String(coverLetter) : null,
        cvUrl: `/uploads/cv/${file.filename}`, // public path if you serve /uploads statically
      },
      select: {
        id: true,
        jobId: true,
        name: true,
        email: true,
        phone: true,
        cvUrl: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ data: [created] });
  } catch (e) {
    return res.status(200).json({ data: [], error: "Failed to submit application" });
  }
};

// (Admin) List applications for a job
export const getApplicationsForJob = async (req: Request, res: Response) => {
  try {
    const { id: jobId } = req.params;
    const apps = await prisma.jobApplication.findMany({
      where: { jobId: String(jobId) },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        coverLetter: true,
        cvUrl: true,
        status: true,
        createdAt: true,
      },
    });
    return res.status(200).json({ data: apps });
  } catch (e) {
    return res.status(200).json({ data: [] });
  }
};
