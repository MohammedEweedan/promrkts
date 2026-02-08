import express from "express";
import * as Sentry from "@sentry/node";
import axios from "axios";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import { requestTimeout, slowRequestLogger } from "./middleware/timeout";
import apiRoutes from "./routes/index";
import prisma, { getPrismaHealth } from "./config/prisma";
import db from "./config/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const STATIC_ALLOWED_ORIGINS = [
  "https://promrkts.com",
  "https://www.promrkts.com",
  "https://api.promrkts.com",
  "http://localhost:3000",
  "http://localhost:3003",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3003",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8081",
  "http://172.20.10.7:8081",
  "http://192.168.1.124:8081",
  // DigitalOcean droplet
  "http://157.245.221.241",
  "https://157.245.221.241",
  "http://157.245.221.241:8080",
  "https://157.245.221.241:8080",
];

// Also allow origins from CORS_ORIGINS env var (comma-separated)
if (process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS.split(',').forEach(origin => {
    const trimmed = origin.trim();
    if (trimmed) STATIC_ALLOWED_ORIGINS.push(trimmed);
  });
}

const normalizeOrigin = (origin?: string) => (origin || "").replace(/\/$/, "");

const isChatSubdomain = (origin: string) =>
  /^https?:\/\/chat(?:-[\w-]+)?\.promrkts\.ai(?::\d+)?$/i.test(origin) ||
  /^https?:\/\/chat\.localhost(?::\d+)?$/i.test(origin);

const ALLOWED_ORIGINS = new Set(
  STATIC_ALLOWED_ORIGINS.filter(Boolean).map((value) => normalizeOrigin(value as string))
);

const isVercelPreview = (origin: string) =>
  /^https:\/\/promrkts(-[\w]+)?\.vercel\.app$/i.test(origin) ||
  /^https:\/\/promrkts-[\w]+-promrkts\.vercel\.app$/i.test(origin);

const isAllowedOrigin = (origin?: string) => {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  if (ALLOWED_ORIGINS.has(normalized)) return true;
  if (isVercelPreview(normalized)) return true;
  return false;
};

const applyCorsOrigin = (res: express.Response, origin?: string): boolean => {
  if (!origin) return false;
  if (!isAllowedOrigin(origin)) return false;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  res.setHeader("Access-Control-Allow-Origin", normalized);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  return true;
};

/* ---------------- Sentry ---------------- */
Sentry.init({
  dsn: "https://6930c42c9841e3c477e1a8be0c1b7518@o4510122251517952.ingest.de.sentry.io/4510122267705424",
  sendDefaultPii: true,
});

/* ---------------- Express baseline ---------------- */
app.set("etag", false);
app.set("trust proxy", 1); // behind Vercel proxy

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting for production security
if (process.env.NODE_ENV !== "test" && process.env.DISABLE_RATE_LIMIT !== "1") {
  // General API rate limit: 300 requests per 15 minutes
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    skip: (req) => {
      // Skip limiting for monitoring/analytics, spin wheel, health checks, and preflight
      if (req.method === "OPTIONS") return true;
      if (req.path === "/monitoring" || req.path === "/analytics/track" || req.path === "/spin") return true;
      if (req.path === "/health" || req.path === "/db-check") return true;
      return false;
    },
  });

  // Stricter limit for auth endpoints: 10 requests per 15 minutes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many authentication attempts, please try again later." },
  });

  // Stricter limit for purchase endpoints: 20 requests per 15 minutes
  const purchaseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many purchase attempts, please try again later." },
  });

  // Apply auth limiter to sensitive endpoints
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
  app.use("/api/auth/reset-password", authLimiter);

  // Apply purchase limiter
  app.use("/api/purchase", purchaseLimiter);

  // Apply general limiter to all other routes
  app.use(generalLimiter);
}

/* ---------------- CORS (permissive to unblock) ---------------- */
// Reflect any Origin and allow credentials; tighten later if needed
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    console.error(`[CORS] Rejected origin: "${origin}". Allowed origins:`, Array.from(ALLOWED_ORIGINS));
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  res.setHeader("Vary", "Origin");
  next();
});

app.use(cors(corsOptions));
// Catch-all preflight handler without path pattern (Express 5 path-to-regexp doesn't accept "*")
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    // Mirror CORS success for generic preflight
    const origin = req.headers.origin as string | undefined;
    applyCorsOrigin(res, origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,X-Requested-With,sentry-trace,baggage,x-client"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }
  return next();
});

/* ---------------- Request timeout and slow request logging ---------------- */
app.use(requestTimeout());
app.use(slowRequestLogger(3000)); // Log requests taking > 3 seconds

