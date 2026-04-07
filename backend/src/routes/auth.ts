import type { FastifyInstance, FastifyReply } from 'fastify';
import { ErrorCodes, loginRequestSchema, registerRequestSchema } from '@neardrop/shared';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../plugins/auth.js';
import type { UserService } from '../services/user.service.js';

export type AuthRoutesOpts = {
  userService: UserService;
  cookieSecure: boolean;
  /** When true, omit login route rate limit (E2E / local only). */
  disableLoginRateLimit?: boolean;
  /** `NODE_ENV` from config — development uses a higher login budget for local Playwright suites. */
  nodeEnv: string;
};

function setAuthCookies(reply: FastifyReply, access: string, refresh: string, secure: boolean): void {
  const base = { path: '/', httpOnly: true, sameSite: 'strict' as const, secure };
  reply.setCookie(ACCESS_COOKIE, access, { ...base, maxAge: 15 * 60 });
  reply.setCookie(REFRESH_COOKIE, refresh, { ...base, maxAge: 7 * 24 * 60 * 60 });
}

function zodToAppError(err: ZodError): AppError {
  const details = err.issues.map((e) => ({
    field: e.path.join('.') || '(root)',
    message: e.message,
  }));
  return new AppError('Validation failed', ErrorCodes.VALIDATION_ERROR, 400, details);
}

export async function registerAuthRoutes(app: FastifyInstance, opts: AuthRoutesOpts): Promise<void> {
  const { userService, cookieSecure, disableLoginRateLimit, nodeEnv } = opts;
  const loginMax =
    nodeEnv === 'development' ? 500 : 5;
  const loginRouteOpts = disableLoginRateLimit
    ? {}
    : {
        config: {
          rateLimit: {
            max: loginMax,
            timeWindow: 15 * 60 * 1000,
          },
        },
      };

  app.post('/api/v1/auth/register', async (request, reply) => {
    let body;
    try {
      body = registerRequestSchema.parse(request.body);
    } catch (e) {
      if (e instanceof ZodError) throw zodToAppError(e);
      throw e;
    }
    const { user, tokens } = await userService.register(body);
    setAuthCookies(reply, tokens.accessToken, tokens.refreshToken, cookieSecure);
    return reply.send({
      success: true,
      data: { user },
      meta: { requestId: request.id },
    });
  });

  app.post(
    '/api/v1/auth/login',
    loginRouteOpts,
    async (request, reply) => {
      let body;
      try {
        body = loginRequestSchema.parse(request.body);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      const { user, tokens } = await userService.login(body);
      setAuthCookies(reply, tokens.accessToken, tokens.refreshToken, cookieSecure);
      return reply.send({
        success: true,
        data: { user },
        meta: { requestId: request.id },
      });
    },
  );

  app.post('/api/v1/auth/refresh', async (request, reply) => {
    const raw = request.cookies?.[REFRESH_COOKIE];
    if (!raw) {
      throw new AppError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401);
    }
    const tokens = await userService.refreshSession(raw);
    setAuthCookies(reply, tokens.accessToken, tokens.refreshToken, cookieSecure);
    return reply.send({
      success: true,
      data: {},
      meta: { requestId: request.id },
    });
  });

  app.post(
    '/api/v1/auth/logout',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      await userService.logout(request.authUser!.id);
      reply.clearCookie(ACCESS_COOKIE, { path: '/' });
      reply.clearCookie(REFRESH_COOKIE, { path: '/' });
      return reply.send({
        success: true,
        data: {},
        meta: { requestId: request.id },
      });
    },
  );

  app.get('/api/v1/auth/me', { onRequest: [app.authenticate] }, async (request, reply) => {
    const user = await userService.getProfile(request.authUser!.id);
    return reply.send({
      success: true,
      data: { user },
      meta: { requestId: request.id },
    });
  });

  /** RBAC smoke (Phase 1 gate): must return 403 for non-ops JWTs. */
  app.get(
    '/api/v1/auth/ops-ping',
    { onRequest: [app.authenticate, app.requireRole('ops')] },
    async (request, reply) =>
      reply.send({
        success: true,
        data: { role: 'ops' as const },
        meta: { requestId: request.id },
      }),
  );
}
