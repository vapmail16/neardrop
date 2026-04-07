import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadMonorepoDotenv } from './dotenv.js';

describe('loadMonorepoDotenv', () => {
  const origJwt = process.env['JWT_SECRET'];
  const origDb = process.env['DATABASE_URL'];
  const origNode = process.env['NODE_ENV'];

  afterEach(() => {
    if (origJwt === undefined) delete process.env['JWT_SECRET'];
    else process.env['JWT_SECRET'] = origJwt;
    if (origDb === undefined) delete process.env['DATABASE_URL'];
    else process.env['DATABASE_URL'] = origDb;
    if (origNode === undefined) delete process.env['NODE_ENV'];
    else process.env['NODE_ENV'] = origNode;
  });

  it('loads root .env when startDir is apps/api under monorepo root', () => {
    const root = mkdtempSync(join(tmpdir(), 'neardrop-mono-'));
    mkdirSync(join(root, 'apps', 'api'), { recursive: true });
    writeFileSync(join(root, 'turbo.json'), '{}');
    writeFileSync(
      join(root, '.env'),
      [
        'NODE_ENV=test',
        'JWT_SECRET=0123456789abcdef0123456789abcdef',
        'DATABASE_URL=postgres://localhost:5432/testdb',
      ].join('\n'),
    );

    delete process.env['JWT_SECRET'];
    delete process.env['DATABASE_URL'];
    process.env['NODE_ENV'] = 'test';

    const apiDir = join(root, 'apps', 'api');
    loadMonorepoDotenv(apiDir);

    expect(process.env['JWT_SECRET']).toBe('0123456789abcdef0123456789abcdef');
    expect(process.env['DATABASE_URL']).toBe('postgres://localhost:5432/testdb');
    expect(existsSync(join(root, '.env'))).toBe(true);
  });

  it('local package .env overrides root when both exist', () => {
    const root = mkdtempSync(join(tmpdir(), 'neardrop-mono-'));
    mkdirSync(join(root, 'apps', 'api'), { recursive: true });
    writeFileSync(join(root, 'turbo.json'), '{}');
    writeFileSync(
      join(root, '.env'),
      [
        'NODE_ENV=test',
        'JWT_SECRET=0123456789abcdef0123456789abcdef',
        'DATABASE_URL=postgres://root/db',
      ].join('\n'),
    );
    writeFileSync(
      join(root, 'apps', 'api', '.env'),
      'DATABASE_URL=postgres://local/override\n',
    );

    loadMonorepoDotenv(join(root, 'apps', 'api'));

    expect(process.env['DATABASE_URL']).toBe('postgres://local/override');
    expect(process.env['JWT_SECRET']).toBe('0123456789abcdef0123456789abcdef');
  });

  it('root .env overrides stale DATABASE_URL already in process.env', () => {
    const root = mkdtempSync(join(tmpdir(), 'neardrop-mono-'));
    mkdirSync(join(root, 'apps', 'api'), { recursive: true });
    writeFileSync(join(root, 'turbo.json'), '{}');
    writeFileSync(
      join(root, '.env'),
      [
        'NODE_ENV=test',
        'JWT_SECRET=0123456789abcdef0123456789abcdef',
        'DATABASE_URL=postgres://from-file:5432/neardrop',
      ].join('\n'),
    );

    process.env['DATABASE_URL'] = 'postgres://stale-shell:5434/old';
    process.env['NODE_ENV'] = 'test';

    loadMonorepoDotenv(join(root, 'apps', 'api'));

    expect(process.env['DATABASE_URL']).toBe(
      'postgres://from-file:5432/neardrop',
    );
  });
});
