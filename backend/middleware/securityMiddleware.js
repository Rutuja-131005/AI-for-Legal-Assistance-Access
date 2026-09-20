/**
 * Comprehensive Security Middleware Suite
 * Includes Security Headers, Rate Limiter, and Prompt Injection Sanitizer
 */

// In-Memory Rate Limiter Store
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 150;

/**
 * Security HTTP Headers Middleware (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
 */
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com;"
  );
  next();
}

/**
 * IP Rate Limiting Middleware
 */
export function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const clientData = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    clientData.count += 1;
  }

  rateLimitStore.set(ip, clientData);

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - clientData.count));

  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests from this IP. Please try again after 15 minutes.'
    });
  }

  next();
}

/**
 * Sanitizes user input against prompt injection and malicious script vectors
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  // Patterns for prompt injection attacks
  const promptInjectionPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /system\s*:\s*/gi,
    /override\s+system\s+prompt/gi,
    /you\s+are\s+now\s+a\s+DAN/gi,
    /forget\s+all\s+rules/gi
  ];

  let sanitized = input;
  for (const pattern of promptInjectionPatterns) {
    sanitized = sanitized.replace(pattern, '[BLOCKED_INJECTION]');
  }

  // Basic HTML/XSS sanitization
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '');

  return sanitized.trim();
}

/**
 * Express middleware to sanitize body input parameters
 */
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
}
