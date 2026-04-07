/**
 * Registers one E2E carrier via API and writes `playwright/.cache/carrier-e2e-creds.json`.
 * Must run from `test.beforeAll` (after Playwright webServer brings API up) — not from `globalSetup`,
 * which runs before webServer (ECONNREFUSED on cold runs).
 */
import fs from 'node:fs';
import path from 'node:path';

const CARRIER_PASSWORD = 'E2eCarrier!Pass99';

function credsPath(): string {
  return path.join(process.cwd(), 'playwright', '.cache', 'carrier-e2e-creds.json');
}

let inFlight: Promise<{ email: string; password: string }> | null = null;

export async function ensureCarrierE2ECreds(): Promise<{ email: string; password: string }> {
  if (!inFlight) {
    inFlight = (async () => {
      const apiOrigin = (process.env.PLAYWRIGHT_API_ORIGIN ?? 'http://127.0.0.1:3010').replace(
        /\/$/,
        '',
      );
      const email = `e2e-carrier-${Date.now()}@example.test`;

      const res = await fetch(`${apiOrigin}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: CARRIER_PASSWORD,
          firstName: 'E2E',
          lastName: 'Carrier',
          role: 'carrier',
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error(
          `ensureCarrierE2ECreds: register failed ${res.status}: ${text.slice(0, 500)}. Is API up?`,
        );
      }
      const json = JSON.parse(text) as { success?: boolean };
      if (!json || json.success !== true) {
        throw new Error(`ensureCarrierE2ECreds: success false: ${text.slice(0, 300)}`);
      }

      const creds = { email, password: CARRIER_PASSWORD };
      const dir = path.dirname(credsPath());
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(credsPath(), JSON.stringify(creds, null, 0), 'utf8');
      return creds;
    })();
  }
  return inFlight;
}
