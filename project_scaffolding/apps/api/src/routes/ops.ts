import type { FastifyInstance } from 'fastify';
import { ErrorCodes, parcelAssignAffiliateBodySchema, uuidSchema } from '@neardrop/shared';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import type { OpsReadService } from '../services/ops-read.service.js';
import type { ParcelService } from '../services/parcel.service.js';

function zodToAppError(err: ZodError): AppError {
  const details = err.issues.map((e) => ({
    field: e.path.join('.') || '(root)',
    message: e.message,
  }));
  return new AppError('Validation failed', ErrorCodes.VALIDATION_ERROR, 400, details);
}

export async function registerOpsRoutes(
  app: FastifyInstance,
  opsRead: OpsReadService,
  parcelService: ParcelService,
): Promise<void> {
  app.get(
    '/api/v1/ops/stats',
    { onRequest: [app.authenticate, app.requireRole('ops')] },
    async (request, reply) => {
      const data = await opsRead.getStats();
      return reply.send({
        success: true,
        data,
        meta: { requestId: request.id },
      });
    },
  );

  app.get(
    '/api/v1/ops/affiliates/map',
    { onRequest: [app.authenticate, app.requireRole('ops')] },
    async (request, reply) => {
      const items = await opsRead.listAffiliateMapPins();
      return reply.send({
        success: true,
        data: { items },
        meta: { requestId: request.id },
      });
    },
  );

  app.patch(
    '/api/v1/ops/parcels/:parcelId/affiliate',
    { onRequest: [app.authenticate, app.requireRole('ops')] },
    async (request, reply) => {
      let parcelId;
      try {
        parcelId = uuidSchema.parse((request.params as { parcelId: string }).parcelId);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      let body;
      try {
        body = parcelAssignAffiliateBodySchema.parse(request.body);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      const opsUserId = request.authUser!.id;
      const parcel = await parcelService.assignAffiliateByOps(parcelId, body.affiliateId, opsUserId);
      return reply.send({
        success: true,
        data: { parcel },
        meta: { requestId: request.id },
      });
    },
  );
}
