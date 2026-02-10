// backend/src/routes/uploads.routes.ts
import { Router } from "express";
import multer from "multer";
import { put } from "@vercel/blob";
import path from "path";
import fs from "fs";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Check if Vercel Blob is configured
const hasVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

// Ensure uploads directory exists for local storage
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!hasVercelBlob && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function saveFile(file: Express.Multer.File, folder: string): Promise<string> {
  const safeName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  
  if (hasVercelBlob) {
    const key = `${folder}/${safeName}`;
    const { url } = await put(key, file.buffer, {
      access: "public",
      contentType: file.mimetype,
      addRandomSuffix: false,
    });
    return url;
  } else {
    // Local storage fallback
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(folderPath, safeName);
    fs.writeFileSync(filePath, file.buffer);
    return `/api/uploads/${folder}/${safeName}`;
  }
}

// Helper: resolve file path, strip query params, set headers
function serveUploadedFile(filePath: string, filename: string, res: any) {
  // Strip query params like ?signed=1 from filename
  const cleanName = filename.split("?")[0];
  const cleanPath = filePath.split("?")[0];

  if (!fs.existsSync(cleanPath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const ext = path.extname(cleanName).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  const contentType = mimeMap[ext] || "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  if (ext === ".pdf") {
    res.setHeader("Content-Disposition", `inline; filename="${cleanName}"`);
  }
  res.sendFile(cleanPath);
}

// Serve uploaded files (two-segment path: /uploads/:folder/:filename)
router.get("/uploads/:folder/:filename", (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(uploadsDir, folder, filename.split("?")[0]);
    serveUploadedFile(filePath, filename, res);
  } catch (e: any) {
    console.error("File serve failed:", e);
    return res.status(500).json({ error: "Failed to serve file" });
  }
});

// Serve uploaded files (single-segment path: /uploads/:filename) — backward compat
router.get("/uploads/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const cleanName = filename.split("?")[0];
    // Try root uploads dir first, then uploads/uploads subfolder
    let filePath = path.join(uploadsDir, cleanName);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(uploadsDir, "uploads", cleanName);
    }
    serveUploadedFile(filePath, filename, res);
  } catch (e: any) {
    console.error("File serve failed:", e);
    return res.status(500).json({ error: "Failed to serve file" });
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });
    const url = await saveFile(req.file, "uploads");
    return res.json({ ok: true, url });
  } catch (e: any) {
    console.error("upload failed:", e);
    return res.status(500).json({ ok: false, error: "upload_failed" });
  }
});

// Image upload endpoint for mobile app (posts, avatars, charts)
router.post("/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });
    const type = req.body.type || 'post';
    const folder = type === 'avatar' ? 'avatars' : type === 'chart' ? 'charts' : 'posts';
    const url = await saveFile(req.file, folder);
    return res.json({ ok: true, url });
  } catch (e: any) {
    console.error("image upload failed:", e);
    return res.status(500).json({ ok: false, error: "upload_failed" });
  }
});

export default router;
