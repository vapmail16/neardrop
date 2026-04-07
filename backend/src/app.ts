import { randomUUID } from 'node:crypto';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import type { Knex } from 'knex';
import Fastify, { type FastifyInstance } from 'fastify';
import { getConfig } from './config/index.js';
import { registerAuthPlugin } from './plugins/auth.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerAffiliateRoutes } from './routes/affiliates.js';
import { registerOpsRoutes } from './routes/ops.js';
import { registerParcelRoutes } from './routes/parcels.js';
import { createParcelStack, type ParcelStack } from './services/parcel.service.factory.js';
import type { TokenService } from './services/token.service.js';
import { createTokenService, createUserService } from './services/user.service.factory.js';
import { AffiliateEarningsReadService } from './services/affiliate-earnings-read.service.js';
import { AffiliateReadService } from './services/affiliate-read.service.js';
import { OpsReadService } from './services/ops-read.service.js';
import type { UserService } from './services/user.service.js';

export type CreateAppOptions = {
  userService?: UserService;
  /** When omitted, built from config, knex, and app logger (QR + notifications). */
  parcelStack?: ParcelStack;
  /** Shared with auth plugin (tests can inject one TokenService for signing + verification). */
  tokenServiceForTests?: TokenService;
};

export async function createApp(knex: Knex, options?: CreateAppOptions): Promise<FastifyInstance> {
  const config = getConfig();
  const app = Fastify({
    genReqId: () => randomUUID(),
    logger: {
      level: config.LOG_LEVEL,
    },
  });

  await app.register(helmet, { global: true });
  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
  });
  await app.register(cookie);
  await app.register(rateLimit, { global: false });

  registerErrorHandler(app);
  await registerHealthRoutes(app, knex);

  const tokenService = options?.tokenServiceForTests ?? createTokenService(config);
  const userService = options?.userService ?? createUserService(knex, config, tokenService);
  const parcelStack = options?.parcelStack ?? createParcelStack(knex, config, app.log);
  registerAuthPlugin(app, tokenService);
  const disableLoginRateLimit =
    process.env['DISABLE_LOGIN_RATE_LIMIT'] === '1' || config.DISABLE_LOGIN_RATE_LIMIT === '1';
  await registerAuthRoutes(app, {
    userService,
    cookieSecure: config.NODE_ENV === 'production',
    disableLoginRateLimit,
    nodeEnv: config.NODE_ENV,
  });
  await registerParcelRoutes(app, parcelStack.parcel, parcelStack.collection);
  const affiliateRead = new AffiliateReadService(knex);
  const affiliateEarningsRead = new AffiliateEarningsReadService(knex);
  await registerAffiliateRoutes(app, affiliateRead, affiliateEarningsRead);
  const opsRead = new OpsReadService(knex);
  await registerOpsRoutes(app, opsRead, parcelStack.parcel);

  return app;
}
