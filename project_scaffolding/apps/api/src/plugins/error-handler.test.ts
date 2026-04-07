import type { Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { loadConfig, resetConfigCache } from '../config/index.js';
import { ValidationError } from '../errors/ValidationError.js';

const jwt32 = '0123456789abcdef0123456789abcdef';

describe('error handler', () => {
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

  it('maps ValidationError to 400 with standard body', async () => {
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex);
    app.get('/__test_validation', async () => {
      throw new ValidationError('Invalid input', [{ field: 'x', message: 'bad' }]);
    });
    const res = await app.inject({ method: 'GET', url: '/__test_validation' });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body) as {
      success: boolean;
      error: { code: string; message: string; details?: unknown };
    };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toEqual([{ field: 'x', message: 'bad' }]);
    await app.close();
  });
});
