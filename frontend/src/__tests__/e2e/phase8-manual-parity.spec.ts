/**
 * Automates Phase 8 manual guide §4 (login shells) and §5 (live API security headers)
 * while Playwright's webServer has started the API.
 */
import { expect, test } from '@playwright/test';

const apiOrigin = (process.env.PLAYWRIGHT_API_ORIGIN ?? 'http://127.0.0.1:3010').replace(/\/$/, '');

test.describe('Phase 8 manual parity', () => {
  test('GET /api/v1/health includes baseline security headers', async ({ request }) => {
    const res = await request.get(`${apiOrigin}/api/v1/health`);
    expect(res.ok(), await res.text()).toBe(true);
    const headers = res.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    const framed =
      Boolean(headers['x-frame-options']?.length) ||
      Boolean(headers['content-security-policy']?.includes('frame-ancestors'));
    expect(framed, JSON.stringify(headers, null, 2)).toBe(true);
  });

  for (const portal of ['ops', 'carrier', 'customer', 'affiliate'] as const) {
    test(`login shell loads for portal=${portal} (§4 smoke)`, async ({ page }) => {
      await page.goto(`/login?portal=${portal}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#email')).toBeVisible({ timeout: 30_000 });
    });
  }
});
