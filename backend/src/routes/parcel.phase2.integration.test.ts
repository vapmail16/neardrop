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
          await knex('parcel_status_history').whereIn('parcel_id', pids).delete();
          await knex('parcels').where({ carrier_id: c.id }).delete();
        }
      }
    }
    await knex('users').where({ id: user.id }).delete();
  }
}

describe.runIf(run)('Phase 2 parcel flow (PostgreSQL)', () => {
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
    'manifest, postcode match, role-scoped list, state transitions, history',
    async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const ts = Date.now();
    /** Unique hub per run (parallel integration files + seeded DB must not collide). */
    const hub = uniqueHubPostcode(ts);
    const customerEmail = `p2-cust-${ts}@example.com`;
    const affiliateEmail = `p2-aff-${ts}@example.com`;
    const carrierEmail = `p2-car-${ts}@example.com`;
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
    const affCookie = cookieHeaderFromSetCookie(affReg.headers['set-cookie']);

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

    const man = await app.inject({
      method: 'POST',
      url: '/api/v1/parcels/manifest',
      headers: { cookie: carCookie },
      payload: {
        format: 'json',
        rows: [
          {
            carrierRef: `M-${ts}`,
            recipientName: 'Recipient',
            recipientPostcode: hub,
            recipientEmail: customerEmail,
          },
        ],
      },
    });
    expect(man.statusCode).toBe(200);
    const manBody = JSON.parse(man.body) as {
      data: { total: number; matchedAffiliate: number; unmatched: number; parcelIds: string[] };
    };
    expect(manBody.data.total).toBe(1);
    expect(manBody.data.matchedAffiliate).toBe(1);
    expect(manBody.data.unmatched).toBe(0);
    const parcelId = manBody.data.parcelIds[0];
    expect(parcelId).toBeDefined();

    const listCar = await app.inject({
      method: 'GET',
      url: '/api/v1/parcels',
      headers: { cookie: carCookie },
    });
    expect(listCar.statusCode).toBe(200);
    const listCarBody = JSON.parse(listCar.body) as { data: { items: { id: string }[]; total: number } };
    expect(listCarBody.data.total).toBe(1);
    expect(listCarBody.data.items[0]?.id).toBe(parcelId);

    const listAff = await app.inject({
      method: 'GET',
      url: '/api/v1/parcels',
      headers: { cookie: affCookie },
    });
    expect(listAff.statusCode).toBe(200);
    const listAffBody = JSON.parse(listAff.body) as { data: { total: number } };
    expect(listAffBody.data.total).toBe(1);

    const getCust = await app.inject({
      method: 'GET',
      url: `/api/v1/parcels/${parcelId}`,
      headers: { cookie: custCookie },
    });
    expect(getCust.statusCode).toBe(200);

    const t1 = await app.inject({
      method: 'PATCH',
      url: `/api/v1/parcels/${parcelId}/status`,
      headers: { cookie: carCookie },
      payload: { status: 'in_transit' },
    });
    expect(t1.statusCode).toBe(200);

    const t2 = await app.inject({
      method: 'PATCH',
      url: `/api/v1/parcels/${parcelId}/status`,
      headers: { cookie: affCookie },
      payload: { status: 'dropped_at_affiliate' },
    });
    expect(t2.statusCode).toBe(200);

    const t3 = await app.inject({
      method: 'PATCH',
      url: `/api/v1/parcels/${parcelId}/status`,
      headers: { cookie: carCookie },
      payload: { status: 'ready_to_collect' },
    });
    expect(t3.statusCode).toBe(200);

    const qrRes = await app.inject({
      method: 'GET',
      url: `/api/v1/parcels/${parcelId}/collection-qr`,
      headers: { cookie: custCookie },
    });
    expect(qrRes.statusCode).toBe(200);
    const qrBody = JSON.parse(qrRes.body) as { data: { qrToken: string } };
    const affAccess = accessTokenFromSetCookie(affReg.headers['set-cookie']);
    expect(affAccess.length).toBeGreaterThan(10);

    const t4 = await app.inject({
      method: 'POST',
      url: `/api/v1/parcels/${parcelId}/collect`,
      headers: { authorization: `Bearer ${affAccess}` },
      payload: { qrToken: qrBody.data.qrToken },
    });
    expect(t4.statusCode).toBe(200);

    const hist = await knex('parcel_status_history').where({ parcel_id: parcelId }).orderBy('created_at', 'asc');
    expect(hist.length).toBeGreaterThanOrEqual(5);

    const bad = await app.inject({
      method: 'PATCH',
      url: `/api/v1/parcels/${parcelId}/status`,
      headers: { cookie: carCookie },
      payload: { status: 'in_transit' },
    });
    expect(bad.statusCode).toBe(422);

    await cleanupScenario(knex, [carrierEmail, affiliateEmail, customerEmail]);
    await app.close();
    await knex.destroy();
    },
    120_000,
  );
});
