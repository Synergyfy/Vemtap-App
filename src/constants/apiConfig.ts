/**
 * API endpoint resolution.
 *
 * `EXPO_PUBLIC_*` values are inlined into the JS bundle at build time by
 * babel-preset-expo — they are NOT read from the device at runtime. A native
 * build produced without `EXPO_PUBLIC_API_BASE_URL` therefore leaves the app
 * with nothing to call. Guessing a host in that case is worse than failing:
 * pointing at a domain with no DNS record surfaces only as axios'
 * "Network request failed", which reads like a connectivity fault instead of a
 * build-config fault.
 *
 * Kept free of `process.env` so the resolution rules are directly testable.
 */

export interface ResolvedApiBaseUrl {
  /** The host portion, normalized (no trailing slash). */
  origin: string;
  /** `origin/version`, or an empty string when unconfigured. */
  baseUrl: string;
  version: string;
  /** False when the build inlined no usable base URL. */
  configured: boolean;
  /** User-facing explanation when `configured` is false. */
  hint?: string;
  /**
   * `scheme://host:port` with every path dropped — where WebSocket gateways
   * live. `origin` may carry a path (a deployment that mounts the API under
   * `/api`), but NestJS applies the global prefix to HTTP routes only, so a
   * gateway is always at the server root. Using `origin` for a socket URL is
   * what produced `Invalid namespace`: the client dialled `/api/messaging`
   * while the server only registered `/messaging`.
   */
  websocketOrigin: string;
}

export function normalizeApiOrigin(raw: string): string {
  return raw.trim().replace(/\/+$/, '');
}

/**
 * Strips any path, query and fragment, leaving `scheme://host[:port]`.
 * Falls back to `origin` for a value too malformed to parse, so a socket URL
 * is never silently left empty.
 */
export function normalizeWebsocketOrigin(rawBaseUrl: string): string {
  const trimmed = rawBaseUrl.trim();
  if (!trimmed) return '';
  const match = /^([a-z][a-z0-9+.-]*:\/\/[^/?#]+)/i.exec(trimmed);
  return (match ? match[1] : trimmed).replace(/\/+$/, '');
}

export function resolveApiBaseUrl(
  rawBaseUrl: string | undefined,
  rawVersion: string | undefined,
  appEnv: string,
): ResolvedApiBaseUrl {
  const origin = normalizeApiOrigin(rawBaseUrl ?? '');
  const version = rawVersion?.trim() || 'v1';

  if (!origin) {
    return {
      origin: '',
      baseUrl: '',
      version,
      configured: false,
      hint: `API base URL is not configured. Rebuild with EXPO_PUBLIC_API_BASE_URL set (current EXPO_PUBLIC_APP_ENV: ${appEnv}).`,
      websocketOrigin: '',
    };
  }

  return {
    origin,
    baseUrl: `${origin}/${version}`,
    version,
    configured: true,
    websocketOrigin: normalizeWebsocketOrigin(origin),
  };
}
