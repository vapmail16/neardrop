/**
 * Phase 8 exception path: affiliate reports exception; ops recovers to ready_to_collect (API + UI verify).
 * Hub uses the same random outward pattern as other E2E seeds so the parcel is matched to this run's affiliate
 * (avoids shared-DB collisions on fixed London outward codes).
 * Retries: another affiliate in the DB can win the same normalised postcode; manifest match + affiliate GET must
 * agree with this run's affiliate user (TDD-hardened after intermittent 403 on exception PATCH).
 */
import { e2eRandomAffiliatePostcode } from './ops-seed';

function cookieHeaderFromResponse(res: Response): string {
  const anyHeaders = res.headers as unknown as { getSetCookie?: () => string[] };
  const parts = typeof anyHeaders.getSetCookie === 'function' ? anyHeaders.getSetCookie() : [];
  if (parts.length) {
    return parts
      .map((c) => c.split(';')[0]?.trim())
      .filter(Boolean)
      .join('; ');
  }
  const single = res.headers.get('set-cookie');
  if (!single) return '';
  return single
    .split(/,(?=[^;]+?=)/)
    .map((c) => c.split(';')[0]?.trim())
    .filter(Boolean)
    .join('; ');
}

export type Phase8ExceptionSeed = {
  opsEmail: string;
  opsPassword: string;
  /** API cookie header for ops (recovery PATCH may run outside browser cookie jar). */
  opsSessionCookie: string;
  affiliateEmail: string;
  affiliatePassword: string;
  parcelId: string;
  carrierRef: string;
};

const MAX_SEED_ATTEMPTS = 12;

export async function seedPhase8ExceptionScenario(): Promise<Phase8ExceptionSeed> {
  const apiOrigin = (process.env.PLAYWRIGHT_API_ORIGIN ?? 'http://127.0.0.1:3010').replace(/\/$/, '');
  const password = 'E2ePhase8!Exceptxx';
  let lastErr: Error | undefined;
  for (let attempt = 0; attempt < MAX_SEED_ATTEMPTS; attempt++) {
    try {
      return await seedPhase8ExceptionOnce(apiOrigin, password, attempt);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error('seedPhase8ExceptionScenario: exhausted retries');
}

async function seedPhase8ExceptionOnce(
  apiOrigin: string,
  password: string,
  attempt: number,
): Promise<Phase8ExceptionSeed> {
  const hub = e2eRandomAffiliatePostcode();
  const ts = Date.now() + attempt;
  const opsEmail = `e2e-p8-ex-ops-${ts}@example.test`;
  const affiliateEmail = `e2e-p8-ex-aff-${ts}@example.test`;
  const carrierEmail = `e2e-p8-ex-car-${ts}@example.test`;
  const customerEmail = `e2e-p8-ex-cust-${ts}@example.test`;
  const carrierRef = `P8-EX-${ts}`;

  async function register(payload: Record<string, unknown>): Promise<void> {
    const res = await fetch(`${apiOrigin}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`register failed ${res.status}: ${text.slice(0, 400)}`);
    }
  }

  await register({
    email: opsEmail,
    password,
    firstName: 'P8',
    lastName: 'Ops',
    role: 'ops',
  });

  await register({
    email: affiliateEmail,
    password,
    firstName: 'P8',
    lastName: 'AffiliateEx',
    role: 'affiliate',
    postcode: hub,
    addressLine1: '7 Exception Test Row',
    maxDailyCapacity: 500,
  });

  await register({
    email: carrierEmail,
    password,
    firstName: 'P8',
    lastName: 'Carrier',
    role: 'carrier',
  });

  await register({
    email: customerEmail,
    password,
    firstName: 'P8',
    lastName: 'Customer',
    role: 'customer',
    postcode: hub,
  });

  const carLogin = await fetch(`${apiOrigin}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: carrierEmail, password }),
  });
  if (!carLogin.ok) {
    throw new Error(`carrier login ${carLogin.status}`);
  }
  const carCookie = cookieHeaderFromResponse(carLogin);

  const csv =
    'carrier_ref,recipient_name,recipient_postcode,recipient_email\n' +
    `${carrierRef},Recipient,${hub},${customerEmail}`;
  const man = await fetch(`${apiOrigin}/api/v1/parcels/manifest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: carCookie },
    body: JSON.stringify({ format: 'csv', content: csv }),
  });
  const manText = await man.text();
  if (!man.ok) {
    throw new Error(`manifest ${man.status}: ${manText.slice(0, 400)}`);
  }
  const manJson = JSON.parse(manText) as {
    data: { parcelIds: string[]; matchedAffiliate: number; unmatched: number };
  };
  if (manJson.data.matchedAffiliate < 1 || manJson.data.unmatched > 0) {
    throw new Error(
      `manifest did not match this hub to an affiliate (matched ${manJson.data.matchedAffiliate}, unmatched ${manJson.data.unmatched})`,
    );
  }
  const parcelId = manJson.data.parcelIds[0];
  if (!parcelId) throw new Error('no parcel id from manifest');

  async function carrierPatch(status: string, body?: Record<string, unknown>): Promise<void> {
    const r = await fetch(`${apiOrigin}/api/v1/parcels/${parcelId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: carCookie },
      body: JSON.stringify({ status, ...body }),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`patch ${status} ${r.status}: ${t.slice(0, 300)}`);
    }
  }

  await carrierPatch('in_transit');
  await carrierPatch('dropped_at_affiliate');
  await carrierPatch('ready_to_collect');

  const affLogin = await fetch(`${apiOrigin}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: affiliateEmail, password }),
  });
  if (!affLogin.ok) {
    throw new Error(`affiliate login ${affLogin.status}`);
  }
  const affCookie = cookieHeaderFromResponse(affLogin);

  const affParcelPeek = await fetch(`${apiOrigin}/api/v1/parcels/${parcelId}`, {
    headers: { cookie: affCookie },
  });
  if (!affParcelPeek.ok) {
    const t = await affParcelPeek.text();
    throw new Error(
      `affiliate cannot access parcel ${parcelId} (postcode won by another affiliate?): ${affParcelPeek.status} ${t.slice(0, 200)}`,
    );
  }

  const exRes = await fetch(`${apiOrigin}/api/v1/parcels/${parcelId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', cookie: affCookie },
    body: JSON.stringify({
      status: 'exception',
      note: 'Damaged outer label (Phase 8 E2E)',
    }),
  });
  const exText = await exRes.text();
  if (!exRes.ok) {
    throw new Error(`exception patch ${exRes.status}: ${exText.slice(0, 400)}`);
  }

  const opsLogin = await fetch(`${apiOrigin}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: opsEmail, password }),
  });
  if (!opsLogin.ok) {
    throw new Error(`ops login ${opsLogin.status}`);
  }
  const opsSessionCookie = cookieHeaderFromResponse(opsLogin);
  if (!opsSessionCookie) {
    throw new Error('ops login: no session cookie');
  }

  return {
    opsEmail,
    opsPassword: password,
    opsSessionCookie,
    affiliateEmail,
    affiliatePassword: password,
    parcelId,
    carrierRef,
  };
}
