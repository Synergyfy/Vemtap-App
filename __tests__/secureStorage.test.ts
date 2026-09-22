import * as Keychain from 'react-native-keychain';
import {
  clearSecureStorage,
  getSecureItem,
  getTokenPair,
  hasStoredSession,
  setSecureItem,
  setTokenPair,
} from '@utils/secureStorage';

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);
    (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);
  });

  it('stores and reads a secret via Keychain', async () => {
    await setSecureItem('accessToken', 'secret-token');
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'accessToken',
      'secret-token',
      expect.objectContaining({ service: expect.stringContaining('accessToken') }),
    );

    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'accessToken',
      password: 'secret-token',
    });
    await expect(getSecureItem('accessToken')).resolves.toBe('secret-token');
  });

  it('returns null when nothing is stored', async () => {
    await expect(getSecureItem('refreshToken')).resolves.toBeNull();
  });

  it('persists the token pair atomically', async () => {
    await setTokenPair({ accessToken: 'a', refreshToken: 'r' });
    expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(2);
  });

  it('reports session presence', async () => {
    await expect(hasStoredSession()).resolves.toBe(false);
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'accessToken',
      password: 'a',
    });
    await expect(hasStoredSession()).resolves.toBe(true);
  });

  it('reads the token pair', async () => {
    (Keychain.getGenericPassword as jest.Mock)
      .mockResolvedValueOnce({ username: 'accessToken', password: 'a' })
      .mockResolvedValueOnce({ username: 'refreshToken', password: 'r' });
    await expect(getTokenPair()).resolves.toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
  });

  it('wipes every secure key on clear', async () => {
    await clearSecureStorage();
    expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(4);
  });
});
