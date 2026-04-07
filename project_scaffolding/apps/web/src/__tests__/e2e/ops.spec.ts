import { expect, test, type Page } from '@playwright/test';
import { seedOpsE2EScenario, type OpsE2ESeed } from './ops-seed';
import { gotoLoginTypeAndExpectDashboard } from './submit-login-expect-dashboard';

let seed: OpsE2ESeed;

/** Login uses `useSearchParams` inside Suspense — wait for real fields, not the "Loading..." shell. */
async function fillOpsLogin(page: Page, email: string, password: string) {
  await gotoLoginTypeAndExpectDashboard(
    page,
    '/login?portal=ops',
    /operations dashboard/i,
    60_000,
    { email, password },
  );
}

test.beforeAll(async () => {
  seed = await seedOpsE2EScenario();
}, 120_000);

test.describe('ops console (Phase 7)', () => {
  test.describe.configure({ mode: 'serial' });

  test('login, stats, map, reassign parcel', async ({ page }) => {
    test.setTimeout(180_000);

    await fillOpsLogin(page, seed.opsEmail, seed.opsPassword);
    await expect(page.getByTestId('ops-total-parcels')).toContainText(/[1-9]/, { timeout: 45_000 });
    await expect(page.getByTestId('ops-total-affiliates')).toContainText(/[12]/, { timeout: 45_000 });

    await page.getByRole('link', { name: /^map$/i }).click();
    await page.waitForURL(/\/ops\/map/, { timeout: 30_000 });
    await expect(page.getByTestId('ops-affiliate-map')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(seed.secondAffiliateLabel)).toBeVisible({ timeout: 30_000 });

    await page.getByRole('link', { name: /^parcels$/i }).click();
    await page.waitForURL(/\/ops\/parcels/, { timeout: 30_000 });
    await expect(page.getByTestId(`ops-parcel-row-${seed.parcelId}`)).toBeVisible({
      timeout: 45_000,
    });

    const select = page.getByTestId(`ops-assign-select-${seed.parcelId}`);
    await select.selectOption(seed.secondAffiliateId);
    await page.getByTestId(`ops-assign-apply-${seed.parcelId}`).click();
    await expect
      .poll(async () => select.inputValue(), { timeout: 45_000 })
      .toBe(seed.secondAffiliateId);
  });
});
