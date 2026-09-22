export class ApiError extends Error {
  readonly code: string;

  readonly status: number;

  readonly details?: Record<string, unknown>;

  readonly requestId?: string;

  constructor(
    message: string,
    options: {
      code?: string;
      status?: number;
      details?: Record<string, unknown>;
      requestId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'ApiError';
    this.code = options.code ?? 'UNKNOWN';
    this.status = options.status ?? 0;
    this.details = options.details;
    this.requestId = options.requestId;
  }

  static network(cause?: unknown): ApiError {
    return new ApiError('Network request failed', { code: 'NETWORK_ERROR', status: 0, cause });
  }

  static timeout(cause?: unknown): ApiError {
    return new ApiError('Request timed out', { code: 'TIMEOUT', status: 408, cause });
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, { code: 'UNAUTHORIZED', status: 401 });
  }
}
