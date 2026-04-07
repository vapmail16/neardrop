import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { addExpiresIn, TokenService } from './token.service.js';

const secret = '0123456789abcdef0123456789abcdef';

describe('addExpiresIn', () => {
  it('adds minutes', () => {
    const base = new Date('2026-01-01T12:00:00.000Z');
    const out = addExpiresIn(base, '15m');
    expect(out.toISOString()).toBe('2026-01-01T12:15:00.000Z');
  });

  it('adds days', () => {
    const base = new Date('2026-01-01T12:00:00.000Z');
    const out = addExpiresIn(base, '7d');
    expect(out.toISOString()).toBe('2026-01-08T12:00:00.000Z');
  });
});

describe('TokenService', () => {
  const svc = new TokenService({
    JWT_SECRET: secret,
    JWT_ACCESS_EXPIRES: '15m',
    JWT_REFRESH_EXPIRES: '7d',
  });

  it('round-trips access token', () => {
    const t = svc.signAccess('u1', 'customer');
    const p = svc.verifyAccess(t);
    expect(p.sub).toBe('u1');
    expect(p.role).toBe('customer');
    expect(p.typ).toBe('access');
  });

  it('rejects access verifier on refresh token', () => {
    const rt = svc.signRefresh('u1', 'customer', 'jti-1');
    expect(() => svc.verifyAccess(rt)).toThrow(jwt.JsonWebTokenError);
  });

  it('round-trips refresh token', () => {
    const rt = svc.signRefresh('u1', 'ops', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    const p = svc.verifyRefresh(rt);
    expect(p.sub).toBe('u1');
    expect(p.role).toBe('ops');
    expect(p.jti).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
  });
});
