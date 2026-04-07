import { randomInt } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeUkPostcode } from '@neardrop/shared';
import type { Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { loadMonorepoDotenv } from '../config/dotenv.js';
import { loadConfig, resetConfigCache } from '../config/index.js';
import { createKnex } from '../database/connection.js';
import { ACCESS_COOKIE } from '../plugins/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadMonorepoDotenv(path.join(__dirname, '..'));

const run = process.env['RUN_DB_INTEGRATION'] === '1' && !!process.env['DATABASE_URL'];
const jwt32 = '0123456789abcdef0123456789abcdef';
const UK_LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ';

function uniqueHubPostcode(seed: number): string {
  const l1 = UK_LETTERS[seed % UK_LETTERS.length];
  const l2 = UK_LETTERS[(seed * 7) % UK_LETTERS.length];
  const l3 = UK_LETTERS[(seed * 11) % UK_LETTERS.length];
  const l4 = UK_LETTERS[(seed * 13) % UK_LETTERS.length];
  return normalizeUkPostcode(
    `${l1}${l2}${randomInt(10, 100)} ${randomInt(0, 10)}${l3}${l4}`,
  );
}

function cookieHeaderFromSetCookie(setCookie: string | string[] | undefined): string {
  if (!setCookie) return '';
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  return parts
    .map((c) => c.split(';')[0]?.trim())
    .filter(Boolean)
    .join('; ');
}

function accessTokenFromSetCookie(setCookie: string | string[] | undefined): string {
  const header = cookieHeaderFromSetCookie(setCookie);
  const prefix = `${ACCESS_COOKIE}=`;
  const part = header.split(';').find((p) => p.trim().startsWith(prefix));
  if (!part) return '';
  return part.trim().slice(prefix.length);
}

async function cleanupScenario(knex: Knex, emails: string[]): Promise<void> {
  for (const email of emails) {
    const user = await knex<{ id: string; role: string }>('users')
      .whereRaw('LOWER(email) = LOWER(?)', [email])
      .first();
    if (!user) continue;
    if (user.role === 'carrier') {
      const c = await knex('carriers').where({ user_id: user.id }).first<{ id: string }>();
      if (c) {
        const pids = await knex('parcels').where({ carrier_id: c.id }).pluck<string>('id');
        if (pids.length) {
          await knex('affiliate_earnings').whereIn('parcel_id', pids).delete();
          await knex('notifications').whereIn('parcel_id', pids).delete();
          await knex('parcel_status_history').whereIn('parcel_id', pids).delete();
          await knex('parcels').where({ carrier_id: c.id }).delete();
        }
      }
    }
    await knex('users').where({ id: user.id }).delete();
  }
}

describe.runIf(run)('Phase 3 QR collection (PostgreSQL)', () => {
  beforeEach(() => {
    resetConfigCache();
    process.env['NODE_ENV'] = 'development';
    process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? jwt32;
    loadConfig();
  });

  afterEach(() => {
    resetConfigCache();
  });

  it(
    'customer issues collection JWT; affiliate completes via Bearer + body (mobile-style)',
    async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const ts = Date.now();
    const hub = uniqueHubPostcode(ts);
    const customerEmail = `p3-cust-${ts}@example.com`;
    const affiliateEmail = `p3-aff-${ts}@example.com`;
    const carrierEmail = `p3-car-${ts}@example.com`;
    const strong = 'GoodPassw0rd!';

    const custReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: customerEmail,
        password: strong,
        firstName: 'Cust',
        lastName: 'One',
        role: 'customer',
        postcode: hub,
      },
    });
    expect(custReg.statusCode).toBe(200);
    const custCookie = cookieHeaderFromSetCookie(custReg.headers['set-cookie']);

    const affReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: affiliateEmail,
        password: strong,
        firstName: 'Aff',
        lastName: 'One',
        role: 'affiliate',
        postcode: hub,
        addressLine1: '10 Hub Way',
      },
    });
    expect(affReg.statusCode).toBe(200);
    const affAccess = accessTokenFromSetCookie(affReg.headers['set-cookie']);
    expect(affAccess.length).toBeGreaterThan(20);

    const carReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: carrierEmail,
        password: strong,
        firstName: 'Car',
        lastName: 'One',
        role: 'carrier',
      },
    });
    expect(carReg.statusCode).toBe(200);
    const carCookie = cookieHeaderFromSetCookie(carReg.headers['set-cookie']);
    const affCookie = cookieHeaderFromSetCookie(affReg.headers['set-cookie']);

    const man = await app.inject({
      method: 'POST',
      url: '/api/v1/parcels/manifest',
      headers: { cookie: carCookie },
      payload: {
        format: 'json',
        rows: [
          {
            carrierRef: `M3-${ts}`,
            recipientName: 'Recipient',
            recipientPostcode: hub,
            recipientEmail: customerEmail,
          },
        ],
      },
    });
    expect(man.statusCode).toBe(200);
    const manBody = JSON.parse(man.body) as { data: { parcelIds: string[] } };
    const parcelId = manBody.data.parcelIds[0];
    expect(parcelId).toBeDefined();

    for (const step of [
      { cookie: carCookie, status: 'in_transit' as const },
      { cookie: affCookie, status: 'dropped_at_affiliate' as const },
      { cookie: carCookie, status: 'ready_to_collect' as const },
    ]) {
      const r = await app.inject({
        method: 'PATCH',
        url: `/api/v1/parcels/${parcelId}/status`,
        headers: { cookie: step.cookie },
        payload: { status: step.status },
      });
      expect(r.statusCode, `status step ${step.status}`).toBe(200);
    }

    const qrRes = await app.inject({
      method: 'GET',
      url: `/api/v1/parcels/${parcelId}/collection-qr`,
      headers: { cookie: custCookie },
    });
    expect(qrRes.statusCode).toBe(200);
    const qrBody = JSON.parse(qrRes.body) as {
      data: { qrToken: string; expiresAt: string };
    };
    expect(qrBody.data.qrToken.length).toBeGreaterThan(20);
    expect(qrBody.data.expiresAt).toMatch(/^\d{4}-/);

    const collect = await app.inject({
      method: 'POST',
      url: `/api/v1/parcels/${parcelId}/collect`,
      headers: { authorization: `Bearer ${affAccess}` },
      payload: { qrToken: qrBody.data.qrToken },
    });
    expect(collect.statusCode).toBe(200);
    const collectBody = JSON.parse(collect.body) as { data: { parcel: { status: string } } };
    expect(collectBody.data.parcel.status).toBe('collected');

    const earning = await knex('affiliate_earnings').where({ parcel_id: parcelId }).first();
    expect(earning).toBeDefined();
    expect(Number(earning!.amount)).toBe(0.5);

    const collectedNotif = await knex('notifications').where({
      parcel_id: parcelId,
      type: 'parcel_collected',
    });
    expect(collectedNotif.length).toBeGreaterThanOrEqual(1);

    const again = await app.inject({
      method: 'POST',
      url: `/api/v1/parcels/${parcelId}/collect`,
      headers: { authorization: `Bearer ${affAccess}` },
      payload: { qrToken: qrBody.data.qrToken },
    });
    expect(again.statusCode).toBe(409);

    await cleanupScenario(knex, [carrierEmail, affiliateEmail, customerEmail]);
    await app.close();
    await knex.destroy();
    },
    120_000,
  );
});
