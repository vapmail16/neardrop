import knex, { type Knex } from 'knex';
import { getDatabaseUrl } from '../config/index.js';

export function createKnex(): Knex {
  const connectionString = getDatabaseUrl();
  return knex({
    client: 'pg',
    connection: connectionString,
    pool: { min: 0, max: 10 },
  });
}

export function createKnexFromUrl(connectionString: string): Knex {
  return knex({
    client: 'pg',
    connection: connectionString,
    pool: { min: 0, max: 10 },
  });
}

export async function checkDatabase(knexInstance: Knex): Promise<void> {
  await knexInstance.raw('select 1');
}
