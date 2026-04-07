import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isLikelyUkPostcode, normalizeUkPostcode } from '@neardrop/shared';
import type { Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { loadMonorepoDotenv } from '../config/dotenv.js';
import { loadConfig, resetConfigCache } from '../config/index.js';
import { createKnex } from '../database/connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadMonorepoDotenv(path.join(__dirname, '..'));

const run = process.env['RUN_DB_INTEGRATION'] === '1' && !!process.env['DATABASE_URL'];
const jwt32 = '0123456789abcdef0123456789abcdef';

function uniqueTestPostcode(): string {
  for (let i = 0; i < 32; i++) {
    const b = randomBytes(6);
    const L1 = String.fromCharCode(65 + (b[0]! % 26));
    const d1 = String((b[1]! % 9) + 1);
    const L2 = String.fromCharCode(65 + (b[2]! % 26));
    const inwardD = String((b[3]! % 9) + 1);
    const L3 = String.fromCharCode(65 + (b[4]! % 26));
    const L4 = String.fromCharCode(65 + (b[5]! % 26));
    const raw = `${L1}${d1}${L2} ${inwardD}${L3}${L4}`;
    const n = normalizeUkPostcode(raw);
    if (isLikelyUkPostcode(n)) return n;
  }
  return normalizeUkPostcode('X9Y 1ZZ');
}

function cookieHeaderFromSetCookie(setCookie: string | string[] | undefined): string {
  if (!setCookie) return '';
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  return parts
    .map((c) => c.split(';')[0]?.trim())
    .filter(Boolean)
    .join('; ');
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

describe.runIf(run)('Ops routes (PostgreSQL)', () => {
  beforeEach(() => {
    resetConfigCache();
    process.env['NODE_ENV'] = 'development';
    process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? jwt32;
    loadConfig();
  });

  afterEach(() => {
    resetConfigCache();
  });

  it('GET /api/v1/ops/stats returns counts for ops role', async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const ts = Date.now();
    const hub = uniqueTestPostcode();
    const hubB = uniqueTestPostcode();
    const strong = 'GoodPassw0rd!';
    const opsEmail = `ops-stat-${ts}@example.com`;
    const affAEmail = `ops-stat-affa-${ts}@example.com`;
    const affBEmail = `ops-stat-affb-${ts}@example.com`;
    const carEmail = `ops-stat-car-${ts}@example.com`;
    const custEmail = `ops-stat-cust-${ts}@example.com`;

    const regOps = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: opsEmail,
        password: strong,
        firstName: 'Ops',
        lastName: 'User',
        role: 'ops',
      },
    });
    expect(regOps.statusCode).toBe(200);
    const opsCookie = cookieHeaderFromSetCookie(regOps.headers['set-cookie']);

    for (const [email, pc] of [
      [affAEmail, hub],
      [affBEmail, hubB],
    ] as const) {
      const r = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email,
          password: strong,
          firstName: 'Hub',
          lastName: 'Owner',
          role: 'affiliate',
          postcode: pc,
          addressLine1: '10 Test Street',
        },
      });
      expect(r.statusCode).toBe(200);
    }

    const carReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: carEmail,
        password: strong,
        firstName: 'C',
        lastName: 'R',
        role: 'carrier',
      },
    });
    expect(carReg.statusCode).toBe(200);
    const carCookie = cookieHeaderFromSetCookie(carReg.headers['set-cookie']);

    const custReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: custEmail,
        password: strong,
        firstName: 'C',
        lastName: 'U',
        role: 'customer',
        postcode: hub,
      },
    });
    expect(custReg.statusCode).toBe(200);

    const statsBefore = await app.inject({
      method: 'GET',
      url: '/api/v1/ops/stats',
      headers: { cookie: opsCookie },
    });
    expect(statsBefore.statusCode).toBe(200);
    const beforeBody = statsBefore.json() as { data: { totalParcels: number; totalAffiliates: number } };
    expect(beforeBody.data.totalAffiliates).toBeGreaterThanOrEqual(2);

    const csv =
      'carrier_ref,recipient_name,recipient_postcode,recipient_email\n' +
      `OPS-${ts},Recipient,${hub},${custEmail}`;
    const man = await app.inject({
      method: 'POST',
      url: '/api/v1/parcels/manifest',
      headers: { cookie: carCookie },
      payload: { format: 'csv', content: csv },
    });
    expect(man.statusCode).toBe(200);
    const manBody = man.json() as { data: { parcelIds: string[] } };
    const parcelId = manBody.data.parcelIds[0];
    expect(parcelId).toBeTruthy();

    const affBUser = await knex<{ id: string }>('users')
      .whereRaw('LOWER(email) = LOWER(?)', [affBEmail])
      .first();
    const affBRow = await knex<{ id: string }>('affiliates')
      .where({ user_id: affBUser!.id })
      .first();

    const reassign = await app.inject({
      method: 'PATCH',
      url: `/api/v1/ops/parcels/${parcelId}/affiliate`,
      headers: { cookie: opsCookie, 'content-type': 'application/json' },
      payload: { affiliateId: affBRow!.id },
    });
    expect(reassign.statusCode).toBe(200);
    const reBody = reassign.json() as { data: { parcel: { affiliateId: string | null } } };
    expect(reBody.data.parcel.affiliateId).toBe(affBRow!.id);

    const statsAfter = await app.inject({
      method: 'GET',
      url: '/api/v1/ops/stats',
      headers: { cookie: opsCookie },
    });
    expect(statsAfter.statusCode).toBe(200);
    const afterJson = statsAfter.json() as {
      data: { totalParcels: number; parcelCountsByStatus: Array<{ status: string; count: number }> };
    };
    expect(afterJson.data.totalParcels).toBeGreaterThanOrEqual(1);
    const manifestCount = afterJson.data.parcelCountsByStatus.find(
      (x) => x.status === 'manifest_received',
    );
    expect(manifestCount?.count).toBeGreaterThanOrEqual(1);

    const mapRes = await app.inject({
      method: 'GET',
      url: '/api/v1/ops/affiliates/map',
      headers: { cookie: opsCookie },
    });
    expect(mapRes.statusCode).toBe(200);
    const mapBody = mapRes.json() as { data: { items: Array<{ id: string; postcode: string }> } };
    expect(mapBody.data.items.length).toBeGreaterThanOrEqual(2);
    expect(mapBody.data.items.some((i) => i.id === affBRow!.id)).toBe(true);

    await cleanupScenario(knex, [opsEmail, affAEmail, affBEmail, carEmail, custEmail]);
    await app.close();
    await knex.destroy();
  });

  it('non-ops cannot access ops stats', async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const ts = Date.now();
    const strong = 'GoodPassw0rd!';
    const carEmail = `ops-deny-car-${ts}@example.com`;

    const carReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: carEmail,
        password: strong,
        firstName: 'C',
        lastName: 'R',
        role: 'carrier',
      },
    });
    expect(carReg.statusCode).toBe(200);
    const carCookie = cookieHeaderFromSetCookie(carReg.headers['set-cookie']);

    const stats = await app.inject({
      method: 'GET',
      url: '/api/v1/ops/stats',
      headers: { cookie: carCookie },
    });
    expect(stats.statusCode).toBe(403);

    await cleanupScenario(knex, [carEmail]);
    await app.close();
    await knex.destroy();
  });
});
