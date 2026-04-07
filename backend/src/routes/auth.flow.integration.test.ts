import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { loadMonorepoDotenv } from '../config/dotenv.js';
import { loadConfig, resetConfigCache } from '../config/index.js';
import { createKnex } from '../database/connection.js';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../plugins/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadMonorepoDotenv(path.join(__dirname, '..'));

const run = process.env['RUN_DB_INTEGRATION'] === '1' && !!process.env['DATABASE_URL'];
const jwt32 = '0123456789abcdef0123456789abcdef';

function cookieHeaderFromSetCookie(setCookie: string | string[] | undefined): string {
  if (!setCookie) return '';
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  return parts
    .map((c) => c.split(';')[0]?.trim())
    .filter(Boolean)
    .join('; ');
}

describe.runIf(run)('auth flow (PostgreSQL)', () => {
  beforeEach(() => {
    resetConfigCache();
    process.env['NODE_ENV'] = 'development';
    process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? jwt32;
    loadConfig();
  });

  afterEach(() => {
    resetConfigCache();
  });

  it('register, /me with cookie, refresh, logout', async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const email = `auth-flow-${Date.now()}@example.com`;

    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email,
        password: 'GoodPassw0rd!',
        firstName: 'Flow',
        lastName: 'Test',
        role: 'carrier',
      },
    });
    expect(reg.statusCode).toBe(200);
    const regBody = JSON.parse(reg.body) as { data: { user: { email: string } } };
    expect(regBody.data.user.email).toBe(email.toLowerCase());

    const cookiePair = cookieHeaderFromSetCookie(reg.headers['set-cookie']);
    expect(cookiePair).toContain(ACCESS_COOKIE);
    expect(cookiePair).toContain(REFRESH_COOKIE);

    const me = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { cookie: cookiePair },
    });
    expect(me.statusCode).toBe(200);

    const opsPing = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/ops-ping',
      headers: { cookie: cookiePair },
    });
    expect(opsPing.statusCode).toBe(403);

    const refreshRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      headers: { cookie: cookiePair },
    });
    expect(refreshRes.statusCode).toBe(200);
    const newCookies = cookieHeaderFromSetCookie(refreshRes.headers['set-cookie']);

    const out = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: { cookie: newCookies },
    });
    expect(out.statusCode).toBe(200);

    await knex('users').where({ email: email.toLowerCase() }).delete();
    await app.close();
    await knex.destroy();
  });

  it('rejects duplicate registration', async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const email = `auth-dup-${Date.now()}@example.com`;
    const payload = {
      email,
      password: 'GoodPassw0rd!',
      firstName: 'A',
      lastName: 'B',
      role: 'customer' as const,
      postcode: 'SW1A1AA',
    };
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload,
    });
    expect(first.statusCode).toBe(200);
    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload,
    });
    expect(second.statusCode).toBe(409);

    await knex('users').where({ email: email.toLowerCase() }).delete();
    await app.close();
    await knex.destroy();
  });

  it('ops role receives 200 from /api/v1/auth/ops-ping', async () => {
    const knex = createKnex();
    const app = await createApp(knex);
    const email = `auth-ops-${Date.now()}@example.com`;

    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email,
        password: 'GoodPassw0rd!',
        firstName: 'Ops',
        lastName: 'User',
        role: 'ops',
      },
    });
    expect(reg.statusCode).toBe(200);

    const cookies = cookieHeaderFromSetCookie(reg.headers['set-cookie']);
    const ping = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/ops-ping',
      headers: { cookie: cookies },
    });
    expect(ping.statusCode).toBe(200);
    const body = JSON.parse(ping.body) as { success: boolean; data: { role: string } };
    expect(body.success).toBe(true);
    expect(body.data.role).toBe('ops');

    await knex('users').where({ email: email.toLowerCase() }).delete();
    await app.close();
    await knex.destroy();
  });
});
