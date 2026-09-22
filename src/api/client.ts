import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { z } from 'zod';
import { API_BASE_URL, API_TIMEOUT_MS, IS_PRODUCTION, SENTRY_ENABLED } from '@constants/config';
import { strings } from '@constants/strings';
import { ApiError } from '@api/ApiError';
import { apiErrorResponseSchema, type ApiResponse, type ApiRequestOptions } from '@app-types/api';
import { getSecureItem, setTokenPair } from '@utils/secureStorage';
import { logger } from '@utils/logger';
import * as Sentry from '@sentry/react-native';

type RetriableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _idempotencyKey?: string;
  skipAuthRefreshRetry?: boolean;
};

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/** Callbacks wired by the auth feature (keeps this module free of store imports). */
interface AuthBridge {
  onSessionExpired: () => void;
}

let authBridge: AuthBridge | null = null;

export function registerAuthBridge(bridge: AuthBridge): void {
  authBridge = bridge;
}

// ---------------------------------------------------------------------------
// Refresh-token queue: concurrent 401s wait behind ONE in-flight refresh call.
// ---------------------------------------------------------------------------
let refreshPromise: Promise<string | null> | null = null;

async function performTokenRefresh(): Promise<string | null> {
  try {
    const refreshToken = await getSecureItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    // Raw client: must not recurse into its own refresh interceptor.
    const response = await axios.post<{ success: boolean; data: { accessToken: string; refreshToken?: string } }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: API_TIMEOUT_MS, headers: { 'Content-Type': 'application/json' } },
    );

    const { accessToken, refreshToken: nextRefresh } = response.data.data;
    await setTokenPair({ accessToken, refreshToken: nextRefresh ?? refreshToken });
    logger.info('auth', 'Token refresh succeeded');
    return accessToken;
  } catch {
    logger.warn('auth', 'Token refresh failed — session expired');
    return null;
  }
}

export function refreshAuthToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      // Release the slot on the next tick so queued callers can await this result first.
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    });
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Refresh is handled manually in the response interceptor.
  validateStatus: status => status >= 200 && status < 300,
});

apiClient.interceptors.request.use(async config => {
  const headers = AxiosHeaders.from(config.headers);
  const accessToken = await getSecureItem('accessToken');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const retriable = config as RetriableRequest;
  if (retriable._idempotencyKey) {
    headers.set('Idempotency-Key', retriable._idempotencyKey);
  }

  if (!IS_PRODUCTION) {
    logger.debug('http', `→ ${config.method?.toUpperCase()} ${config.url}`);
  }

  return { ...config, headers };
});

apiClient.interceptors.response.use(
  response => {
    if (!IS_PRODUCTION) {
      logger.debug('http', `← ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = (error.config ?? {}) as RetriableRequest;
    const status = error.response?.status;

    // Normalize network / timeout failures first.
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw ApiError.timeout(error);
    }
    if (!error.response) {
      throw ApiError.network(error);
    }

    // --- Refresh-token queueing (race-condition safe) ---
    if (status === 401 && !original._retry && !original.skipAuthRefreshRetry) {
      original._retry = true;

      const newToken = await refreshAuthToken();
      if (!newToken) {
        authBridge?.onSessionExpired();
        throw ApiError.unauthorized(strings.errors.unauthorized);
      }

      original.headers = AxiosHeaders.from(original.headers).set(
        'Authorization',
        `Bearer ${newToken}`,
      );
      return apiClient.request(original);
    }

    if (status === 401) {
      authBridge?.onSessionExpired();
    }

    throw normalizeAxiosError(error);
  },
);

function normalizeAxiosError(error: AxiosError): ApiError {
  const payload = error.response?.data;
  const parsed = apiErrorResponseSchema.safeParse(payload);
  const requestId =
    (typeof payload === 'object' && payload !== null && 'requestId' in payload
      ? String((payload as { requestId?: unknown }).requestId)
      : undefined) ??
    (typeof error.response?.headers['x-request-id'] === 'string'
      ? error.response.headers['x-request-id']
      : undefined);

  if (parsed.success) {
    return new ApiError(parsed.data.error.message, {
      code: parsed.data.error.code,
      status: parsed.data.error.status,
      details: parsed.data.error.details,
      requestId: parsed.data.error.requestId ?? requestId,
      cause: error,
    });
  }

  const status = error.response?.status ?? 0;
  const message =
    status >= 500
      ? strings.errors.server
      : status === 404
        ? strings.errors.notFound
        : status === 403
          ? strings.errors.forbidden
          : (error.message || strings.errors.server);

  if (SENTRY_ENABLED && status >= 500) {
    Sentry.captureException(error);
  }

  return new ApiError(message, {
    code: `HTTP_${status}`,
    status,
    requestId,
    cause: error,
  });
}

// ---------------------------------------------------------------------------
// Typed request helpers
// ---------------------------------------------------------------------------
export async function request<T>(
  config: AxiosRequestConfig & ApiRequestOptions,
): Promise<T> {
  const { idempotencyKey, signal, timeoutMs, ...axiosConfig } = config;

  const response = await apiClient.request<
    unknown,
    { data: T; meta?: Record<string, unknown> }
  >({
    ...axiosConfig,
    signal,
    timeout: timeoutMs ?? API_TIMEOUT_MS,
    _idempotencyKey: idempotencyKey,
  } as AxiosRequestConfig);

  return response.data;
}

/** Fetch + validate a JSON payload with a zod schema at the boundary. */
export async function requestValidated<T>(
  config: AxiosRequestConfig & ApiRequestOptions,
  schema: z.ZodType<T>,
): Promise<T> {
  const raw = await request<unknown>(config);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    logger.error('api', 'Response schema mismatch', parsed.error.flatten());
    throw new ApiError('Invalid API response shape', {
      code: 'SCHEMA_MISMATCH',
      status: 0,
      details: parsed.error.flatten(),
    });
  }

  return parsed.data;
}

export async function getValidated<T>(
  url: string,
  schema: z.ZodType<T>,
  options: ApiRequestOptions = {},
): Promise<T> {
  return requestValidated<T>({ method: 'GET', url, ...options }, schema);
}

export function createIdempotencyKey(): string {
  const webCrypto = (globalThis as { crypto?: { randomUUID?: () => string } })
    .crypto;
  if (webCrypto?.randomUUID) {
    return webCrypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export type { ApiResponse };
