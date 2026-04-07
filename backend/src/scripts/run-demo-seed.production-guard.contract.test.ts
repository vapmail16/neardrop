import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** `apps/api` (package root — `tsx src/scripts/...` cwd). */
const apiPackageRoot = path.join(__dirname, '../..');

describe('run-demo-seed production guard (Phase 8 manual §3.5)', () => {
  it('exits 1 when NODE_ENV=production and ALLOW_PRODUCTION_DEMO_SEED is not 1', () => {
    const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: 'production' };
    delete env['ALLOW_PRODUCTION_DEMO_SEED'];

    const res = spawnSync('npx', ['tsx', 'src/scripts/run-demo-seed.ts'], {
      cwd: apiPackageRoot,
      env,
      encoding: 'utf8',
    });

    expect(res.status, `${res.stderr}\n${res.stdout}`).toBe(1);
    expect(`${res.stderr}${res.stdout}`).toMatch(/refusing demo seed/i);
  });
});
