import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Knex } from 'knex';
import { ErrorCodes } from '@neardrop/shared';
import * as bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError.js';
import type { UserRow } from '../repositories/user.repository.js';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { TokenService } from './token.service.js';
import { UserService } from './user.service.js';

const secret = '0123456789abcdef0123456789abcdef';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

function buildTrxKnex(row: UserRow): Knex {
  const usersQb = {
    insert: vi.fn(() => ({
      returning: vi.fn().mockResolvedValue([row]),
    })),
    where: vi.fn().mockReturnValue({
      update: vi.fn().mockResolvedValue(1),
    }),
  };
  const simpleInsert = vi.fn().mockResolvedValue([1]);
  const trxFn = Object.assign(
    vi.fn((table: string) => {
      if (table === 'users') return usersQb;
      if (table === 'carriers' || table === 'affiliates' || table === 'refresh_tokens') {
        return { insert: simpleInsert };
      }
      throw new Error(`unexpected table ${table}`);
    }),
    { fn: { now: () => '(now)' } },
  );
  return trxFn as unknown as Knex;
}

function buildKnexRegister(row: UserRow): Knex {
  return {
    transaction: vi.fn(async (cb: (t: Knex) => Promise<unknown>) => {
      return cb(buildTrxKnex(row));
    }),
  } as unknown as Knex;
}

describe('UserService', () => {
  let users: UserRepository;
  let refresh: RefreshTokenRepository;
  let tokens: TokenService;
  let knexMock: Knex;
  let svc: UserService;

  const mockRow = (overrides: Partial<UserRow> = {}): UserRow => ({
    id: '11111111-1111-1111-1111-111111111111',
    email: 'u@example.com',
    password_hash: 'hashed',
    first_name: 'A',
    last_name: 'B',
    role: 'customer',
    phone: null,
    postcode: null,
    is_active: true,
    email_verified: false,
    last_login_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-new' as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    users = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      insertUser: vi.fn(),
      updateLastLogin: vi.fn(),
    } as unknown as UserRepository;
    refresh = {
      insert: vi.fn(),
      findActive: vi.fn(),
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
    } as unknown as RefreshTokenRepository;
    tokens = new TokenService({
      JWT_SECRET: secret,
      JWT_ACCESS_EXPIRES: '15m',
      JWT_REFRESH_EXPIRES: '7d',
    });
    knexMock = buildKnexRegister(mockRow());
    svc = new UserService(knexMock, users, refresh, tokens, 12);
  });

  it('register runs in a transaction and returns tokens', async () => {
    vi.mocked(users.findByEmail).mockResolvedValue(null);

    const out = await svc.register({
      email: 'u@example.com',
      password: 'GoodPassw0rd!',
      firstName: 'A',
      lastName: 'B',
      role: 'customer',
      postcode: 'E1 6AN',
    });

    expect(out.user.email).toBe('u@example.com');
    expect(out.tokens.accessToken).toBeDefined();
    expect(out.tokens.refreshToken).toBeDefined();
    expect(bcrypt.hash).toHaveBeenCalledWith('GoodPassw0rd!', 12);
    expect(knexMock.transaction).toHaveBeenCalledTimes(1);
  });

  it('register rejects duplicate email', async () => {
    vi.mocked(users.findByEmail).mockResolvedValue(mockRow());
    await expect(
      svc.register({
        email: 'u@example.com',
        password: 'GoodPassw0rd!',
        firstName: 'A',
        lastName: 'B',
        role: 'customer',
        postcode: 'E1 6AN',
      }),
    ).rejects.toMatchObject({
      code: ErrorCodes.CONFLICT,
      statusCode: 409,
    });
    expect(knexMock.transaction).not.toHaveBeenCalled();
  });

  it('login uses generic error on wrong password', async () => {
    vi.mocked(users.findByEmail).mockResolvedValue(mockRow());
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    try {
      await svc.login({ email: 'u@example.com', password: 'wrong' });
      expect.fail('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      const err = e as AppError;
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Invalid email or password');
    }
  });

  it('login uses generic error when user missing', async () => {
    vi.mocked(users.findByEmail).mockResolvedValue(null);
    await expect(svc.login({ email: 'none@example.com', password: 'GoodPassw0rd!' })).rejects.toMatchObject(
      { message: 'Invalid email or password' },
    );
  });

  it('login rejects inactive user with generic error', async () => {
    vi.mocked(users.findByEmail).mockResolvedValue(mockRow({ is_active: false }));
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    await expect(svc.login({ email: 'u@example.com', password: 'GoodPassw0rd!' })).rejects.toMatchObject({
      message: 'Invalid email or password',
    });
  });

  it('refreshSession rotates refresh token', async () => {
    const jti = '22222222-2222-2222-2222-222222222222';
    const old = tokens.signRefresh('11111111-1111-1111-1111-111111111111', 'customer', jti);
    vi.mocked(refresh.findActive).mockResolvedValue({ id: jti });
    vi.mocked(refresh.revoke).mockResolvedValue(undefined);
    vi.mocked(refresh.insert).mockResolvedValue(undefined);

    const next = await svc.refreshSession(old);

    expect(refresh.revoke).toHaveBeenCalledWith(jti);
    expect(refresh.insert).toHaveBeenCalledTimes(1);
    expect(next.accessToken).toBeDefined();
    expect(next.refreshToken).not.toBe(old);
  });
});
