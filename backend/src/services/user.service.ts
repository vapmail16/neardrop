import * as bcrypt from 'bcrypt';
import type { Knex } from 'knex';
import {
  ErrorCodes,
  type LoginRequest,
  type RegisterRequest,
  type UserPublic,
} from '@neardrop/shared';
import { AppError } from '../errors/AppError.js';
import { toUserPublic } from '../repositories/user.mappers.js';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { TokenService } from './token.service.js';

const GENERIC_AUTH = 'Invalid email or password';

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

export class UserService {
  constructor(
    private readonly knex: Knex,
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokens: TokenService,
    private readonly bcryptRounds: number,
  ) {}

  async register(body: RegisterRequest): Promise<{ user: UserPublic; tokens: SessionTokens }> {
    const existing = await this.users.findByEmail(body.email);
    if (existing) {
      throw new AppError('Email already registered', ErrorCodes.CONFLICT, 409);
    }
    const passwordHash = await bcrypt.hash(body.password, this.bcryptRounds);

    return await this.knex.transaction(async (trx) => {
      const ur = new UserRepository(trx);
      const rr = new RefreshTokenRepository(trx);
      const row = await ur.insertUser({
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        phone: body.phone ?? null,
        postcode: body.postcode,
      });

      if (body.role === 'carrier') {
        const company =
          `${body.firstName} ${body.lastName}`.trim() || body.email.split('@')[0] || 'Carrier';
        await trx('carriers').insert({
          user_id: row.id,
          company_name: company,
        });
      }

      if (body.role === 'affiliate' && body.postcode) {
        const line1 =
          body.addressLine1?.trim() && body.addressLine1.trim().length >= 3
            ? body.addressLine1.trim()
            : 'Pending — complete profile';
        const cap = body.maxDailyCapacity ?? 20;
        await trx('affiliates').insert({
          user_id: row.id,
          postcode: body.postcode,
          address_line_1: line1,
          city: 'London',
          max_daily_capacity: cap,
          current_load: 0,
          is_available: true,
          verification_status: 'pending',
          total_earnings: 0,
        });
      }

      await ur.updateLastLogin(row.id);
      const tokens = await this.createSession(row.id, row.role, rr);
      return { user: toUserPublic(row), tokens };
    });
  }

  async login(body: LoginRequest): Promise<{ user: UserPublic; tokens: SessionTokens }> {
    const row = await this.users.findByEmail(body.email);
    const valid =
      row &&
      row.is_active &&
      (await bcrypt.compare(body.password, row.password_hash));
    if (!valid) {
      throw new AppError(GENERIC_AUTH, ErrorCodes.UNAUTHORIZED, 401);
    }
    await this.users.updateLastLogin(row.id);
    const tokens = await this.createSession(row.id, row.role, this.refreshTokens);
    return { user: toUserPublic(row), tokens };
  }

  async getProfile(userId: string): Promise<UserPublic> {
    const row = await this.users.findById(userId);
    if (!row || !row.is_active) {
      throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);
    }
    return toUserPublic(row);
  }

  async refreshSession(refreshToken: string): Promise<SessionTokens> {
    let payload;
    try {
      payload = this.tokens.verifyRefresh(refreshToken);
    } catch {
      throw new AppError(GENERIC_AUTH, ErrorCodes.UNAUTHORIZED, 401);
    }
    const active = await this.refreshTokens.findActive(payload.jti, payload.sub);
    if (!active) {
      throw new AppError(GENERIC_AUTH, ErrorCodes.UNAUTHORIZED, 401);
    }
    await this.refreshTokens.revoke(payload.jti);
    return this.createSession(payload.sub, payload.role, this.refreshTokens);
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokens.revokeAllForUser(userId);
  }

  private async createSession(
    userId: string,
    role: RegisterRequest['role'],
    refreshRepo: RefreshTokenRepository,
  ): Promise<SessionTokens> {
    const jti = this.tokens.newRefreshJti();
    const expiresAt = this.tokens.refreshSessionExpiry();
    await refreshRepo.insert({ id: jti, userId, expiresAt });
    const refreshToken = this.tokens.signRefresh(userId, role, jti);
    const accessToken = this.tokens.signAccess(userId, role);
    return { accessToken, refreshToken };
  }
}
