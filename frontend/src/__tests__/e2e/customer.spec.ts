import { expect, test } from '@playwright/test';
import { seedCustomerE2EScenario } from './customer-seed';
import { gotoLoginTypeAndExpectDashboard } from './submit-login-expect-dashboard';

let seed: Awaited<ReturnType<typeof seedCustomerE2EScenario>>;

test.beforeAll(async () => {
  seed = await seedCustomerE2EScenario();
}, 120_000);

test.describe('customer portal', () => {
  test('login, parcels, QR and affiliate map on detail', async ({ page }) => {
    test.setTimeout(120_000);
    await gotoLoginTypeAndExpectDashboard(
      page,
      '/login?portal=customer',
      /your dashboard/i,
      30_000,
      { email: seed.customerEmail, password: seed.customerPassword },
    );

    await page.getByRole('link', { name: /^parcels$/i }).click();
    await page.waitForURL(/\/customer\/parcels/, { timeout: 15_000 });
    await expect(page.getByText(/your parcels/i)).toBeVisible();

    await page.getByRole('link', { name: /E2E-P5-/i }).click();
    await page.waitForURL(new RegExp(`/customer/parcels/${seed.parcelId}`), { timeout: 15_000 });
    await expect(page.getByTestId('customer-qr-display')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('affiliate-map')).toBeVisible({ timeout: 15_000 });
  });
});
