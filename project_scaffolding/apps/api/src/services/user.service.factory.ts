import type { Knex } from 'knex';
import type { Env } from '../config/schema.js';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { TokenService } from './token.service.js';
import { UserService } from './user.service.js';

export function createUserService(knex: Knex, config: Env, tokens?: TokenService): UserService {
  const tokenService = tokens ?? new TokenService(config);
  return new UserService(
    knex,
    new UserRepository(knex),
    new RefreshTokenRepository(knex),
    tokenService,
    config.BCRYPT_ROUNDS,
  );
}

export function createTokenService(config: Env): TokenService {
  return new TokenService(config);
}
