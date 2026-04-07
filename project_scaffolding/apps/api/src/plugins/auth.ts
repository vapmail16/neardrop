import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ErrorCodes, type UserRole } from '@neardrop/shared';
import { AppError } from '../errors/AppError.js';
import type { TokenService } from '../services/token.service.js';

export const ACCESS_COOKIE = 'nd_access';
export const REFRESH_COOKIE = 'nd_refresh';

export type RolePreHandler = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void>;

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: { id: string; role: UserRole };
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** Run after `authenticate`. Rejects with 403 when JWT role is not in `allowed`. */
    requireRole: (...allowed: UserRole[]) => RolePreHandler;
  }
}

export function registerAuthPlugin(app: FastifyInstance, tokens: TokenService): void {
  app.decorate(
    'authenticate',
    async function authenticate(
      request: FastifyRequest,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- preHandler arity
      _reply: FastifyReply,
    ): Promise<void> {
      const header = request.headers.authorization;
      let raw: string | undefined;
      if (typeof header === 'string' && header.startsWith('Bearer ')) {
        raw = header.slice(7).trim();
      }
      if (!raw && request.cookies) {
        raw = request.cookies[ACCESS_COOKIE];
      }
      if (!raw) {
        throw new AppError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401);
      }
      try {
        const payload = tokens.verifyAccess(raw);
        request.authUser = { id: payload.sub, role: payload.role };
      } catch {
        throw new AppError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401);
      }
    },
  );

  app.decorate('requireRole', (...allowed: UserRole[]): RolePreHandler => {
    return async function requireRoleHandler(
      request: FastifyRequest,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- preHandler arity
      _reply: FastifyReply,
    ): Promise<void> {
      if (!request.authUser) {
        throw new AppError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401);
      }
      if (!allowed.includes(request.authUser.role)) {
        throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
      }
    };
  });
}
