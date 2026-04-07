import { randomUUID } from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@neardrop/shared';
import type { Env } from '../config/schema.js';

export type AccessPayload = { sub: string; role: UserRole; typ: 'access' };
export type RefreshPayload = { sub: string; role: UserRole; typ: 'refresh'; jti: string };

type TokenConfig = Pick<Env, 'JWT_SECRET' | 'JWT_ACCESS_EXPIRES' | 'JWT_REFRESH_EXPIRES'>;

/** Supports jsonwebtoken-style `expiresIn` strings used in env defaults (e.g. `15m`, `7d`). */
export function addExpiresIn(base: Date, expiresIn: string): Date {
  const s = expiresIn.trim();
  const m = /^(\d+)\s*(ms|s|m|h|d|w)$/i.exec(s);
  if (!m) {
    throw new Error(`Unsupported JWT expiry format: ${expiresIn}`);
  }
  const [, numStr, unitStr] = m;
  if (numStr === undefined || unitStr === undefined) {
    throw new Error(`Unsupported JWT expiry format: ${expiresIn}`);
  }
  const n = Number(numStr);
  const unit = unitStr.toLowerCase();
  const out = new Date(base.getTime());
  switch (unit) {
    case 'ms':
      return new Date(out.getTime() + n);
    case 's':
      return new Date(out.getTime() + n * 1000);
    case 'm':
      out.setMinutes(out.getMinutes() + n);
      return out;
    case 'h':
      out.setHours(out.getHours() + n);
      return out;
    case 'd':
      out.setDate(out.getDate() + n);
      return out;
    case 'w':
      out.setDate(out.getDate() + n * 7);
      return out;
    default:
      throw new Error(`Unsupported JWT expiry unit: ${unit}`);
  }
}

export class TokenService {
  constructor(private readonly config: TokenConfig) {}

  signAccess(userId: string, role: UserRole): string {
    const payload: AccessPayload = { sub: userId, role, typ: 'access' };
    const options: SignOptions = {
      expiresIn: this.config.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, this.config.JWT_SECRET, options);
  }

  signRefresh(userId: string, role: UserRole, jti: string): string {
    const payload: RefreshPayload = { sub: userId, role, typ: 'refresh', jti };
    const options: SignOptions = {
      expiresIn: this.config.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, this.config.JWT_SECRET, options);
  }

  verifyAccess(token: string): AccessPayload {
    const decoded = jwt.verify(token, this.config.JWT_SECRET) as AccessPayload | RefreshPayload;
    if (decoded.typ !== 'access') {
      throw new jwt.JsonWebTokenError('Expected access token');
    }
    return decoded;
  }

  verifyRefresh(token: string): RefreshPayload {
    const decoded = jwt.verify(token, this.config.JWT_SECRET) as AccessPayload | RefreshPayload;
    if (decoded.typ !== 'refresh' || !('jti' in decoded) || !decoded.jti) {
      throw new jwt.JsonWebTokenError('Expected refresh token');
    }
    return decoded as RefreshPayload;
  }

  newRefreshJti(): string {
    return randomUUID();
  }

  refreshSessionExpiry(): Date {
    return addExpiresIn(new Date(), this.config.JWT_REFRESH_EXPIRES);
  }
}
