import type { Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '@neardrop/shared';
import { createApp } from '../app.js';
import { loadConfig, resetConfigCache } from '../config/index.js';
import { TokenService } from '../services/token.service.js';

const jwt32 = '0123456789abcdef0123456789abcdef';

describe('RBAC — GET /api/v1/auth/ops-ping', () => {
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

  it('returns 403 when authenticated as customer', async () => {
    const tokens = new TokenService({
      JWT_SECRET: jwt32,
      JWT_ACCESS_EXPIRES: '15m',
      JWT_REFRESH_EXPIRES: '7d',
    });
    const access = tokens.signAccess('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'customer');
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex, { tokenServiceForTests: tokens });
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/ops-ping',
      headers: { authorization: `Bearer ${access}` },
    });
    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body) as { success: false; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ErrorCodes.FORBIDDEN);
    await app.close();
  });

  it('returns 200 when authenticated as ops', async () => {
    const tokens = new TokenService({
      JWT_SECRET: jwt32,
      JWT_ACCESS_EXPIRES: '15m',
      JWT_REFRESH_EXPIRES: '7d',
    });
    const access = tokens.signAccess('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ops');
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex, { tokenServiceForTests: tokens });
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/ops-ping',
      headers: { authorization: `Bearer ${access}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { success: boolean; data: { role: string } };
    expect(body.success).toBe(true);
    expect(body.data.role).toBe('ops');
    await app.close();
  });

  it('returns 401 when unauthenticated', async () => {
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex);
    const res = await app.inject({ method: 'GET', url: '/api/v1/auth/ops-ping' });
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});
