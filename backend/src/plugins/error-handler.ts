import { ErrorCodes } from '@neardrop/shared';
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/AppError.js';

function isFastifyHttpError(error: unknown): error is FastifyError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as FastifyError).statusCode === 'number'
  );
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: unknown, request: FastifyRequest, reply: FastifyReply) => {
      const requestId = request.id;

      if (error instanceof AppError) {
        const body = {
          success: false as const,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            requestId,
          },
        };
        void reply.code(error.statusCode).send(body);
        return;
      }

      if (isFastifyHttpError(error) && error.statusCode === 429) {
        void reply.code(429).send({
          success: false as const,
          error: {
            code: ErrorCodes.TOO_MANY_REQUESTS,
            message: error.message || 'Too many requests',
            requestId,
          },
        });
        return;
      }

      request.log.error({ err: error, requestId }, 'unhandled_error');
      const body = {
        success: false as const,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'An unexpected error occurred',
          requestId,
        },
      };
      void reply.code(500).send(body);
    },
  );
}
