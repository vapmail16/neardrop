import { ErrorCodes } from '@neardrop/shared';
import { AppError } from './AppError.js';

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, ErrorCodes.UNAUTHORIZED, 401);
    this.name = 'UnauthorizedError';
  }
}
