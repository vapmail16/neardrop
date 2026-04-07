import { expect, test } from '@playwright/test';
import { seedAffiliateE2EScenario, type AffiliateE2ESeed } from './affiliate-seed';
import { gotoLoginTypeAndExpectDashboard } from './submit-login-expect-dashboard';

let seed: AffiliateE2ESeed;

test.beforeAll(async () => {
  seed = await seedAffiliateE2EScenario();
}, 120_000);

test.describe('affiliate portal (Phase 6)', () => {
  test('login, parcels list, scan handover, earnings', async ({ page }) => {
    test.setTimeout(180_000);
    await gotoLoginTypeAndExpectDashboard(
      page,
      '/login?portal=affiliate',
      /affiliate dashboard/i,
      30_000,
      { email: seed.affiliateEmail, password: seed.affiliatePassword },
    );

    const parcelsList = page.waitForResponse(
      (r) =>
        r.request().method() === 'GET' &&
        r.url().includes('/api/v1/parcels') &&
        r.ok(),
      { timeout: 45_000 },
    );
    await page.getByRole('link', { name: /^parcels$/i }).click();
    await page.waitForURL(/\/affiliate\/parcels/, { timeout: 15_000 });
    await parcelsList;
    const row = page.getByTestId(`affiliate-parcel-row-${seed.parcelId}`);
    await expect(row).toBeVisible({ timeout: 45_000 });
    await expect(row).toContainText(seed.carrierRef);

    await page.getByRole('link', { name: /scan handover/i }).click();
    await page.waitForURL(/\/affiliate\/scan/, { timeout: 15_000 });
    await page.getByLabel(/parcel id/i).fill(seed.parcelId);
    await page.getByTestId('affiliate-scan-token').fill(seed.qrToken);
    await page.getByRole('button', { name: /complete collection/i }).click();
    await expect(page.getByRole('status')).toContainText(/collected/i, { timeout: 25_000 });

    await page.getByRole('link', { name: /^earnings$/i }).click();
    await page.waitForURL(/\/affiliate\/earnings/, { timeout: 15_000 });
    await expect(page.getByTestId('earn-pending-total')).toContainText('0.5', { timeout: 20_000 });
  });
});
