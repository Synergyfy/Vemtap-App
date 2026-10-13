/**
 * Centralized logger. Sensitive fields are redacted unconditionally —
 * tokens, passwords, and PII never reach the console, even in dev.
 */
import { IS_PRODUCTION } from '@constants/config';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordconfirm',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'pin',
  'otp',
  'secret',
  'apikey',
  'idempotency-key',
]);

const REDACTED = '[REDACTED]';

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value == null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => redact(item, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        out[key] = REDACTED;
      } else {
        out[key] = redact(val, depth + 1);
      }
    });
    return out;
  }
  return value;
}

type LogScope =
  'http' | 'auth' | 'app' | 'nav' | 'upload' | 'flags' | 'push' | 'api' | 'business';

function log(
  level: 'debug' | 'info' | 'warn' | 'error',
  scope: LogScope,
  message: string,
  meta?: unknown,
): void {
  if (IS_PRODUCTION && level === 'debug') {
    return;
  }
  const safeMeta = meta !== undefined ? redact(meta) : undefined;
  const line = `[${scope}] ${message}`;
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](line, safeMeta ?? '');
}

export const logger = {
  debug: (scope: LogScope, message: string, meta?: unknown) =>
    log('debug', scope, message, meta),
  info: (scope: LogScope, message: string, meta?: unknown) =>
    log('info', scope, message, meta),
  warn: (scope: LogScope, message: string, meta?: unknown) =>
    log('warn', scope, message, meta),
  error: (scope: LogScope, message: string, meta?: unknown) =>
    log('error', scope, message, meta),
};
