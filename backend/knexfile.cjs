/* eslint-disable @typescript-eslint/no-require-imports -- knex CLI CommonJS */
const fs = require('node:fs');
const path = require('node:path');

function loadMonorepoDotenv(startDir) {
  let dir = path.resolve(startDir);
  let rootLoaded = false;
  for (let i = 0; i < 10; i++) {
    const turbo = path.join(dir, 'turbo.json');
    const envFile = path.join(dir, '.env');
    if (fs.existsSync(turbo) && fs.existsSync(envFile)) {
      require('dotenv').config({ path: envFile, override: true });
      rootLoaded = true;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const local = path.join(startDir, '.env');
  if (fs.existsSync(local)) {
    require('dotenv').config({ path: local, override: true });
  } else if (!rootLoaded) {
    require('dotenv').config();
  }
}

loadMonorepoDotenv(__dirname);

/** @type {import('knex').Knex.Config} */
module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL ?? { host: 'localhost', database: 'neardrop_test' },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: path.join(__dirname, 'src', 'database', 'migrations'),
    extension: 'cjs',
    loadExtensions: ['.cjs'],
  },
};
