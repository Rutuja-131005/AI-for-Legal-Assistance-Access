/**
 * Comprehensive Security Middleware Suite
 * Includes Security Headers, Rate Limiter, Scoped CORS, Input Sanitization & File Limits
 */

// In-Memory Rate Limiter Store
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100;

const ALLOWED_ORIGINS = [
  'https://ai-for-legal-assistance-access-seven.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001'
];

/**
 * Scoped CORS Middleware
 */
export function scopedCors(req, res, next) {
  const origin = req.headers.origin;

  if (!origin) {
    // Same-origin or non-browser requests
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

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
 * IP Rate Limiting Middleware (100 req per 15 min)
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
 * Input Payload & File Size Validation Middleware
 */
export function validateInputPayload(req, res, next) {
  if (req.body && req.body.text && typeof req.body.text === 'string') {
    // 5MB text length check (~5 million chars)
    if (req.body.text.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Document exceeds maximum allowed text size limit of 5MB.' });
    }
  }
  next();
}

/**
 * Sanitizes user input against prompt injection and malicious script vectors
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

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