/* ---------------- Body/cookies/logs ---------------- */
app.use(
  express.json({
    limit: "20mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* ---------------- Static uploads ---------------- */
// Only serve static files locally, not on Vercel
if (!process.env.VERCEL) {
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  app.use(
    "/api/uploads",
    (req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(uploadsDir)
  );
}

/* ---------------- Sentry tunnel (CORS + raw) ---------------- */
// Handle preflight explicitly for the tunnel (some adblockers get picky)
app.options("/monitoring", cors(corsOptions));
app.use(
  "/monitoring",
  express.raw({ type: "*/*", limit: "1mb" }),
  async (req, res) => {
    try {
      const dsn = process.env.SENTRY_DSN || "";
      const match = dsn.match(/^https?:\/\/([^@]+)@([^/]+)\/([^\s]+)$/);
      const publicKey = match ? match[1].split(":")[0] : "6930c42c9841e3c477e1a8be0c1b7518";
      const host = match ? match[2] : "o4510122251517952.ingest.de.sentry.io";
      const projectId = match ? match[3] : "4510122267705424";
      const url = `https://${host}/api/${projectId}/envelope/?sentry_version=7&sentry_key=${publicKey}`;

      await axios.post(url, req.body, {
        headers: { "Content-Type": "application/x-sentry-envelope" },
        timeout: 5000,
        maxBodyLength: Infinity,
      });

      // Mirror CORS success for the tunnel too
      applyCorsOrigin(res, req.headers.origin as string | undefined);
      return res.status(200).end("OK");
    } catch {
      // Don’t break the app if monitoring fails
      return res.status(204).end();
    }
  }
);

/* ---------------- Routes ---------------- */
app.use("/api", apiRoutes);

try {
  const botApp = (require as any)("../bot");
  app.use("/bot", botApp);
} catch {
  // Bot not available in production builds; ignore
}

app.get("/health", async (_req, res) => {
  const prismaHealth = getPrismaHealth();
  const pgHealth = db.getHealth();
  
  const isHealthy = prismaHealth.isConnected || pgHealth.isConnected;
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    database: {
      prisma: prismaHealth,
      pg: pgHealth,
    },
  });
});

app.get("/db-check", async (_req, res) => {
  try {
    const start = Date.now();
    const nowRows = await prisma.$queryRaw<any[]>`SELECT now() as now`;
    const dbRows = await prisma.$queryRaw<any[]>`SELECT current_database() as db`;
    const latency = Date.now() - start;
    
    res.json({
      ok: true,
      now: nowRows?.[0]?.now ?? null,
      database: dbRows?.[0]?.db ?? null,
      latencyMs: latency,
      prismaHealth: getPrismaHealth(),
      pgHealth: db.getHealth(),
    });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e?.message || "db error",
      prismaHealth: getPrismaHealth(),
      pgHealth: db.getHealth(),
    });
  }
});

app.get("/routes-map", (_req, res) => {
  const list: Array<{ method: string; path: string }> = [];
  const addLayer = (stack: any, prefix = "") => {
    for (const layer of stack || []) {
      if (layer.route && layer.route.path) {
        const path = prefix + layer.route.path;
        const methods = Object.keys(layer.route.methods || {}).filter(m => layer.route.methods[m]);
        for (const m of methods) list.push({ method: m.toUpperCase(), path });
      } else if (layer.name === "router" && layer.handle && layer.handle.stack) {
        const m = layer.regexp && layer.regexp.fast_star ? "*" : undefined;
        const p = (layer.regexp && (layer.regexp.fast_slash ? "/" : "")) || "";
        addLayer(layer.handle.stack, prefix + (layer.path || layer.regexp?.path || ""));
      }
    }
  };
  // @ts-ignore
  addLayer((app as any)._router?.stack || []);
  res.json(list.sort((a, b) => a.path.localeCompare(b.path)));
});

app.get("/admin/bi/suggestions", async (_req, res) => {
  const suggestions: string[] = [];
  suggestions.push("Track daily active users, conversion to purchase, and course completion rates.");
  suggestions.push("Identify top-performing courses by revenue and completion.");
  suggestions.push("Surface churn risk: users inactive for 7/14 days with active subscriptions.");
  suggestions.push("Leaderboard insights: XP growth vs engagement; trigger nudges for low-activity cohorts.");
  suggestions.push("Upsell candidates: learners who passed 3 quizzes in advanced topics in last 7 days.");
  res.json({ suggestions });
});


/* ---------------- Errors ---------------- */
app.use(errorHandler);

/* ---------------- Local only: listen ---------------- */
let server: any;
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`VERCEL: ${process.env.VERCEL}`);
  });
  // Tune timeouts for local/dev
  // @ts-ignore
  server.keepAliveTimeout = 65000;
  // @ts-ignore
  server.headersTimeout = 66000;
  // @ts-ignore
  server.requestTimeout = 0;
  
  server.on('error', (err: any) => {
    console.error('Server error:', err);
  });
} else {
  console.log('Server not started. VERCEL:', process.env.VERCEL, 'NODE_ENV:', process.env.NODE_ENV);
}

/* ---------------- Graceful shutdown ---------------- */
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down...`);
  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error("Error disconnecting Prisma:", e);
  } finally {
    if (server) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
    setTimeout(() => process.exit(0), 5000).unref();
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
