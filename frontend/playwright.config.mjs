import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname);

/**
 * E2E (Playwright) — ESM config (avoids Playwright loading `.ts` as CJS with `import.meta`).
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
      'rm -rf .next && npx concurrently --kill-others-on-fail -n api,web ' +
      '"cd ../backend && npm run dev" ' +
      '"npx wait-on -t 120000 http-get://127.0.0.1:3010/api/v1/health && npm run dev"',
    cwd: frontendRoot,
    env: {
      ...process.env,
      DISABLE_LOGIN_RATE_LIMIT: '1',
    },
    // Next rewrites `/api/*` to API (fast readiness). Login Suspense is handled in specs via `#email` + long timeouts.
    url: 'http://127.0.0.1:3020/api/v1/health',
    // Always use a fresh stack by default; opt-in reuse only when explicitly requested.
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === '1',
    timeout: 180_000,
  },
});
