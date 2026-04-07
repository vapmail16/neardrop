import type { FastifyInstance } from 'fastify';
import {
  ErrorCodes,
  manifestUploadSchema,
  parcelCollectBodySchema,
  parcelListQuerySchema,
  parcelStatusPatchSchema,
  uuidSchema,
} from '@neardrop/shared';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import type { CollectionService } from '../services/collection.service.js';
import type { ParcelService } from '../services/parcel.service.js';

function zodToAppError(err: ZodError): AppError {
  const details = err.issues.map((e) => ({
    field: e.path.join('.') || '(root)',
    message: e.message,
  }));
  return new AppError('Validation failed', ErrorCodes.VALIDATION_ERROR, 400, details);
}

export async function registerParcelRoutes(
  app: FastifyInstance,
  parcelService: ParcelService,
  collectionService: CollectionService,
): Promise<void> {
  app.post(
    '/api/v1/parcels/manifest',
    { onRequest: [app.authenticate, app.requireRole('carrier')] },
    async (request, reply) => {
      let body;
      try {
        body = manifestUploadSchema.parse(request.body);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      const userId = request.authUser!.id;
      const summary = await parcelService.uploadManifest(userId, body, userId);
      return reply.send({
        success: true,
        data: summary,
        meta: { requestId: request.id },
      });
    },
  );

  app.get(
    '/api/v1/parcels',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      let query;
      try {
        query = parcelListQuerySchema.parse(request.query);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      const { role, id } = request.authUser!;
      const list = await parcelService.listParcels(role, id, query);
      return reply.send({
        success: true,
        data: list,
        meta: { requestId: request.id },
      });
    },
  );

  app.get(
    '/api/v1/parcels/:parcelId',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      let parcelId;
      try {
        parcelId = uuidSchema.parse((request.params as { parcelId: string }).parcelId);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      const { role, id } = request.authUser!;
      const parcel = await parcelService.getParcel(parcelId, role, id);
      return reply.send({
        success: true,
        data: { parcel },
        meta: { requestId: request.id },
      });
    },
  );

  app.get(
    '/api/v1/parcels/:parcelId/collection-qr',
    { onRequest: [app.authenticate, app.requireRole('customer')] },
    async (request, reply) => {
      let parcelId;
      try {
        parcelId = uuidSchema.parse((request.params as { parcelId: string }).parcelId);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      const userId = request.authUser!.id;
      const data = await parcelService.issueCustomerCollectionQr(userId, parcelId);
      return reply.send({
        success: true,
        data,
        meta: { requestId: request.id },
      });
    },
  );

  app.post(
    '/api/v1/parcels/:parcelId/collect',
    { onRequest: [app.authenticate, app.requireRole('affiliate')] },
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
        body = parcelCollectBodySchema.parse(request.body);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      const userId = request.authUser!.id;
      const parcel = await collectionService.completeCollection(userId, parcelId, body.qrToken);
      return reply.send({
        success: true,
        data: { parcel },
        meta: { requestId: request.id },
      });
    },
  );

  app.patch(
    '/api/v1/parcels/:parcelId/status',
    { onRequest: [app.authenticate] },
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
        body = parcelStatusPatchSchema.parse(request.body);
      } catch (e) {
        if (e instanceof ZodError) throw zodToAppError(e);
        throw e;
      }
      const { role, id } = request.authUser!;
      const parcel = await parcelService.changeStatus(
        parcelId,
        body.status,
        role,
        id,
        body.note ?? null,
      );
      return reply.send({
        success: true,
        data: { parcel },
        meta: { requestId: request.id },
      });
    },
  );
}
