/**
 * Seeds API for Phase 7 Playwright: ops user, two affiliates, manifest parcel matched to first hub.
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

/** Deterministic-enough outward + inward shape; validated in `ops-seed.postcode.test.ts`. */
export function e2eRandomAffiliatePostcode(): string {
  const n = Math.floor(10 + Math.random() * 89);
  const d = Math.floor(Math.random() * 10);
  return `B${n} ${d}TH`.replace(/\s+/g, ' ');
}

export type OpsE2ESeed = {
  opsEmail: string;
  opsPassword: string;
  parcelId: string;
  secondAffiliateId: string;
  secondAffiliateLabel: string;
};

export async function seedOpsE2EScenario(): Promise<OpsE2ESeed> {
  const apiOrigin = (process.env.PLAYWRIGHT_API_ORIGIN ?? 'http://127.0.0.1:3010').replace(/\/$/, '');
  const password = 'E2eOps!Phase7xx';
  const hub1 = e2eRandomAffiliatePostcode();
  let hub2 = e2eRandomAffiliatePostcode();
  while (hub2 === hub1) {
    hub2 = e2eRandomAffiliatePostcode();
  }
  const ts = Date.now();
  const opsEmail = `e2e-p7-ops-${ts}@example.test`;
  const aff1Email = `e2e-p7-a1-${ts}@example.test`;
  const aff2Email = `e2e-p7-a2-${ts}@example.test`;
  const carrierEmail = `e2e-p7-car-${ts}@example.test`;
  const customerEmail = `e2e-p7-cust-${ts}@example.test`;
  async function register(payload: Record<string, unknown>): Promise<Response> {
    const res = await fetch(`${apiOrigin}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`register failed ${res.status}: ${text.slice(0, 400)}`);
    }
    return res;
  }

  const opsRes = await register({
    email: opsEmail,
    password,
    firstName: 'E2E',
    lastName: 'Ops',
    role: 'ops',
  });
  const opsCookie = cookieHeaderFromResponse(opsRes);

  await register({
    email: aff1Email,
    password,
    firstName: 'E2P7One',
    lastName: String(ts),
    role: 'affiliate',
    postcode: hub1,
    addressLine1: '11 First Hub Street',
    maxDailyCapacity: 20,
  });

  await register({
    email: aff2Email,
    password,
    firstName: 'E2P7Two',
    lastName: String(ts),
    role: 'affiliate',
    postcode: hub2,
    addressLine1: '22 Second Hub Street',
    maxDailyCapacity: 20,
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
    postcode: hub1,
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
    `E2E-P7-${ts},Recipient,${hub1},${customerEmail}`;
  const man = await fetch(`${apiOrigin}/api/v1/parcels/manifest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: carCookie },
    body: JSON.stringify({ format: 'csv', content: csv }),
  });
  const manText = await man.text();
  if (!man.ok) {
    throw new Error(`manifest ${man.status}: ${manText.slice(0, 400)}`);
  }
  const manJson = JSON.parse(manText) as { data: { parcelIds: string[] } };
  const parcelId = manJson.data.parcelIds[0];
  if (!parcelId) throw new Error('no parcel id from manifest');

  const mapRes = await fetch(`${apiOrigin}/api/v1/ops/affiliates/map`, {
    headers: { cookie: opsCookie },
  });
  const mapText = await mapRes.text();
  if (!mapRes.ok) {
    throw new Error(`ops map ${mapRes.status}: ${mapText.slice(0, 400)}`);
  }
  const mapJson = JSON.parse(mapText) as {
    data: { items: Array<{ id: string; displayName: string }> };
  };
  const aff2 = mapJson.data.items.find((i) => i.displayName.includes('E2P7Two'));
  if (!aff2) throw new Error('second affiliate not found on ops map');

  return {
    opsEmail,
    opsPassword: password,
    parcelId,
    secondAffiliateId: aff2.id,
    secondAffiliateLabel: `E2P7Two ${ts}`,
  };
}
