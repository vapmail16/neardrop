import type { ErrorCode } from '../constants/errorCodes.js';

export type ApiErrorBody = {
  code: ErrorCode;
  message: string;
  details?: Array<{ field: string; message: string }>;
  requestId?: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    requestId?: string;
  };
};

export type ApiFailure = {
  success: false;
  error: ApiErrorBody;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
