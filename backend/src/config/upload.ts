import path from "path";
import fs from "fs";
import multer from "multer";

// ✅ Use a writable, ephemeral directory on Vercel
// In production, process.cwd() is read-only, so we fall back to /tmp
const WRITABLE_BASE =
  process.env.UPLOAD_DIR || path.join("/tmp", "uploads", "cv");

/**
 * Ensure the directory exists.
 * This runs lazily during a request (not at module import),
 * avoiding crashes on serverless environments.
 */
function ensureDir(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.error("❌ Failed to create upload dir:", err);
    throw err;
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      ensureDir(WRITABLE_BASE);
      cb(null, WRITABLE_BASE);
    } catch (err) {
      cb(err as Error, WRITABLE_BASE);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type. Please upload PDF/DOC/DOCX only."));
};

export const uploadCV = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});

export { WRITABLE_BASE };
