import { loadConfig } from './config/index.js';
import { createKnex } from './database/connection.js';
import { createApp } from './app.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const knex = createKnex();
  const app = await createApp(knex);

  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    app.log.info(`API listening on ${config.HOST}:${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    await knex.destroy();
    process.exit(1);
  }

  const shutdown = async () => {
    await app.close();
    await knex.destroy();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });
  process.on('SIGTERM', () => {
    void shutdown();
  });
}

void main();
