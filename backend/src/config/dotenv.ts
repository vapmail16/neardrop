import { existsSync, readFileSync } from 'node:fs';
import { config as dotenvLoad } from 'dotenv';
import path from 'node:path';

/**
 * Load `.env` from the NearDrop API package root (directory whose `package.json`
 * has `"name": "@neardrop/api"`), then optional `startDir/.env` with override so
 * package-local vars win.
 *
 * API `.env` uses `override: true` so committed-path keys in the file win over stale
 * exports in the developer shell (e.g. an old `DATABASE_URL`). CI/production typically
 * have no `.env`, so real env vars are unchanged.
 */
export function loadMonorepoDotenv(startDir: string = process.cwd()): void {
  let dir = path.resolve(startDir);
  let rootEnvPath: string | undefined;
  for (let i = 0; i < 10; i++) {
    const pkgPath = path.join(dir, 'package.json');
    const envPath = path.join(dir, '.env');
    if (existsSync(pkgPath)) {
      try {
        const raw = readFileSync(pkgPath, 'utf8');
        const pkg = JSON.parse(raw) as { name?: string };
        if (pkg.name === '@neardrop/api' && existsSync(envPath)) {
          rootEnvPath = envPath;
          break;
        }
      } catch {
        /* ignore invalid package.json */
      }
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
