import { endSession } from '@features/auth/endSession';

const mockQueryClear = jest.fn();
const mockDisposeSocket = jest.fn();
const mockClearSecureStorage = jest.fn();
const mockClearSession = jest.fn();

jest.mock('@store/queryClient', () => ({
  queryClient: {
    clear: () => mockQueryClear(),
  },
}));

jest.mock('@store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      clearSession: () => mockClearSession(),
    }),
  },
}));

jest.mock('@api/messagingSocket', () => ({
  disposeMessagingSocket: () => mockDisposeSocket(),
}));

jest.mock('@utils/secureStorage', () => ({
  clearSecureStorage: () => mockClearSecureStorage(),
}));

describe('endSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClearSecureStorage.mockResolvedValue(undefined);
  });

  it('clears the query cache, so the next account cannot see this one', async () => {
    await endSession();
    expect(mockQueryClear).toHaveBeenCalled();
  });

  it('drops the realtime socket, which authenticated for the signed-in user', async () => {
    await endSession();
    expect(mockDisposeSocket).toHaveBeenCalled();
  });

  it('clears secure storage, so the dead bearer token cannot be re-sent', async () => {
    await endSession();
    expect(mockClearSecureStorage).toHaveBeenCalled();
  });

  it('ends the session outright rather than only flagging the status', async () => {
    await endSession();
    // `markUnauthenticated` leaves the user object and the token in place.
    expect(mockClearSession).toHaveBeenCalled();
  });

  it('ends the in-memory session even when the keychain cannot be cleared', async () => {
    // A locked or unavailable keychain must not trap the user behind a token
    // the API will keep rejecting.
    mockClearSecureStorage.mockRejectedValue(new Error('keychain locked'));

    await expect(endSession()).resolves.toBeUndefined();
    expect(mockClearSession).toHaveBeenCalled();
  });

  it('never resolves before the session is actually ended', async () => {
    const order: string[] = [];
    mockClearSecureStorage.mockImplementation(async () => {
      order.push('storage');
    });
    mockClearSession.mockImplementation(() => order.push('clearSession'));

    await endSession();

    expect(order).toEqual(['storage', 'clearSession']);
  });
});
