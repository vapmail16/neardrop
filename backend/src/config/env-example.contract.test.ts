/**
 * Contract: root `.env.example` documents DATABASE_URL so local Postgres + migrate + E2E stay reproducible
 * (MASTER_GUIDELINES: env and DB from day one).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const examplePath = path.join(repoRoot, '.env.example');

describe('root .env.example', () => {
  it('documents DATABASE_URL for local PostgreSQL', () => {
    const raw = readFileSync(examplePath, 'utf8');
    expect(raw).toMatch(/^\s*DATABASE_URL=/m);
    expect(raw).toMatch(/postgresql:\/\//);
    expect(raw).toMatch(/5432/);
  });
});
