import type { Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '@neardrop/shared';
import { createApp } from '../app.js';
import { loadConfig, resetConfigCache } from '../config/index.js';
import { AppError } from '../errors/AppError.js';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../plugins/auth.js';
import type { UserService } from '../services/user.service.js';

const jwt32 = '0123456789abcdef0123456789abcdef';

const sampleUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'a@b.com',
  firstName: 'A',
  lastName: 'B',
  role: 'customer' as const,
  phone: null,
  postcode: null,
  emailVerified: false,
  createdAt: new Date().toISOString(),
};

describe('auth routes (mocked UserService)', () => {
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

  it('POST /api/v1/auth/register returns user and sets cookies', async () => {
    const userService = {
      register: vi.fn().mockResolvedValue({
        user: sampleUser,
        tokens: { accessToken: 'acc-test', refreshToken: 'ref-test' },
      }),
    } as unknown as UserService;
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex, { userService });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'a@b.com',
        password: 'GoodPassw0rd!',
        firstName: 'A',
        lastName: 'B',
        role: 'customer',
        postcode: 'SW1A1AA',
      },
    });
    expect(res.statusCode).toBe(200);
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const joined = Array.isArray(setCookie) ? setCookie.join('\n') : String(setCookie);
    expect(joined).toContain(`${ACCESS_COOKIE}=acc-test`);
    expect(joined).toContain(`${REFRESH_COOKIE}=ref-test`);
    await app.close();
  });

  it('POST /api/v1/auth/login propagates 401 from service', async () => {
    const userService = {
      login: vi.fn().mockRejectedValue(
        new AppError('Invalid email or password', ErrorCodes.UNAUTHORIZED, 401),
      ),
    } as unknown as UserService;
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex, { userService });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'a@b.com', password: 'GoodPassw0rd!' },
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it('GET /api/v1/auth/me returns 401 without token', async () => {
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex);
    const res = await app.inject({ method: 'GET', url: '/api/v1/auth/me' });
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});
