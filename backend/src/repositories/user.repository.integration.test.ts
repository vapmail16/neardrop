import path from 'node:path';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { loadMonorepoDotenv } from '../config/dotenv.js';
import { UserRepository } from './user.repository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadMonorepoDotenv(path.join(__dirname, '..'));

const run = process.env['RUN_DB_INTEGRATION'] === '1' && !!process.env['DATABASE_URL'];

describe.runIf(run)('UserRepository (PostgreSQL)', () => {
  const url = process.env['DATABASE_URL'] as string;
  const db = knex({ client: 'pg', connection: url });

  beforeEach(async () => {
    await db('users').where('email', 'like', 'repo-test-%@example.com').delete();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('inserts user and finds by email and id', async () => {
    const repo = new UserRepository(db);
    const email = `repo-test-${Date.now()}@example.com`;
    const row = await repo.insertUser({
      email,
      passwordHash: 'not-a-real-hash',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      phone: null,
      postcode: null,
    });
    expect(row.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const byEmail = await repo.findByEmail(email);
    expect(byEmail?.id).toBe(row.id);

    const byId = await repo.findById(row.id);
    expect(byId?.email).toBe(email.toLowerCase());
    expect(byId?.role).toBe('customer');
  });
});
