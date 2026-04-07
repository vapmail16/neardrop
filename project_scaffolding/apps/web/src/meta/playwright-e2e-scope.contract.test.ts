/**
 * Contract: Playwright must not load Vitest-only files in `src/__tests__/e2e` (e.g. `*.test.ts`),
 * which import `@neardrop/shared` without Playwright's bundler resolving package exports.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('playwright.config.mjs E2E scope', () => {
  it('limits discovery to *.spec.ts so Vitest postcode contract stays out of Playwright', () => {
    const cfgPath = path.join(process.cwd(), 'playwright.config.mjs');
    const raw = readFileSync(cfgPath, 'utf8');
    expect(raw).toMatch(/testMatch:\s*['"]\*\*\/\*\.spec\.ts['"]/);
  });

  it('keeps 00-smoke.spec.ts so home + login compile before portal E2E (filename order)', () => {
    const p = path.join(process.cwd(), 'src/__tests__/e2e/00-smoke.spec.ts');
    expect(existsSync(p)).toBe(true);
  });
});
