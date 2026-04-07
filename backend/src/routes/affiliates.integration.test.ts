import { randomBytes, randomInt } from 'node:crypto';
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

/** Avoid postcode collisions with leftover integration rows (findBestMatchForPostcode tie-break). */
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

describe.runIf(run)('Affiliate read routes (PostgreSQL)', () => {
  beforeEach(() => {
    resetConfigCache();
    process.env['NODE_ENV'] = 'development';
    process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? jwt32;
    loadConfig();
  });

  afterEach(() => {
    resetConfigCache();
  });

  it('customer GET /affiliates/match returns best affiliate for postcode', async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const ts = Date.now();
    const hub = uniqueTestPostcode();
    const customerEmail = `aff-match-cust-${ts}@example.com`;
    const affiliateEmail = `aff-match-aff-${ts}@example.com`;
    const strong = 'GoodPassw0rd!';

    const affReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: affiliateEmail,
        password: strong,
        firstName: 'Hub',
        lastName: 'Partner',
        role: 'affiliate',
        postcode: hub,
        addressLine1: '42 Match Street',
      },
    });
    expect(affReg.statusCode).toBe(200);
    const affUser = await knex<{ id: string }>('users')
      .whereRaw('LOWER(email) = LOWER(?)', [affiliateEmail])
      .first();
    const affRow = await knex<{ id: string }>('affiliates')
      .where({ user_id: affUser!.id })
      .first();
    expect(affRow?.id).toBeTruthy();

    const custReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: customerEmail,
        password: strong,
        firstName: 'Shop',
        lastName: 'Customer',
        role: 'customer',
        postcode: hub,
      },
    });
    expect(custReg.statusCode).toBe(200);
    const custCookie = cookieHeaderFromSetCookie(custReg.headers['set-cookie']);

    const match = await app.inject({
      method: 'GET',
      url: '/api/v1/affiliates/match',
      headers: { cookie: custCookie },
    });
    expect(match.statusCode).toBe(200);
    const body = match.json() as {
      success: boolean;
      data: { affiliate: { id: string; displayName: string; postcode: string } | null };
    };
    expect(body.success).toBe(true);
    expect(body.data.affiliate).not.toBeNull();
    expect(body.data.affiliate!.id).toBe(affRow!.id);
    expect(body.data.affiliate!.postcode).toBe(hub);
    expect(body.data.affiliate!.displayName).toContain('Hub');

    await cleanupScenario(knex, [customerEmail, affiliateEmail]);
    await app.close();
    await knex.destroy();
  });

  it('customer GET /affiliates/:id/summary succeeds when parcel links affiliate', async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const ts = Date.now();
    const hub = normalizeUkPostcode(`C${randomInt(10, 99)} ${randomInt(0, 9)}TH`);
    const customerEmail = `aff-sum-cust-${ts}@example.com`;
    const affiliateEmail = `aff-sum-aff-${ts}@example.com`;
    const carrierEmail = `aff-sum-car-${ts}@example.com`;
    const strong = 'GoodPassw0rd!';

    const affReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: affiliateEmail,
        password: strong,
        firstName: 'Point',
        lastName: 'Pickup',
        role: 'affiliate',
        postcode: hub,
        addressLine1: '1 Summary Lane',
      },
    });
    expect(affReg.statusCode).toBe(200);

    const custReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: customerEmail,
        password: strong,
        firstName: 'Buyer',
        lastName: 'User',
        role: 'customer',
        postcode: hub,
      },
    });
    expect(custReg.statusCode).toBe(200);
    const custCookie = cookieHeaderFromSetCookie(custReg.headers['set-cookie']);

    const carReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: carrierEmail,
        password: strong,
        firstName: 'Ship',
        lastName: 'Carrier',
        role: 'carrier',
      },
    });
    expect(carReg.statusCode).toBe(200);
    const carCookie = cookieHeaderFromSetCookie(carReg.headers['set-cookie']);

    const csv =
      'carrier_ref,recipient_name,recipient_postcode,recipient_email\n' +
      `REF-${ts},Recipient Name,${hub},${customerEmail}`;
    const man = await app.inject({
      method: 'POST',
      url: '/api/v1/parcels/manifest',
      headers: { cookie: carCookie },
      payload: { format: 'csv', content: csv },
    });
    expect(man.statusCode).toBe(200);
    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/parcels?page=1&limit=10',
      headers: { cookie: custCookie },
    });
    expect(list.statusCode).toBe(200);
    const listBody = list.json() as {
      data: { items: Array<{ affiliateId: string | null }> };
    };
    const affiliateId = listBody.data.items[0]?.affiliateId;
    expect(affiliateId).toBeTruthy();

    const sum = await app.inject({
      method: 'GET',
      url: `/api/v1/affiliates/${affiliateId}/summary`,
      headers: { cookie: custCookie },
    });
    expect(sum.statusCode).toBe(200);
    const sumBody = sum.json() as { data: { affiliate: { postcode: string } } };
    expect(sumBody.data.affiliate.postcode).toBe(hub);

    await cleanupScenario(knex, [customerEmail, affiliateEmail, carrierEmail]);
    await app.close();
    await knex.destroy();
  });

  it('affiliate GET /affiliates/me/earnings returns pending totals and recent rows', async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const ts = Date.now();
    const hub = normalizeUkPostcode(`D${randomInt(10, 99)} ${randomInt(0, 9)}TH`);
    const customerEmail = `aff-earn-cust-${ts}@example.com`;
    const affiliateEmail = `aff-earn-aff-${ts}@example.com`;
    const carrierEmail = `aff-earn-car-${ts}@example.com`;
    const strong = 'GoodPassw0rd!';

    const affReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: affiliateEmail,
        password: strong,
        firstName: 'Earn',
        lastName: 'Hub',
        role: 'affiliate',
        postcode: hub,
        addressLine1: '7 Earnings Road',
      },
    });
    expect(affReg.statusCode).toBe(200);
    const affCookie = cookieHeaderFromSetCookie(affReg.headers['set-cookie']);

    const custReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: customerEmail,
        password: strong,
        firstName: 'C',
        lastName: 'U',
        role: 'customer',
        postcode: hub,
      },
    });
    expect(custReg.statusCode).toBe(200);

    const carReg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: carrierEmail,
        password: strong,
        firstName: 'C',
        lastName: 'R',
        role: 'carrier',
      },
    });
    expect(carReg.statusCode).toBe(200);
    const carCookie = cookieHeaderFromSetCookie(carReg.headers['set-cookie']);

    const csv =
      'carrier_ref,recipient_name,recipient_postcode,recipient_email\n' +
      `ERN-${ts},Recipient,${hub},${customerEmail}`;
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

    const affUser = await knex<{ id: string }>('users')
      .whereRaw('LOWER(email) = LOWER(?)', [affiliateEmail])
      .first();
    const affRow = await knex<{ id: string }>('affiliates')
      .where({ user_id: affUser!.id })
      .first();
    await knex('affiliate_earnings').insert({
      affiliate_id: affRow!.id,
      parcel_id: parcelId,
      amount: 2.5,
      payout_status: 'pending',
    });

    const earn = await app.inject({
      method: 'GET',
      url: '/api/v1/affiliates/me/earnings',
      headers: { cookie: affCookie },
    });
    expect(earn.statusCode).toBe(200);
    const body = earn.json() as {
      success: boolean;
      data: { pendingTotal: string; paidTotal: string; pendingCount: number; recent: unknown[] };
    };
    expect(body.success).toBe(true);
    expect(Number.parseFloat(body.data.pendingTotal)).toBeGreaterThanOrEqual(2.5);
    expect(body.data.pendingCount).toBeGreaterThanOrEqual(1);
    expect(body.data.recent.length).toBeGreaterThanOrEqual(1);

    await cleanupScenario(knex, [customerEmail, affiliateEmail, carrierEmail]);
    await app.close();
    await knex.destroy();
  });
});
