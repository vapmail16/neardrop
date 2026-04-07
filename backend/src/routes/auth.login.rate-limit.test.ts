import type { Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '@neardrop/shared';
import { createApp } from '../app.js';
import { loadConfig, resetConfigCache } from '../config/index.js';
import { AppError } from '../errors/AppError.js';
import type { UserService } from '../services/user.service.js';

const jwt32 = '0123456789abcdef0123456789abcdef';

describe('POST /api/v1/auth/login rate limit', () => {
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

  it('returns 429 after 5 failed attempts in the window', async () => {
    const userService = {
      login: vi.fn().mockRejectedValue(
        new AppError('Invalid email or password', ErrorCodes.UNAUTHORIZED, 401),
      ),
    } as unknown as UserService;
    const knex = { raw: vi.fn().mockResolvedValue({}) } as unknown as Knex;
    const app = await createApp(knex, { userService });
    const payload = { email: 'a@b.com', password: 'GoodPassw0rd!' };
    let lastStatus = 0;
    for (let i = 0; i < 6; i++) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload,
      });
      lastStatus = res.statusCode;
    }
    expect(lastStatus).toBe(429);
    await app.close();
  });
});
