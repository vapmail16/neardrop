import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3010),
    HOST: z.string().default('0.0.0.0'),
    /** Optional only when `NODE_ENV=test` (unit tests with mocks). */
    DATABASE_URL: z.string().url().optional(),
    JWT_SECRET: z
      .string()
      .min(32, 'JWT_SECRET must be at least 32 characters (set a strong secret before Phase 1)'),
    /** Passed to jsonwebtoken `expiresIn` for access JWT (default 15 minutes). */
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    /** Passed to jsonwebtoken `expiresIn` for refresh JWT (default 7 days). */
    JWT_REFRESH_EXPIRES: z.string().default('7d'),
    /** Collection QR JWT lifetime (default 7 days per MVP plan § Phase 3). */
    JWT_QR_COLLECTION_EXPIRES: z.string().default('7d'),
    /** bcrypt cost factor (minimum 12 per MVP security checklist). */
    BCRYPT_ROUNDS: z.coerce.number().int().min(12).max(14).default(12),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    CORS_ORIGIN: z.string().default('http://localhost:3020'),
    /**
     * Set to `1` to disable POST /auth/login rate limiting (local Playwright E2E runs many sign-ins).
     * Never enable in production.
     */
    DISABLE_LOGIN_RATE_LIMIT: z.enum(['0', '1']).default('0'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'test' && !data.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'DATABASE_URL is required',
        path: ['DATABASE_URL'],
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
