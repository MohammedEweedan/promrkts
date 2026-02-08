import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

// Error types for better categorization
interface ErrorWithCode extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export const errorHandler = (
  err: ErrorWithCode,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default status code
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  // Log error details
  const errorLog = {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.sub || (req as any).user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
  };

  if (isServerError) {
    console.error('[ERROR]', JSON.stringify(errorLog, null, 2));
  } else {
    console.warn('[WARN]', errorLog.message, errorLog.path);
  }

  // Report to Sentry for server errors
  if (isServerError) {
    Sentry.withScope((scope) => {
      scope.setTag('path', req.path);
      scope.setTag('method', req.method);
      scope.setUser({ id: errorLog.userId });
      scope.setExtra('requestBody', req.body);
      scope.setExtra('query', req.query);
      Sentry.captureException(err);
    });
  }

  // Determine error message for response
  let message = 'Something went wrong!';
  if (!isServerError || process.env.NODE_ENV === 'development') {
    message = err.message;
  }

  // Handle specific error types
  if (err.code === 'P2002') {
    // Prisma unique constraint violation
    return res.status(409).json({
      message: 'A record with this value already exists',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  if (err.code === 'P2025') {
    // Prisma record not found
    return res.status(404).json({
      message: 'Record not found',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Invalid or expired token',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Generic response
  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async error wrapper to catch promise rejections
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class for operational errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
