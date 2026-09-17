/**
 * Global Express Error Handling Middleware.
 * Catches all unhandled exceptions, logs them safely, and returns clean, structured error responses.
 */
export function errorHandler(err, req, res, _next) {
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
