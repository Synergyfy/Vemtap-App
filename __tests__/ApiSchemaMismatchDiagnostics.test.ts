import { ApiError } from '@api/ApiError';
import { logger } from '@utils/logger';
import { requestValidated } from '@api/client';

const mockRequest = jest.fn();

jest.mock('axios', () => {
  // The client registers request/response interceptors on the instance at import
  // time, so the stub has to answer those as well as `request`. `request`
  // delegates rather than holding the reference: the mock factory runs while the
  // import above it is still being evaluated, so `mockRequest` is not yet bound.
  const instance = {
    request: (...args: unknown[]) => mockRequest(...args),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  const create = jest.fn(() => instance);
  create.isAxiosError = jest.fn(() => false);
  create.AxiosError = class extends Error {};
  return { __esModule: true, default: { create }, isAxiosError: () => false };
});

jest.mock('@utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

/**
 * A schema mismatch used to be reported as `error.flatten()` alone. That output
 * is identical for every schema that rejects at the root — a union taking the
 * wrong branch, or a primitive handed an object — so the log line said nothing
 * about which request had failed and nobody could tell which schema to widen.
 * These tests pin the method and path back onto the error.
 */
describe('requestValidated diagnostics', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    (logger.error as jest.Mock).mockReset();
  });

  const failingSchema = {
    safeParse: () => ({
      success: false,
      error: {
        flatten: () => ({ fieldErrors: {}, formErrors: ['Invalid input'] }),
        issues: [],
      },
    }),
  } as never;

  it('names the method and path on the thrown error', async () => {
    mockRequest.mockResolvedValue({ data: 5 });

    await expect(
      requestValidated({ method: 'GET', url: '/notifications/unread-count' }, failingSchema),
    ).rejects.toMatchObject({
      code: 'SCHEMA_MISMATCH',
      details: expect.objectContaining({
        method: 'GET',
        url: '/notifications/unread-count',
      }),
    });
  });

  it('puts the request in the log line, where the flattened issues were ambiguous', async () => {
    mockRequest.mockResolvedValue({ data: 5 });

    await expect(
      requestValidated({ method: 'GET', url: '/notifications/unread-count' }, failingSchema),
    ).rejects.toBeInstanceOf(ApiError);

    const [scope, message, payload] = (logger.error as jest.Mock).mock.calls[0];
    expect(scope).toBe('api');
    expect(message).toContain('GET /notifications/unread-count');
    // The flattened payload is preserved and the raw issues ride along — they
    // are what distinguish one union failure from another.
    expect(payload).toEqual(
      expect.objectContaining({
        fieldErrors: {},
        formErrors: ['Invalid input'],
        issues: [],
      }),
    );
  });

  it('defaults a missing method to GET rather than logging "undefined"', async () => {
    mockRequest.mockResolvedValue({ data: 5 });

    await expect(requestValidated({ url: '/notifications' }, failingSchema)).rejects.toMatchObject({
      details: expect.objectContaining({ method: 'GET', url: '/notifications' }),
    });
  });

  it('returns the parsed value untouched when the response matches', async () => {
    mockRequest.mockResolvedValue({ data: 42 });
    const passingSchema = {
      safeParse: (v: unknown) => ({ success: true, data: v }),
    } as never;

    await expect(
      requestValidated({ method: 'GET', url: '/notifications/unread-count' }, passingSchema),
    ).resolves.toBe(42);
    expect(logger.error).not.toHaveBeenCalled();
  });
});