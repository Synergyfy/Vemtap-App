import { normalizeWebsocketOrigin, resolveApiBaseUrl } from '@constants/apiConfig';

/**
 * Guards the failure that produced a bare "Network request failed" on an
 * installed Android build: `EXPO_PUBLIC_API_BASE_URL` is inlined at build time,
 * so a build made without it must fail loudly instead of quietly calling a host
 * with no DNS record.
 */
describe('api base url resolution', () => {
  it('builds the versioned base url when the env var is inlined', () => {
    const resolved = resolveApiBaseUrl('https://testapi.vemtap.com', 'v1', 'development');

    expect(resolved.configured).toBe(true);
    expect(resolved.baseUrl).toBe('https://testapi.vemtap.com/v1');
    expect(resolved.hint).toBeUndefined();
  });

  it('never guesses a host when the build inlined nothing', () => {
    const resolved = resolveApiBaseUrl(undefined, 'v1', 'production');

    expect(resolved.configured).toBe(false);
    expect(resolved.baseUrl).toBe('');
    expect(resolved.hint).toContain('EXPO_PUBLIC_API_BASE_URL');
  });

  it('treats blank values as unconfigured and strips trailing slashes', () => {
    expect(resolveApiBaseUrl('   ', 'v1', 'development').configured).toBe(false);
    expect(
      resolveApiBaseUrl('https://api.vemtap.com///', 'v1', 'development').baseUrl,
    ).toBe('https://api.vemtap.com/v1');
  });

  it('defaults the version when none is inlined', () => {
    expect(
      resolveApiBaseUrl('https://api.vemtap.com', undefined, 'development').baseUrl,
    ).toBe('https://api.vemtap.com/v1');
  });
});

describe('api client guard', () => {
  const originalBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = originalBaseUrl;
    }
    jest.resetModules();
  });

  it('keeps a descriptive code instead of flattening it to a transport error', async () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    jest.resetModules();

    /* eslint-disable global-require -- a fresh registry is the point: these
       modules read the env at load time, so they must be required after the
       reset. Scoped to a block rather than `disable-next-line` because prettier
       wraps the assignment and would strand the comment on the wrong line. */
    const clientModule = require('@api/client') as typeof import('@api/client');
    // Same fresh registry as the client, so `instanceof` compares like with like.
    const { ApiError: FreshApiError } =
      require('@api/ApiError') as typeof import('@api/ApiError');
    /* eslint-enable global-require */

    await expect(clientModule.apiClient.get('/auth/login')).rejects.toBeInstanceOf(
      FreshApiError,
    );
    await expect(clientModule.apiClient.get('/auth/login')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'API_NOT_CONFIGURED',
      status: 0,
    });
  });

  it('is a no-op when the base url is configured', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://testapi.vemtap.com';
    jest.resetModules();

    // eslint-disable-next-line global-require
    const clientModule = require('@api/client') as typeof import('@api/client');

    expect(clientModule.apiClient.defaults.baseURL).toBe('https://testapi.vemtap.com/v1');
  });
});

/**
 * WebSocket gateways are registered by NestJS at the server root — the global
 * prefix applies to HTTP routes only. A base URL that carries a path prefix
 * (a deployment mounting the API under `/api`) would therefore dial a namespace
 * that does not exist, which Socket.IO reports as "Invalid namespace".
 */
describe('websocket origin', () => {
  it('drops a path prefix so gateways are reached at the server root', () => {
    expect(normalizeWebsocketOrigin('https://testapi.vemtap.com/api')).toBe(
      'https://testapi.vemtap.com',
    );
    expect(normalizeWebsocketOrigin('http://localhost:3002/api')).toBe(
      'http://localhost:3002',
    );
  });

  it('still exposes a websocket origin from resolveApiBaseUrl', () => {
    const resolved = resolveApiBaseUrl(
      'http://192.168.1.67:3002/api',
      'v1',
      'development',
    );

    expect(resolved.baseUrl).toBe('http://192.168.1.67:3002/api/v1');
    expect(resolved.websocketOrigin).toBe('http://192.168.1.67:3002');
  });

  it('leaves a bare host untouched', () => {
    expect(normalizeWebsocketOrigin('https://api.vemtap.com')).toBe(
      'https://api.vemtap.com',
    );
    expect(normalizeWebsocketOrigin('http://localhost:3002/api/')).toBe(
      'http://localhost:3002',
    );
  });

  it('is empty when nothing was configured', () => {
    expect(normalizeWebsocketOrigin('')).toBe('');
    expect(resolveApiBaseUrl(undefined, 'v1', 'production').websocketOrigin).toBe('');
  });
});
