/**
 * CLI: ensure the four fixed portal demo users (ops / affiliate A / carrier / customer)
 * exist with passwords from DEMO_PORTAL_TEST_ACCOUNTS — no manifest, no secondary hub.
 *
 * Usage (from backend, after migrate):
 *   npm run seed:demo-portals
 */
import { getConfig, loadConfig } from '../config/index.js';
import { createKnex } from '../database/connection.js';
import { ensureDemoPortalAccounts } from '../demo-seed/seed-demo-london.js';

async function main(): Promise<void> {
  if (process.env['NODE_ENV'] === 'production' && process.env['ALLOW_PRODUCTION_DEMO_SEED'] !== '1') {
    console.error(
      'Refusing demo portal seed in production. Set ALLOW_PRODUCTION_DEMO_SEED=1 if you really mean it.',
    );
    process.exit(1);
  }

  loadConfig();
  const config = getConfig();

  const knex = createKnex();
  try {
    const summary = await ensureDemoPortalAccounts(knex, config);
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await knex.destroy();
  }
}

void main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
