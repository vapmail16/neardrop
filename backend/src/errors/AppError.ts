import type { ErrorCode } from '@neardrop/shared';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
