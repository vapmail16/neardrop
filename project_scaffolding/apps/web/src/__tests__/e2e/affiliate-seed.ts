/**
 * Seeds API for Phase 6 Playwright: manifest → transitions → customer collection QR for affiliate collect.
 */
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

function randomHub(): string {
  const n = Math.floor(10 + Math.random() * 89);
  const d = Math.floor(Math.random() * 10);
  return `B${n} ${d}TH`.replace(/\s+/g, ' ');
}

export type AffiliateE2ESeed = {
  affiliateEmail: string;
  affiliatePassword: string;
  parcelId: string;
  /** Carrier ref in manifest CSV (shown on affiliate parcels table). */
  carrierRef: string;
  qrToken: string;
};

const MAX_SEED_ATTEMPTS = 12;

export async function seedAffiliateE2EScenario(): Promise<AffiliateE2ESeed> {
  const apiOrigin = (process.env.PLAYWRIGHT_API_ORIGIN ?? 'http://127.0.0.1:3010').replace(/\/$/, '');
  const password = 'E2eAffiliate!Phase6xx';
  let lastErr: Error | undefined;
  for (let attempt = 0; attempt < MAX_SEED_ATTEMPTS; attempt++) {
    try {
      return await seedAffiliateE2EScenarioOnce(apiOrigin, password, attempt);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error('seedAffiliateE2EScenario: exhausted retries');
}

async function seedAffiliateE2EScenarioOnce(
  apiOrigin: string,
  password: string,
  attempt: number,
): Promise<AffiliateE2ESeed> {
  const hub = randomHub();
  const ts = Date.now() + attempt;
  const affiliateEmail = `e2e-p6-aff-${ts}@example.test`;
  const carrierEmail = `e2e-p6-car-${ts}@example.test`;
  const customerEmail = `e2e-p6-cust-${ts}@example.test`;
  const carrierRef = `E2E-P6-${ts}`;

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
    email: affiliateEmail,
    password,
    firstName: 'E2E',
    lastName: 'Affiliate',
    role: 'affiliate',
    postcode: hub,
    addressLine1: '88 E2E Affiliate Street',
    maxDailyCapacity: 500,
  });

  await register({
    email: carrierEmail,
    password,
    firstName: 'E2E',
    lastName: 'Carrier',
    role: 'carrier',
  });

  await register({
    email: customerEmail,
    password,
    firstName: 'E2E',
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

  async function patch(status: string): Promise<void> {
    const r = await fetch(`${apiOrigin}/api/v1/parcels/${parcelId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: carCookie },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`patch ${status} ${r.status}: ${t.slice(0, 300)}`);
    }
  }

  await patch('in_transit');
  await patch('dropped_at_affiliate');
  await patch('ready_to_collect');

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

  const custLogin = await fetch(`${apiOrigin}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password }),
  });
  if (!custLogin.ok) {
    throw new Error(`customer login ${custLogin.status}`);
  }
  const custCookie = cookieHeaderFromResponse(custLogin);

  const qrRes = await fetch(`${apiOrigin}/api/v1/parcels/${parcelId}/collection-qr`, {
    headers: { cookie: custCookie },
  });
  const qrText = await qrRes.text();
  if (!qrRes.ok) {
    throw new Error(`collection-qr ${qrRes.status}: ${qrText.slice(0, 300)}`);
  }
  const qrJson = JSON.parse(qrText) as { data: { qrToken: string } };
  const qrToken = qrJson.data.qrToken;
  if (!qrToken) throw new Error('no qrToken');

  return { affiliateEmail, affiliatePassword: password, parcelId, carrierRef, qrToken };
}
