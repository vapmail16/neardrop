import { afterEach, describe, expect, it } from 'vitest';
import { loadConfig, resetConfigCache } from './index.js';

const jwt32 = '0123456789abcdef0123456789abcdef';

describe('loadConfig', () => {
  afterEach(() => {
    resetConfigCache();
    delete process.env['DATABASE_URL'];
    delete process.env['JWT_SECRET'];
    delete process.env['NODE_ENV'];
  });

  it('accepts test env without DATABASE_URL', () => {
    process.env['NODE_ENV'] = 'test';
    process.env['JWT_SECRET'] = jwt32;
    const cfg = loadConfig(undefined, { skipDotenv: true });
    expect(cfg.NODE_ENV).toBe('test');
    expect(cfg.JWT_SECRET).toBe(jwt32);
  });

  it('rejects development without DATABASE_URL', () => {
    process.env['NODE_ENV'] = 'development';
    process.env['JWT_SECRET'] = jwt32;
    expect(() => loadConfig(undefined, { skipDotenv: true })).toThrow(/DATABASE_URL/);
  });

  it('accepts development with DATABASE_URL', () => {
    process.env['NODE_ENV'] = 'development';
    process.env['JWT_SECRET'] = jwt32;
    process.env['DATABASE_URL'] = 'postgres://user:pass@localhost:5432/neardrop';
    const cfg = loadConfig(undefined, { skipDotenv: true });
    expect(cfg.DATABASE_URL).toContain('postgres');
  });

  it('rejects short JWT_SECRET', () => {
    process.env['NODE_ENV'] = 'test';
    process.env['JWT_SECRET'] = 'short';
    expect(() => loadConfig(undefined, { skipDotenv: true })).toThrow(/JWT_SECRET/);
  });
});
