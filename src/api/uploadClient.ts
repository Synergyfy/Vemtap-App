/**
 * Multipart upload client — intentionally decoupled from the JSON API client
 * (no auth-refresh interception, different timeout, progress tracking).
 */
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
import {
  API_BASE_URL,
  API_CONFIG_HINT,
  API_TIMEOUT_MS,
  IS_API_CONFIGURED,
} from '@constants/config';
import { ApiError } from '@api/ApiError';
import { getSecureItem } from '@utils/secureStorage';
import { logger } from '@utils/logger';

const UPLOAD_TIMEOUT_MS = Number(API_TIMEOUT_MS) * 4;

export const uploadClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: UPLOAD_TIMEOUT_MS,
  headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
});

uploadClient.interceptors.request.use(async config => {
  if (!IS_API_CONFIGURED) {
    throw new ApiError(API_CONFIG_HINT ?? 'API base URL is not configured', {
      code: 'API_NOT_CONFIGURED',
      status: 0,
    });
  }

  const headers = AxiosHeaders.from(config.headers);
  const accessToken = await getSecureItem('accessToken');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return { ...config, headers };
});

uploadClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // Keep our own errors (e.g. API_NOT_CONFIGURED) instead of flattening them
    // into a generic transport failure.
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.code === 'ECONNABORTED') {
      throw ApiError.timeout(error);
    }
    if (!error.response) {
      throw ApiError.network(error);
    }
    throw new ApiError(
      typeof error.response.data === 'object' &&
        error.response.data &&
        'message' in error.response.data
        ? String((error.response.data as { message: string }).message)
        : 'Upload failed',
      {
        code: `UPLOAD_${error.response.status}`,
        status: error.response.status,
        cause: error,
      },
    );
  },
);

export interface UploadOptions {
  url: string;
  fileUri: string;
  fileName: string;
  mimeType?: string;
  fieldName?: string;
  additionalFields?: Record<string, string>;
  onProgress?: (fraction: number, loaded: number, total: number) => void;
  signal?: AbortSignal;
}

export interface UploadResult<T> {
  data: T;
}

export async function uploadFile<T>(options: UploadOptions): Promise<UploadResult<T>> {
  const {
    url,
    fileUri,
    fileName,
    mimeType = 'application/octet-stream',
    fieldName = 'file',
    additionalFields = {},
    onProgress,
    signal,
  } = options;

  const form = new FormData();
  form.append(fieldName, {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  Object.entries(additionalFields).forEach(([key, value]) => {
    form.append(key, value);
  });

  const config: AxiosRequestConfig = {
    method: 'POST',
    url,
    data: form,
    signal,
    timeout: UPLOAD_TIMEOUT_MS,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: progressEvent => {
      const total = progressEvent.total ?? 0;
      const loaded = progressEvent.loaded ?? 0;
      const fraction = total > 0 ? loaded / total : 0;
      if (__DEV__) {
        logger.debug('upload', `${fieldName} ${(fraction * 100).toFixed(0)}%`);
      }
      onProgress?.(fraction, loaded, total);
    },
  };

  const response = await uploadClient.request<unknown, { data: T }>(config);
  return { data: response.data };
}
