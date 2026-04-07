import { expect, test } from '@playwright/test';
import { ensureCarrierE2ECreds } from './ensure-carrier-creds';
import { gotoLoginTypeAndExpectDashboard } from './submit-login-expect-dashboard';

let carrier: { email: string; password: string };

test.beforeAll(async () => {
  carrier = await ensureCarrierE2ECreds();
}, 90_000);

/**
 * Phase 4 exit gate — full carrier journey (MASTER_GUIDELINES: E2E for critical journeys).
 * Depends on webServer + `ensureCarrierE2ECreds` in beforeAll.
 */
test.describe('carrier portal', () => {
  test('login, upload CSV manifest, view parcels, mark in transit', async ({ page }) => {
    test.setTimeout(120_000);
    const { email, password } = carrier;
    const carrierRef = `E2E-${Date.now()}`;
    const csv =
      'carrier_ref,recipient_name,recipient_postcode,recipient_email,estimated_drop_time\n' +
      `${carrierRef},E2E User,SW1A1AA,,`;

    await gotoLoginTypeAndExpectDashboard(page, '/login', /dashboard/i, 30_000, { email, password });

    await page.getByRole('link', { name: /^manifests$/i }).click();
    await page.waitForURL(/\/carrier\/manifests/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /manifests/i })).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('manifest-csv-input').fill(csv);
    await page.getByRole('button', { name: /upload manifest/i }).click();
    await expect(page.getByTestId('manifest-summary')).toBeVisible({ timeout: 30_000 });

    await page.getByRole('link', { name: /^parcels$/i }).click();
    await page.waitForURL(/\/carrier\/parcels/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /parcels/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(carrierRef, { exact: true })).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: /mark in transit/i }).first().click();
    await expect(
      page.getByTestId('parcel-status-badge').filter({ hasText: /in transit/i }).first(),
    ).toBeVisible({ timeout: 30_000 });
  });
});
