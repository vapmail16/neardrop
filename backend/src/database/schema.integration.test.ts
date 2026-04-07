import path from 'node:path';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { afterAll, describe, expect, it } from 'vitest';
import { loadMonorepoDotenv } from '../config/dotenv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadMonorepoDotenv(path.join(__dirname, '..'));

/** Real Postgres only — run after `npm run migrate`. */
const run = process.env['RUN_DB_INTEGRATION'] === '1' && !!process.env['DATABASE_URL'];

describe.runIf(run)('database schema (PostgreSQL, post-migrate)', () => {
  const url = process.env['DATABASE_URL'] as string;
  const db = knex({ client: 'pg', connection: url });

  afterAll(async () => {
    await db.destroy();
  });

  it('records knex migrations', async () => {
    const row = await db('knex_migrations').count<{ count: string }>('* as count').first();
    expect(row).toBeDefined();
    expect(Number(row?.count)).toBeGreaterThanOrEqual(1);
  });

  it('has core tables from MVP migration', async () => {
    const names = [
      'users',
      'refresh_tokens',
      'affiliates',
      'carriers',
      'parcels',
      'parcel_status_history',
      'affiliate_earnings',
      'notifications',
    ];
    for (const table of names) {
      const r = await db('information_schema.tables')
        .where({ table_schema: 'public', table_name: table })
        .first();
      expect(r, `missing table ${table}`).toBeDefined();
    }
  });

  it('has updated_at triggers on users and parcels', async () => {
    const res = await db.raw(`
      SELECT t.tgname
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND NOT t.tgisinternal
        AND t.tgname IN ('trg_users_updated_at', 'trg_parcels_updated_at')
      ORDER BY t.tgname
    `);
    const names = (res.rows as { tgname: string }[]).map((r) => r.tgname);
    expect(names).toEqual(['trg_parcels_updated_at', 'trg_users_updated_at']);
  });
});
