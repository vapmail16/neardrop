import { envSchema, type Env } from './schema.js';
import { loadMonorepoDotenv } from './dotenv.js';

let cached: Env | undefined;

export type LoadConfigOptions = {
  /** When true, do not read `.env` files (unit tests with controlled process.env). */
  skipDotenv?: boolean;
};

/**
 * Load and validate environment. Call once at process startup.
 * DATABASE_URL is optional in tests that inject a mock DB; production/staging must set it.
 */
export function loadConfig(
  overrides?: Partial<Record<string, string | undefined>>,
  options?: LoadConfigOptions,
): Env {
  /** Preserve shell value: root `.env` uses dotenv `override: true` and would otherwise win over `VAR=1 cmd`. */
  const shellLoginRateLimit = process.env['DISABLE_LOGIN_RATE_LIMIT'];
  if (!options?.skipDotenv) loadMonorepoDotenv(process.cwd());
  const merged = { ...process.env, ...overrides };
  if (shellLoginRateLimit !== undefined) {
    merged['DISABLE_LOGIN_RATE_LIMIT'] = shellLoginRateLimit;
  }
  const parsed = envSchema.safeParse(merged);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    const msg = Object.entries(details)
      .map(([k, v]) => `${k}: ${(v ?? []).join(', ')}`)
      .join('; ');
    throw new Error(`Invalid environment: ${msg}`);
  }
  cached = parsed.data;
  return cached;
}

export function getConfig(): Env {
  if (!cached) {
    return loadConfig();
  }
  return cached;
}

/** Require DATABASE_URL (e.g. before migrations or DB-bound server start). */
export function getDatabaseUrl(): string {
  const url = getConfig().DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required for database operations');
  }
  return url;
}

export function resetConfigCache(): void {
  cached = undefined;
}
