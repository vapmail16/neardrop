import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Monorepo root (contains turbo.json, .env). */
const repoRoot = path.resolve(__dirname, '../..');

/** GitHub Actions (and similar) need a fresh API+web stack; generic `CI=1` is too broad (e.g. editor sandboxes). */
const e2eFreshStackDefault = process.env.GITHUB_ACTIONS === 'true';

/**
 * E2E (Playwright) — ESM config (avoids Playwright loading .ts as CJS with `import.meta`).
 *
 * - Starts API then web via `concurrently` + `wait-on` (integration order).
 * - Carrier creds: `ensure-carrier-creds.ts` from `test.beforeAll` (runs after webServer; globalSetup cannot reach API).
 */
export default defineConfig({
  testDir: './src/__tests__/e2e',
  /** Vitest unit tests live alongside helpers (`*.test.ts`); Playwright only runs `*.spec.ts`. */
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3020',
    trace: 'on-first-retry',
    navigationTimeout: 60_000,
    actionTimeout: 30_000,
  },
  webServer: {
    command:
      'npx concurrently --kill-others-on-fail -n api,web ' +
      '"npm run dev --workspace=@neardrop/api" ' +
      '"npx wait-on -t 120000 http-get://127.0.0.1:3010/api/v1/health && npm run dev --workspace=@neardrop/web"',
    cwd: repoRoot,
    env: {
      ...process.env,
      DISABLE_LOGIN_RATE_LIMIT: '1',
    },
    // Next rewrites `/api/*` to API (fast readiness). Login Suspense is handled in specs via `#email` + long timeouts.
    url: 'http://127.0.0.1:3020/api/v1/health',
    // Default fresh stack on GitHub Actions only. Locally, reuse 3020 if live (avoids EADDRINUSE with dev).
    // Opt-in reuse on GA: PLAYWRIGHT_REUSE_SERVER=1. Force spawn locally: PLAYWRIGHT_FORCE_NEW_SERVER=1.
    reuseExistingServer: e2eFreshStackDefault
      ? process.env.PLAYWRIGHT_REUSE_SERVER === '1'
      : process.env.PLAYWRIGHT_FORCE_NEW_SERVER === '1'
        ? false
        : true,
    timeout: 180_000,
  },
});
