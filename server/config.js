import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Validated Environment Variables Schema using Zod
 */
export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
  CACHE_TTL_MS: z.coerce.number().default(3600000), // 1 hour
  MAX_PAYLOAD_SIZE_MB: z.coerce.number().default(10),
});

export const config = envSchema.parse(process.env);
