import { expect, type Page } from '@playwright/test';

const dashboardPath = /\/(carrier|customer|affiliate|ops)\/dashboard(\/|$)/;

export type LoginCredentials = { email: string; password: string };

/** Controlled React inputs: `pressSequentially` fires input events per keystroke so state matches DOM (fill alone can race and leave value=""). */
async function typeCredentials(page: Page, creds: LoginCredentials): Promise<void> {
  await page.locator('#email').click();
  await page.locator('#email').pressSequentially(creds.email, { delay: 15 });
  await page.locator('#password').click();
  await page.locator('#password').pressSequentially(creds.password, { delay: 15 });
  await expect(page.locator('#email')).toHaveValue(creds.email, { timeout: 15_000 });
  await expect(page.locator('#password')).toHaveValue(creds.password, { timeout: 15_000 });
}

/**
 * Navigates to the login path (relative to baseURL), types credentials, submits, waits for dashboard URL, then asserts heading.
 */
export async function gotoLoginTypeAndExpectDashboard(
  page: Page,
  loginPath: string,
  heading: RegExp,
  timeoutMs: number,
  creds: LoginCredentials,
): Promise<void> {
  await page.goto(loginPath, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.locator('#email')).toBeVisible({ timeout: 90_000 });
  await typeCredentials(page, creds);
  const loginWait = page.waitForResponse(
    (r) => r.url().includes('/api/v1/auth/login') && r.request().method() === 'POST',
    { timeout: timeoutMs },
  );
  await page.getByRole('button', { name: /login/i }).click();
  const resp = await loginWait;
  try {
    await page.waitForURL(dashboardPath, { timeout: timeoutMs });
  } catch {
    const formAlert = page.locator('main form p[role="alert"]');
    const hasAlert = await formAlert.isVisible().catch(() => false);
    const msg = hasAlert ? await formAlert.innerText() : '(no form alert)';
    let body = '';
    try {
      body = (await resp.text()).slice(0, 400);
    } catch {
      body = '(no body)';
    }
    throw new Error(
      `Login: no dashboard (url=${page.url()}, POST status=${resp.status()}). Form alert: ${msg}. Body: ${body}`,
    );
  }
  await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 15_000 });
}

/** When already on `/login` with fields empty: type creds, submit, expect dashboard. */
export async function typeLoginAndExpectDashboard(
  page: Page,
  heading: RegExp,
  timeoutMs: number,
  creds: LoginCredentials,
): Promise<void> {
  await expect(page.locator('#email')).toBeVisible({ timeout: 90_000 });
  await typeCredentials(page, creds);
  const loginWait = page.waitForResponse(
    (r) => r.url().includes('/api/v1/auth/login') && r.request().method() === 'POST',
    { timeout: timeoutMs },
  );
  await page.getByRole('button', { name: /login/i }).click();
  const resp = await loginWait;
  try {
    await page.waitForURL(dashboardPath, { timeout: timeoutMs });
  } catch {
    const formAlert = page.locator('main form p[role="alert"]');
    const hasAlert = await formAlert.isVisible().catch(() => false);
    const msg = hasAlert ? await formAlert.innerText() : '(no form alert)';
    let body = '';
    try {
      body = (await resp.text()).slice(0, 400);
    } catch {
      body = '(no body)';
    }
    throw new Error(
      `Login: no dashboard (url=${page.url()}, POST status=${resp.status()}). Form alert: ${msg}. Body: ${body}`,
    );
  }
  await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 15_000 });
}

/** Carrier portal: customer credentials should surface the role error after submit. */
export async function typeLoginAndExpectCarrierOnlyAlert(
  page: Page,
  creds: LoginCredentials,
  timeoutMs: number,
): Promise<void> {
  await expect(page.locator('#email')).toBeVisible({ timeout: 90_000 });
  await typeCredentials(page, creds);
  const loginWait = page.waitForResponse(
    (r) => r.url().includes('/api/v1/auth/login') && r.request().method() === 'POST',
    { timeout: timeoutMs },
  );
  await page.getByRole('button', { name: /login/i }).click();
  await loginWait;
  await expect(page.locator('main form p[role="alert"]')).toContainText(/carrier accounts only/i, {
    timeout: timeoutMs,
  });
}
