import { ErrorCodes } from '@neardrop/shared';
import type { Knex } from 'knex';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { checkDatabase } from '../database/connection.js';

export async function registerHealthRoutes(app: FastifyInstance, knex: Knex): Promise<void> {
  app.get('/api/v1/health', async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id;
    try {
      await checkDatabase(knex);
      return {
        success: true as const,
        data: { status: 'ok' as const, database: 'connected' as const },
        meta: { requestId },
      };
    } catch {
      return reply.code(503).send({
        success: false as const,
        error: {
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: 'Database unavailable',
          requestId,
        },
      });
    }
  });
}
