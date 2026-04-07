import { expect, test } from '@playwright/test';
import { seedPhase8ExceptionScenario, type Phase8ExceptionSeed } from './phase8-exception-seed';
import { gotoLoginTypeAndExpectDashboard } from './submit-login-expect-dashboard';

let seed: Phase8ExceptionSeed;

test.beforeAll(async () => {
  seed = await seedPhase8ExceptionScenario();
}, 120_000);

test.describe('Phase 8 exception → ops recovery', () => {
  test.describe.configure({ mode: 'serial' });

  test('ops sees exception badge then ready after recovery PATCH', async ({ page }) => {
    test.setTimeout(180_000);

    await gotoLoginTypeAndExpectDashboard(
      page,
      '/login?portal=ops',
      /operations dashboard/i,
      60_000,
      { email: seed.opsEmail, password: seed.opsPassword },
    );

    await page.getByRole('link', { name: /^parcels$/i }).click();
    await page.waitForURL(/\/ops\/parcels/, { timeout: 30_000 });

    const row = page.getByTestId(`ops-parcel-row-${seed.parcelId}`);
    await expect(row.getByText(new RegExp(seed.carrierRef, 'i'))).toBeVisible({ timeout: 45_000 });
    await expect(row.locator('[data-testid="parcel-status-badge"][data-status="exception"]')).toBeVisible(
      { timeout: 30_000 },
    );

    const recovery = await page.request.patch(`/api/v1/parcels/${seed.parcelId}/status`, {
      data: JSON.stringify({ status: 'ready_to_collect' }),
      headers: { 'Content-Type': 'application/json', Cookie: seed.opsSessionCookie },
    });
    const recoveryBody = await recovery.text();
    expect(recovery.ok(), recoveryBody).toBe(true);

    await page.reload();
    await expect(
      page
        .getByTestId(`ops-parcel-row-${seed.parcelId}`)
        .locator('[data-testid="parcel-status-badge"][data-status="ready_to_collect"]'),
    ).toBeVisible({ timeout: 45_000 });
  });
});
