import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  PORT: z.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  RATE_LIMIT_WINDOW_MS: z.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100),
  AI_RATE_LIMIT_MAX_REQUESTS: z.number().default(20),
  MAX_FILE_SIZE_BYTES: z.number().default(25 * 1024 * 1024), // 25MB
  ANALYSIS_CACHE_TTL_MS: z.number().default(60 * 60 * 1000), // 1 hour
});

const parsed = configSchema.safeParse({
  PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
  NODE_ENV: process.env.NODE_ENV,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ? Number(process.env.RATE_LIMIT_WINDOW_MS) : undefined,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS ? Number(process.env.RATE_LIMIT_MAX_REQUESTS) : undefined,
  AI_RATE_LIMIT_MAX_REQUESTS: process.env.AI_RATE_LIMIT_MAX_REQUESTS ? Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS) : undefined,
  MAX_FILE_SIZE_BYTES: process.env.MAX_FILE_SIZE_BYTES ? Number(process.env.MAX_FILE_SIZE_BYTES) : undefined,
  ANALYSIS_CACHE_TTL_MS: process.env.ANALYSIS_CACHE_TTL_MS ? Number(process.env.ANALYSIS_CACHE_TTL_MS) : undefined,
});

if (!parsed.success) {
  console.warn('Invalid environment configuration, using default safe fallbacks:', parsed.error.format());
}

export const config = parsed.success
  ? parsed.data
  : configSchema.parse({});
