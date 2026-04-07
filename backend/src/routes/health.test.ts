import type { Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { loadConfig, resetConfigCache } from '../config/index.js';

const jwt32 = '0123456789abcdef0123456789abcdef';

describe('GET /api/v1/health', () => {
  beforeEach(() => {
    resetConfigCache();
    process.env['NODE_ENV'] = 'test';
    process.env['JWT_SECRET'] = jwt32;
    delete process.env['DATABASE_URL'];
    loadConfig(undefined, { skipDotenv: true });
  });

  afterEach(() => {
    resetConfigCache();
    vi.restoreAllMocks();
  });

  it('returns 200 when database check succeeds', async () => {
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex);
    const res = await app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as {
      success: boolean;
      data: { database: string };
      meta: { requestId: string };
    };
    expect(body.success).toBe(true);
    expect(body.data.database).toBe('connected');
    expect(body.meta.requestId).toBeDefined();
    await app.close();
  });

  it('applies Helmet baseline headers on health', async () => {
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex);
    const res = await app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    await app.close();
  });

  it('returns 503 when database check fails', async () => {
    const knex = { raw: vi.fn().mockRejectedValue(new Error('db down')) } as unknown as Knex;
    const app = await createApp(knex);
    const res = await app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(res.statusCode).toBe(503);
    const body = JSON.parse(res.body) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('SERVICE_UNAVAILABLE');
    await app.close();
  });
});
