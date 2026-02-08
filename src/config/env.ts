import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('45m'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
});

export const env = envSchema.parse(process.env);
