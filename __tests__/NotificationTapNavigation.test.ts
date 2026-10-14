import {
  openNotificationUrl,
  hasPendingNotificationTap,
  clearPendingNotificationTap,
} from '@services/notificationTaps';

/**
 * A tap read during boot can land before the navigation container exists. The
 * container going live is not directly observable in react-navigation 7 (there
 * is no `onReady`), so these tests drive the state listener the fix uses and
 * pin the three outcomes: navigated now, parked until it can, or dropped
 * because there is nowhere for it to go.
 */

const mockNavigate = jest.fn();
const mockIsReady = jest.fn();
const mockGetRootState = jest.fn();
const mockAddListener = jest.fn();
const mockRemoveListener = jest.fn();

jest.mock('@navigation/navigationRef', () => ({
  navigationRef: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
    isReady: () => mockIsReady(),
    getRootState: () => mockGetRootState(),
    addListener: (...args: unknown[]) => mockAddListener(...args),
    removeListener: (...args: unknown[]) => mockRemoveListener(...args),
  },
}));

const authState: { status: string; activeMode: 'customer' | 'business' } = {
  status: 'authenticated',
  activeMode: 'customer',
};

jest.mock('@store/authStore', () => ({
  useAuthStore: { getState: () => authState },
}));

/** The state callback the fix registers, captured from mockAddListener. */
const stateListener = () => {
  const call = mockAddListener.mock.calls.find(([event]) => event === 'state');
  return call?.[1] as (() => void) | undefined;
};

const ready = (routes = ['AppStack', 'BusinessTabs']) => {
  mockIsReady.mockReturnValue(true);
  mockGetRootState.mockReturnValue({ routes: routes.map(name => ({ name })) });
};

const booting = () => {
  mockIsReady.mockReturnValue(false);
  mockGetRootState.mockReturnValue(undefined);
};

beforeEach(() => {
  jest.clearAllMocks();
  clearPendingNotificationTap();
  authState.status = 'authenticated';
  authState.activeMode = 'customer';
  // mockAddListener's teardown, as the real ref returns.
  mockAddListener.mockReturnValue(jest.fn());
});

describe('openNotificationUrl', () => {
  it('navigates immediately when the container is ready', () => {
    ready();

    expect(openNotificationUrl('/orders/order-1')).toBe(true);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      'AppStack',
      expect.objectContaining({ screen: 'Tabs' }),
    );
    expect(hasPendingNotificationTap()).toBe(false);
  });

  /**
   * The regression: a cold launch reads the tap while the app is still mounting,
   * and dropping it there meant the same notification deep-linked on a fast
   * device and did nothing on a slow one.
   */
  it('parks the tap while navigation is still booting', () => {
    booting();

    expect(openNotificationUrl('/orders/order-1')).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(hasPendingNotificationTap()).toBe(true);
    expect(mockAddListener).toHaveBeenCalledWith('state', expect.any(Function));
  });

  it('replays the parked tap once navigation is ready', () => {
    booting();
    openNotificationUrl('/orders/order-1');

    ready();
    stateListener()?.();

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(hasPendingNotificationTap()).toBe(false);
  });

  it('detaches its listener once the parked tap lands', () => {
    booting();
    openNotificationUrl('/orders/order-1');

    const teardown = mockAddListener.mock.results[0].value;
    ready();
    stateListener()?.();

    expect(teardown).toHaveBeenCalled();
  });

  it('keeps waiting while authenticated but the container has not settled', () => {
    booting();
    openNotificationUrl('/messages/thread-1');

    // Ready, but the root stack has not mounted AppStack yet.
    mockIsReady.mockReturnValue(true);
    mockGetRootState.mockReturnValue({ routes: [{ name: 'AuthStack' }] });
    stateListener()?.();

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(hasPendingNotificationTap()).toBe(true);
  });

  it('subscribes once however many times an early tap arrives', () => {
    booting();
    openNotificationUrl('/orders/order-1');
    openNotificationUrl('/messages/thread-2');

    expect(mockAddListener).toHaveBeenCalledTimes(1);
    // The newer tap is the one that should win.
    ready();
    stateListener()?.();
    expect(mockNavigate).toHaveBeenCalledWith(
      'AppStack',
      expect.objectContaining({
        screen: 'Tabs',
        params: expect.objectContaining({ screen: 'Account' }),
      }),
    );
  });

  /**
   * The signed-out decision: parking until sign-in would open the *new*
   * account's screen from the previous account's notification.
   */
  it('drops the tap when there is no session to land it in', () => {
    authState.status = 'unauthenticated';
    booting();

    expect(openNotificationUrl('/orders/order-1')).toBe(false);
    expect(hasPendingNotificationTap()).toBe(false);
    expect(mockAddListener).not.toHaveBeenCalled();
  });

  it('does not navigate a business tap onto the consumer stack', () => {
    authState.activeMode = 'business';
    ready();

    openNotificationUrl('/orders/order-1');

    expect(mockNavigate).toHaveBeenCalledWith(
      'BusinessTabs',
      expect.objectContaining({ screen: 'BusinessOrders' }),
    );
  });

  it('ignores a url with no in-app destination', () => {
    ready();

    expect(openNotificationUrl('/dashboard/settings/subscription')).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockAddListener).not.toHaveBeenCalled();
  });

  it('ignores an empty payload', () => {
    ready();

    expect(openNotificationUrl(undefined)).toBe(false);
    expect(openNotificationUrl('')).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('supersedes a parked tap with a fresh navigable one', () => {
    booting();
    openNotificationUrl('/orders/order-1');

    ready();
    openNotificationUrl('/messages/thread-9');

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(hasPendingNotificationTap()).toBe(false);
  });
});
