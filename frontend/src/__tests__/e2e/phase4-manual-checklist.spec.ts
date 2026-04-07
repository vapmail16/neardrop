/**
 * Maps to `docs/MANUAL_TEST_PHASE_4.md` §2 (browser checks), automated via Playwright.
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ensureCarrierE2ECreds } from './ensure-carrier-creds';
import {
  gotoLoginTypeAndExpectDashboard,
  typeLoginAndExpectCarrierOnlyAlert,
  typeLoginAndExpectDashboard,
} from './submit-login-expect-dashboard';

function loadCarrierCreds(): { email: string; password: string } {
  const p = path.join(process.cwd(), 'playwright', '.cache', 'carrier-e2e-creds.json');
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw) as { email: string; password: string };
}

test.beforeAll(async () => {
  await ensureCarrierE2ECreds();
}, 90_000);

async function fillCarrierPortalLogin(page: Page, email: string, password: string) {
  await gotoLoginTypeAndExpectDashboard(page, '/login', /dashboard/i, 30_000, { email, password });
}

function apiOrigin(): string {
  return (process.env.PLAYWRIGHT_API_ORIGIN ?? 'http://127.0.0.1:3010').replace(/\/$/, '');
}

test.describe('Phase 4 — MANUAL_TEST_PHASE_4 §2', () => {
  test('2.1 home — NearDrop heading and Register / Sign in / Carrier dashboard links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'NearDrop' })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: 'Register as carrier' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register as customer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register as affiliate' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in as carrier' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in as customer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in as affiliate' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Operations sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: /carrier dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /customer dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /affiliate dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /ops dashboard/i })).toBeVisible();
  });

  test.describe.serial('2.2–2.3 registration and clean-context login', () => {
    const password = 'Phase4Reg!Good99';
    let email: string;

    test('2.2 register carrier via UI', async ({ page }) => {
      email = `p4-ui-${Date.now()}@example.test`;
      await page.goto('/register');
      await page.getByLabel(/first name/i).fill('Phase');
      await page.getByLabel(/last name/i).fill('Four');
      await page.getByLabel(/^email$/i).fill(email);
      await page.getByLabel(/^password$/i).fill(password);
      await page.getByRole('button', { name: /register/i }).click();
      await page.waitForURL(/\/carrier\/dashboard/, { timeout: 30_000 });
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText('Carrier', { exact: true })).toBeVisible();
      await expect(page.getByTestId('carrier-nav-user')).toContainText(/phase/i);
    });

    test('2.3 new browser context — sign in and session survives reload', async ({ browser }) => {
      test.setTimeout(60_000);
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await typeLoginAndExpectDashboard(page, /dashboard/i, 30_000, { email, password });
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 15_000 });
      await page.reload();
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 30_000 });
      await context.close();
    });
  });

  test('2.4 unauthenticated visit to /carrier/dashboard redirects to login with returnTo', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/carrier/dashboard');
    await expect(page).toHaveURL(/\/login\?/, { timeout: 30_000 });
    expect(page.url()).toMatch(/returnTo=/);
    await context.close();
  });

  test('2.5–2.8 manifest upload, status badge, mark in transit, parcels filter', async ({ page }) => {
    test.setTimeout(120_000);
    const { email, password } = loadCarrierCreds();
    const carrierRef = `P4CHK-${Date.now()}`;
    const csv =
      'carrier_ref,recipient_name,recipient_postcode,recipient_email,estimated_drop_time\n' +
      `${carrierRef},Checklist User,SW1A1AA,,`;

    await fillCarrierPortalLogin(page, email, password);

    await page.getByRole('link', { name: /^manifests$/i }).click();
    await page.waitForURL(/\/carrier\/manifests/, { timeout: 30_000 });
    await page.getByTestId('manifest-csv-input').fill(csv);
    await page.getByRole('button', { name: /upload manifest/i }).click();
    await expect(page.getByTestId('manifest-summary')).toBeVisible({ timeout: 30_000 });

    await page.getByRole('link', { name: /^parcels$/i }).click();
    await page.waitForURL(/\/carrier\/parcels/, { timeout: 30_000 });
    await expect(page.getByText(carrierRef, { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByTestId('parcel-status-badge').filter({ hasText: /manifest received/i }).first(),
    ).toBeVisible();

    await page.getByRole('button', { name: /mark in transit/i }).first().click();
    await expect(
      page.getByTestId('parcel-status-badge').filter({ hasText: /in transit/i }).first(),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByTestId('parcel-status-filter').selectOption('in_transit');
    await expect(page.getByText(carrierRef, { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/\d+\s+parcel/i).first()).toBeVisible();
  });

  test('2.9 sign out then carrier route requires login again', async ({ page }) => {
    test.setTimeout(60_000);
    const { email, password } = loadCarrierCreds();
    await fillCarrierPortalLogin(page, email, password);
    await page.getByRole('button', { name: /sign out/i }).click();
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await page.goto('/carrier/dashboard');
    await expect(page).toHaveURL(/\/login\?/, { timeout: 15_000 });
  });

  test('2.10 non-carrier login shows carrier-only message', async ({ page }) => {
    test.setTimeout(60_000);
    const custEmail = `p4-cust-${Date.now()}@example.test`;
    const custPassword = 'CustomerOnly!99Good';
    const reg = await fetch(`${apiOrigin()}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: custEmail,
        password: custPassword,
        firstName: 'Cust',
        lastName: 'User',
        role: 'customer',
        postcode: 'SW1A1AA',
      }),
    });
    expect(reg.ok, await reg.text()).toBe(true);

    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await typeLoginAndExpectCarrierOnlyAlert(
      page,
      { email: custEmail, password: custPassword },
      15_000,
    );
    await expect(page).not.toHaveURL(/\/carrier\/dashboard/);
  });
});
