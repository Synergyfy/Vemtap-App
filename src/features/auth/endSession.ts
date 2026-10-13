import { queryClient } from '@store/queryClient';
import { useAuthStore } from '@store/authStore';
import { disposeMessagingSocket } from '@api/messagingSocket';
import { clearSecureStorage } from '@utils/secureStorage';

/**
 * Tears the session down completely — token, cached data and realtime link.
 *
 * `markUnauthenticated()` on its own only flips a status flag. That is not a
 * logout: the dead bearer token stays in the keychain, so every request the
 * app still makes carries it and 401s again, and the previous account's rows
 * stay in the query cache, which is exactly what a new sign-in must never see.
 * The two manual sign-out paths already do this by hand; this is that teardown
 * in one place so an expiry cannot drift from a sign-out again.
 *
 * The realtime socket is dropped for the same reason. It authenticates once at
 * handshake, so a socket held open past the logout keeps delivering events for
 * a user the app no longer believes is signed in.
 */
export async function endSession(): Promise<void> {
  queryClient.clear();
  disposeMessagingSocket();

  try {
    await clearSecureStorage();
  } catch {
    // A locked or unavailable keychain must not trap the user behind a dead
    // token: the in-memory session still ends, and the next request will 401
    // into this path again rather than silently succeeding.
  } finally {
    useAuthStore.getState().clearSession();
  }
}
