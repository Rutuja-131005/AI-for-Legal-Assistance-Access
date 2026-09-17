import cors from 'cors';
import helmet from 'helmet';

const defaultAllowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

/**
 * Configure Helmet security headers and CORS protection on Express app.
 */
export function setupSecurityMiddleware(app) {
  // Helmet HTTP security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'ws:', 'wss:', 'https://generativelanguage.googleapis.com'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  const envOrigins = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL;
  const allowedOrigins = envOrigins
    ? envOrigins.split(',').map(o => o.trim())
    : defaultAllowedOrigins;

  // Strict CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin SSR/Vite proxy)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS origin violation: Origin '${origin}' is not allowed.`));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );
}
