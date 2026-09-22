import * as SecureStore from 'expo-secure-store';
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
    jest.resetAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('stores and reads a secret via SecureStore', async () => {
    await setSecureItem('accessToken', 'secret-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      expect.stringContaining('accessToken'),
      'secret-token',
      expect.objectContaining({
        keychainService: expect.stringContaining('secure'),
      }),
    );

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('secret-token');
    await expect(getSecureItem('accessToken')).resolves.toBe('secret-token');
  });

  it('returns null when nothing is stored', async () => {
    await expect(getSecureItem('refreshToken')).resolves.toBeNull();
  });

  it('persists the token pair atomically', async () => {
    await setTokenPair({ accessToken: 'a', refreshToken: 'r' });
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
  });

  it('reports session presence', async () => {
    await expect(hasStoredSession()).resolves.toBe(false);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('a');
    await expect(hasStoredSession()).resolves.toBe(true);
  });

  it('reads the token pair', async () => {
    (SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce('a')
      .mockResolvedValueOnce('r');
    await expect(getTokenPair()).resolves.toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
  });

  it('wipes every secure key on clear', async () => {
    await clearSecureStorage();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(4);
  });
});
