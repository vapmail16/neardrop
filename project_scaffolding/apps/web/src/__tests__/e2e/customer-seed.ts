/**
 * Seeds API state for Phase 5 Playwright (carrier manifest + transitions → customer QR).
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

export type CustomerE2ESeed = {
  customerEmail: string;
  customerPassword: string;
  parcelId: string;
};

export async function seedCustomerE2EScenario(): Promise<CustomerE2ESeed> {
  const apiOrigin = (process.env.PLAYWRIGHT_API_ORIGIN ?? 'http://127.0.0.1:3010').replace(/\/$/, '');
  const password = 'E2eCustomer!Phase5xx';
  const hub = randomHub();
  const ts = Date.now();
  const affiliateEmail = `e2e-p5-aff-${ts}@example.test`;
  const carrierEmail = `e2e-p5-car-${ts}@example.test`;
  const customerEmail = `e2e-p5-cust-${ts}@example.test`;

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
    addressLine1: '55 E2E Pickup Street',
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
    `E2E-P5-${ts},Recipient,${hub},${customerEmail}`;
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

  return { customerEmail, customerPassword: password, parcelId };
}
