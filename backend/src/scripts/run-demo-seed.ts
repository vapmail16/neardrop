/**
 * CLI: load demo London users + manifest into PostgreSQL.
 *
 * Usage (from monorepo root, after migrate):
 *   npm run seed:demo
 *
 * Optional: DEMO_SEED_PARCEL_COUNT=48 npm run seed:demo
 */
import { getConfig, loadConfig } from '../config/index.js';
import { createKnex } from '../database/connection.js';
import { seedDemoLondonDataset } from '../demo-seed/seed-demo-london.js';

function parseParcelCount(): number {
  const raw = process.env['DEMO_SEED_PARCEL_COUNT'];
  if (raw === undefined || raw === '') return 24;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid DEMO_SEED_PARCEL_COUNT: ${raw}`);
  }
  return n;
}

async function main(): Promise<void> {
  if (process.env['NODE_ENV'] === 'production' && process.env['ALLOW_PRODUCTION_DEMO_SEED'] !== '1') {
    console.error(
      'Refusing demo seed in production. Set ALLOW_PRODUCTION_DEMO_SEED=1 if you really mean it.',
    );
    process.exit(1);
  }

  loadConfig();
  const config = getConfig();
  const tag = String(process.env['DEMO_SEED_TAG'] ?? Date.now());
  const parcelCount = parseParcelCount();

  const knex = createKnex();
  try {
    const summary = await seedDemoLondonDataset(knex, config, { tag, parcelCount });
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await knex.destroy();
  }
}

void main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
