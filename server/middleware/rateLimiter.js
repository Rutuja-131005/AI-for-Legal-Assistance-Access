import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter: max 100 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  statusCode: 429,
});

/**
 * AI-heavy endpoints limiter (Gemini calls): max 25 requests per 15 minutes per IP.
 */
export const aiOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Please wait a few minutes before trying again.' },
  statusCode: 429,
});

/**
 * Upload endpoints limiter: max 10 requests per 15 minutes per IP.
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Document upload limit exceeded. Maximum 10 uploads per 15 minutes allowed.' },
  statusCode: 429,
});
