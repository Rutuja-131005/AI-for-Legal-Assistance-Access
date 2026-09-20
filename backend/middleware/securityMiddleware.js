/**
 * Comprehensive Security & Threat Isolation Middleware Suite
 * Includes Security Headers, Rate Limiting, Scoped CORS, Bidi/Zero-Width Unicode Neutralization,
 * Adversarial Prompt Injection Sanitization, Magic Bytes Validation, and Filename Hardening.
 */

// In-Memory Rate Limiter Store
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100;

const ALLOWED_ORIGINS = [
  'https://ai-for-legal-assistance-access-seven.vercel.app',
  'https://ai-for-legal-assistance-access-g85u-pi.vercel.app',
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
 * Neutralizes zero-width characters and Bidi-override unicode tricks
 */
export function neutralizeUnicode(str) {
  if (typeof str !== 'string') return str;

  // Zero-width characters: U+200B, U+200C, U+200D, U+FEFF
  // Bidi override characters: U+202A to U+202E, U+2066 to U+2069
  return str
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
}

/**
 * Sanitizes dangerous filenames to prevent directory traversal and script injection
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return 'document.txt';

  return filename
    .replace(/\0/g, '') // Null byte neutralization
    .replace(/\.\.[\/\\]/g, '') // Path traversal stripping
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_'); // Safe alphanumeric filename
}

/**
 * Validates uploaded binary buffers against known magic bytes
 */
export function validateMagicBytes(buffer, filename = '') {
  if (!buffer || !Buffer.isBuffer(buffer)) return true;

  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));

  if (ext === '.pdf') {
    // PDF Magic Bytes: %PDF- (0x25 0x50 0x44 0x46)
    return buffer.length >= 4 && buffer.slice(0, 4).toString('ascii') === '%PDF';
  }

  if (ext === '.docx') {
    // PK Zip header: PK\x03\x04 (0x50 0x4B 0x03 0x04)
    return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  }

  return true;
}

/**
 * Sanitizes user input against prompt injection, instruction tokens, and malicious script vectors
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  let sanitized = neutralizeUnicode(input);

  // Adversarial jailbreak and token pattern detectors
  const promptInjectionPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /system\s*:\s*/gi,
    /override\s+system\s+prompt/gi,
    /you\s+are\s+now\s+a\s+DAN/gi,
    /forget\s+all\s+rules/gi,
    /reveal\s+system\s+prompt/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi
  ];

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
 * Express middleware to sanitize body input parameters and neutralize bidi unicode
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

/**
 * Input Payload & File Size Validation Middleware
 */
export function validateInputPayload(req, res, next) {
  if (req.body && req.body.text && typeof req.body.text === 'string') {
    if (req.body.text.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Document exceeds maximum allowed text size limit of 5MB.' });
    }
  }
  next();
}
