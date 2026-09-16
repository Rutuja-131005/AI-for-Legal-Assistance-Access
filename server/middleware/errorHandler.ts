import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

/**
 * Global Express Error Handling Middleware.
 * Catches all unhandled exceptions, logs them safely, and returns clean, structured error responses.
 */
export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // Log error stack safely on server
  console.error(`[API Error] ${req.method} ${req.url} (${statusCode}):`, err.stack || err);

  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(statusCode).json({
    error: message,
    ...(isProduction ? {} : { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
}
