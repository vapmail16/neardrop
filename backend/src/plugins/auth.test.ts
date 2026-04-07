import type { Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { loadConfig, resetConfigCache } from '../config/index.js';
import { TokenService } from '../services/token.service.js';
import { ACCESS_COOKIE } from './auth.js';

const jwt32 = '0123456789abcdef0123456789abcdef';

describe('authenticate decorator', () => {
  beforeEach(() => {
    resetConfigCache();
    process.env['NODE_ENV'] = 'test';
    process.env['JWT_SECRET'] = jwt32;
    delete process.env['DATABASE_URL'];
    loadConfig(undefined, { skipDotenv: true });
  });

  afterEach(() => {
    resetConfigCache();
  });

  it('sets authUser when Bearer access token is valid', async () => {
    const tokens = new TokenService({
      JWT_SECRET: jwt32,
      JWT_ACCESS_EXPIRES: '15m',
      JWT_REFRESH_EXPIRES: '7d',
    });
    const access = tokens.signAccess('33333333-3333-3333-3333-333333333333', 'ops');
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex, {
      tokenServiceForTests: tokens,
    });
    app.get('/t', { onRequest: [app.authenticate] }, async (request, reply) => {
      return reply.send({ uid: request.authUser?.id, role: request.authUser?.role });
    });
    const res = await app.inject({
      method: 'GET',
      url: '/t',
      headers: { authorization: `Bearer ${access}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { uid: string; role: string };
    expect(body.uid).toBe('33333333-3333-3333-3333-333333333333');
    expect(body.role).toBe('ops');
    await app.close();
  });

  it('accepts access token from cookie', async () => {
    const tokens = new TokenService({
      JWT_SECRET: jwt32,
      JWT_ACCESS_EXPIRES: '15m',
      JWT_REFRESH_EXPIRES: '7d',
    });
    const access = tokens.signAccess('44444444-4444-4444-4444-444444444444', 'customer');
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex, { tokenServiceForTests: tokens });
    app.get('/t', { onRequest: [app.authenticate] }, async (request, reply) => {
      return reply.send({ uid: request.authUser?.id });
    });
    const res = await app.inject({
      method: 'GET',
      url: '/t',
      cookies: { [ACCESS_COOKIE]: access },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).uid).toBe('44444444-4444-4444-4444-444444444444');
    await app.close();
  });

  it('returns 401 when token missing', async () => {
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex);
    app.get('/t', { onRequest: [app.authenticate] }, async (_request, reply) =>
      reply.send({ ok: true }),
    );
    const res = await app.inject({ method: 'GET', url: '/t' });
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});
