import { ErrorCodes } from '@neardrop/shared';
import { AppError } from './AppError.js';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, ErrorCodes.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}
