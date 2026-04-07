import { expect, test } from '@playwright/test';

/**
 * Runs first (filename order) so Next dev compiles `/` and `/login` before portal E2E — avoids cold-start clicks that never hit `/api/v1/auth/login`.
 */
test('warm routes: home and login shell', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/', { waitUntil: 'load', timeout: 60_000 });
  await expect(page.getByTestId('home-root')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('heading', { name: 'NearDrop' })).toBeVisible({ timeout: 30_000 });

  await page.goto('/login', { waitUntil: 'load', timeout: 60_000 });
  await expect(page.locator('#email')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#password')).toBeVisible({ timeout: 15_000 });
});
