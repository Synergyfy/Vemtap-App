import { notificationsApi } from '@api/notificationsApi';

/**
 * Token registration is the only thing that makes the app reachable while it is
 * closed. The backend stores an Expo token per device and answers 404-free
 * upserts, so what matters here is that the request carries the shape its DTO
 * expects — a missing `transport` would be inferred, but a missing `token` is a
 * 400 and the address is never written down.
 */
const mockRequest = jest.fn();

jest.mock('@api/client', () => ({
  ...jest.requireActual('@api/client'),
  requestValidated: (...args: unknown[]) => mockRequest(...args),
}));

const lastRequest = () => mockRequest.mock.calls[mockRequest.mock.calls.length - 1][0];

describe('notificationsApi push tokens', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue(undefined);
  });

  it('posts the token with the expo transport', async () => {
    await notificationsApi.registerPushToken('ExponentPushToken[abc]');

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(lastRequest()).toMatchObject({
      method: 'POST',
      url: '/notifications/push-token',
      data: { token: 'ExponentPushToken[abc]', transport: 'expo' },
    });
  });

  it('sends the platform when it is known', async () => {
    await notificationsApi.registerPushToken('ExponentPushToken[abc]', {
      platform: 'ios',
    });

    expect(lastRequest().data).toEqual({
      token: 'ExponentPushToken[abc]',
      transport: 'expo',
      platform: 'ios',
    });
  });

  it('omits the platform rather than sending null', async () => {
    await notificationsApi.registerPushToken('ExponentPushToken[abc]');

    expect(lastRequest().data).not.toHaveProperty('platform');
  });

  it('keeps the platform out of the request options', async () => {
    // `platform` is payload, not transport config — leaking it into the axios
    // config would send an unknown top-level field.
    await notificationsApi.registerPushToken('ExponentPushToken[abc]', {
      platform: 'android',
      timeoutMs: 5_000,
    });

    const config = lastRequest();
    expect(config.platform).toBeUndefined();
    expect(config.timeoutMs).toBe(5_000);
  });

  it('clears every device when no token is given', async () => {
    await notificationsApi.clearPushToken();

    expect(lastRequest()).toMatchObject({
      method: 'DELETE',
      url: '/notifications/push-token',
      data: {},
    });
  });

  it('clears a single device when one is named', async () => {
    await notificationsApi.clearPushToken('ExponentPushToken[abc]');

    expect(lastRequest().data).toEqual({ token: 'ExponentPushToken[abc]' });
  });
});
