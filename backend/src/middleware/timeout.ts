import { Request, Response, NextFunction } from 'express';

// Default timeout in milliseconds (30 seconds)
const DEFAULT_TIMEOUT_MS = 30000;

// Paths that should have longer timeouts (e.g., file uploads, heavy processing)
const LONG_TIMEOUT_PATHS = [
  '/api/upload',
  '/api/admin/export',
  '/api/admin/import',
  '/api/courses/upload',
];

// Paths that should have shorter timeouts (quick endpoints)
const SHORT_TIMEOUT_PATHS = [
  '/health',
  '/db-check',
  '/api/auth/refresh',
];

/**
 * Request timeout middleware
 * Prevents requests from hanging indefinitely
 */
export const requestTimeout = (customTimeoutMs?: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Determine timeout based on path
    let timeoutMs = customTimeoutMs || DEFAULT_TIMEOUT_MS;

    // Check for long timeout paths
    if (LONG_TIMEOUT_PATHS.some(path => req.path.startsWith(path))) {
      timeoutMs = 120000; // 2 minutes for uploads/exports
    }

    // Check for short timeout paths
    if (SHORT_TIMEOUT_PATHS.some(path => req.path.startsWith(path))) {
      timeoutMs = 5000; // 5 seconds for health checks
    }

    // Skip timeout for streaming/SSE endpoints
    if (req.path.includes('/stream') || req.path.includes('/events')) {
      return next();
    }

    // Set up timeout
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.warn(`[TIMEOUT] Request timed out: ${req.method} ${req.path} after ${timeoutMs}ms`);
        res.status(503).json({
          error: 'Request timeout',
          message: 'The server took too long to respond. Please try again.',
        });
      }
    }, timeoutMs);

    // Clear timeout when response finishes
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
};

/**
 * Slow request logging middleware
 * Logs requests that take longer than threshold
 */
export const slowRequestLogger = (thresholdMs: number = 3000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > thresholdMs) {
        console.warn(`[SLOW] ${req.method} ${req.path} took ${duration}ms (threshold: ${thresholdMs}ms)`);
      }
    });

    next();
  };
};

/**
 * Keep-alive middleware for long-running requests
 * Sends periodic keep-alive signals to prevent proxy timeouts
 */
export const keepAlive = (intervalMs: number = 25000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only for specific long-running endpoints
    if (!req.path.includes('/export') && !req.path.includes('/import')) {
      return next();
    }

    const interval = setInterval(() => {
      if (!res.headersSent) {
        // Send a comment to keep connection alive (for SSE/streaming)
        // For regular requests, this won't do anything harmful
        try {
          res.write('');
        } catch {
          // Ignore write errors
        }
      }
    }, intervalMs);

    res.on('finish', () => clearInterval(interval));
    res.on('close', () => clearInterval(interval));

    next();
  };
};

export default requestTimeout;
