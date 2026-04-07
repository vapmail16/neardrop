import { existsSync } from 'node:fs';
import { config as dotenvLoad } from 'dotenv';
import path from 'node:path';

/**
 * Load `.env` from monorepo root (directory containing `turbo.json`), then optional
 * `startDir/.env` with override so package-local vars win.
 *
 * Root `.env` uses `override: true` so committed-path keys in the file win over stale
 * exports in the developer shell (e.g. an old `DATABASE_URL`). CI/production typically
 * have no root `.env`, so real env vars are unchanged.
 */
export function loadMonorepoDotenv(startDir: string = process.cwd()): void {
  let dir = path.resolve(startDir);
  let rootEnvPath: string | undefined;
  for (let i = 0; i < 10; i++) {
    const turboPath = path.join(dir, 'turbo.json');
    const envPath = path.join(dir, '.env');
    if (existsSync(turboPath) && existsSync(envPath)) {
      rootEnvPath = envPath;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (rootEnvPath) dotenvLoad({ path: rootEnvPath, override: true });
  const localEnv = path.resolve(startDir, '.env');
  if (existsSync(localEnv)) dotenvLoad({ path: localEnv, override: true });
  if (!rootEnvPath && !existsSync(localEnv)) dotenvLoad();
}
