import type { FastifyInstance } from 'fastify';
import { ErrorCodes, uuidSchema } from '@neardrop/shared';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import type { AffiliateEarningsReadService } from '../services/affiliate-earnings-read.service.js';
import type { AffiliateReadService } from '../services/affiliate-read.service.js';

function zodToAppError(err: ZodError): AppError {
  const details = err.issues.map((e) => ({
    field: e.path.join('.') || '(root)',
    message: e.message,
  }));
  return new AppError('Validation failed', ErrorCodes.VALIDATION_ERROR, 400, details);
}

export async function registerAffiliateRoutes(
  app: FastifyInstance,
  affiliateRead: AffiliateReadService,
  affiliateEarningsRead: AffiliateEarningsReadService,
): Promise<void> {
  app.get(
    '/api/v1/affiliates/me/earnings',
    { onRequest: [app.authenticate, app.requireRole('affiliate', 'ops')] },
    async (request, reply) => {
      const userId = request.authUser!.id;
      const data = await affiliateEarningsRead.getSummaryForAffiliateUser(userId);
      return reply.send({
        success: true,
        data,
        meta: { requestId: request.id },
      });
    },
  );

  app.get(
    '/api/v1/affiliates/match',
    { onRequest: [app.authenticate, app.requireRole('customer', 'ops')] },
    async (request, reply) => {
      const userId = request.authUser!.id;
      const affiliate = await affiliateRead.getMatchForCustomerUserId(userId);
      return reply.send({
        success: true,
        data: { affiliate },
        meta: { requestId: request.id },
      });
    },
  );

  app.get(
    '/api/v1/affiliates/:affiliateId/summary',
    { onRequest: [app.authenticate, app.requireRole('customer', 'ops')] },
    async (request, reply) => {
      let affiliateId: string;
      try {
        affiliateId = uuidSchema.parse((request.params as { affiliateId: string }).affiliateId);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      const { role, id: userId } = request.authUser!;
      const affiliate =
        role === 'ops'
          ? await affiliateRead.getSummaryByAffiliateIdUnrestricted(affiliateId)
          : await affiliateRead.getSummaryForLinkedCustomer(userId, affiliateId);
      return reply.send({
        success: true,
        data: { affiliate },
        meta: { requestId: request.id },
      });
    },
  );
}
