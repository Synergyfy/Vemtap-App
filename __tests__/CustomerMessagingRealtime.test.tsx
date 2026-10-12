import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useCustomerMessagingRealtime } from '@features/merchantChat/hooks/useCustomerMessagingRealtime';
import {
  customerMessagingKeys,
  markCustomerThreadReadLocally,
  threadCategoriesFor,
  useMarkCustomerThreadRead,
} from '@features/merchantChat/hooks/useCustomerMessaging';
import { messagingApi } from '@api/messagingApi';
import { queryClient } from '@store/queryClient';
import type { ConversationThread } from '@api/messagingApi';

/**
 * The customer-side bridge turns socket events into cache writes.
 *
 * Two behaviours are load-bearing and easy to regress: an inbound message in the
 * thread the customer is *reading* must be appended rather than merely
 * invalidated, and the row's `customerUnreadCount` must be bumped so the
 * "Unread" chip and the badge agree with the server.
 */

/**
 * Holders the hoisted `jest.mock` factory below is allowed to close over.
 * `getActiveMessagingThread` is read at call time so a test can change which
 * thread the customer is reading mid-flight.
 */
const mockSocketState: { current: unknown } = { current: null };
const mockActiveThreadState: { current: string | null } = { current: null };

jest.mock('@api/messagingSocket', () => ({
  connectMessagingSocket: jest.fn(async () => mockSocketState.current),
  disconnectMessagingSocket: jest.fn(),
  disposeMessagingSocket: jest.fn(),
  getActiveMessagingThread: jest.fn(() => mockActiveThreadState.current),
  joinMessagingThread: jest.fn(),
  leaveMessagingThread: jest.fn(),
  markMessagingDelivered: jest.fn(),
  markMessagingRead: jest.fn(),
}));
jest.mock('@hooks/useAppState', () => ({
  useAppState: jest.fn(),
}));

// Deliberately NOT mocked: the bridge writes through this shared client, so the
// test seeds and asserts against the same one.
const { markMessagingRead, markMessagingDelivered } = jest.requireMock(
  '@api/messagingSocket',
) as {
  markMessagingRead: jest.Mock;
  markMessagingDelivered: jest.Mock;
};

let socketHandlers: Record<string, (payload: unknown) => void> = {};

const thread: ConversationThread = {
  id: 'thread-1',
  subjectType: 'BOOKING',
  categories: ['bookings'],
  customerUnreadCount: 0,
  lastMessageContent: 'Table for Friday please',
  channel: 'IN_HOUSE',
  status: 'OPEN',
  branchUnreadCount: 0,
  branchId: 'branch-1',
};

const inboundMessage = {
  id: 'msg-1',
  threadId: 'thread-1',
  content: 'Confirmed, see you Friday',
  direction: 'INBOUND',
};

function setup() {
  queryClient.setQueryData(customerMessagingKeys.threads(), [thread]);
  renderHook(() => useCustomerMessagingRealtime());
}

beforeEach(() => {
  jest.clearAllMocks();
  queryClient.clear();
  socketHandlers = {};
  mockActiveThreadState.current = null;
  mockSocketState.current = {
    connected: true,
    on: (event: string, handler: (payload: unknown) => void) => {
      socketHandlers[event] = handler;
    },
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
});

afterAll(() => {
  // The shared client's 24h gcTime schedules a GC timer per cached entry, which
  // would keep jest's process alive after the suite finishes.
  queryClient.clear();
});

const emit = async (event: string, payload: unknown) => {
  await act(async () => {
    socketHandlers[event]?.(payload);
    await Promise.resolve();
  });
};

const threads = (): ConversationThread[] | undefined =>
  queryClient.getQueryData<ConversationThread[]>(customerMessagingKeys.threads());

const threadRow = (): ConversationThread | undefined =>
  threads()?.find(item => item.id === 'thread-1');

const openThreadMessages = (): unknown[] | undefined =>
  queryClient.getQueryData<unknown[]>(customerMessagingKeys.messages(null, 'thread-1'));

test('binds the socket events once connected', async () => {
  setup();

  await waitFor(() => {
    expect(socketHandlers.newMessage).toBeDefined();
    expect(socketHandlers.notification).toBeDefined();
    expect(socketHandlers.threadDeleted).toBeDefined();
  });
});

test('an inbound message in the open thread is appended and marked read', async () => {
  mockActiveThreadState.current = 'thread-1';
  setup();

  await waitFor(() => expect(socketHandlers.newMessage).toBeDefined());
  await emit('newMessage', inboundMessage);

  // Appended straight into the open conversation rather than left for a refetch
  // the customer would experience as a delayed message.
  expect(openThreadMessages()).toHaveLength(1);
  expect(openThreadMessages()?.[0]).toMatchObject({
    content: 'Confirmed, see you Friday',
  });
  // …and reported read immediately, so the unread badge never blinks.
  expect(markMessagingRead).toHaveBeenCalledWith('thread-1', ['msg-1']);
  // Delivered receipts belong to threads the customer is not reading.
  expect(markMessagingDelivered).not.toHaveBeenCalled();
});

test('the row gains the unread category when a message arrives elsewhere', async () => {
  mockActiveThreadState.current = null;
  setup();

  await waitFor(() => expect(socketHandlers.newMessage).toBeDefined());
  await emit('newMessage', inboundMessage);

  const row = threadRow();
  expect(row?.customerUnreadCount).toBe(1);
  expect(row?.lastMessageContent).toBe('Confirmed, see you Friday');
  // Unread is additive — the booking topic survives the unread flag.
  expect(row?.categories).toEqual(['unread', 'bookings']);
  expect(markMessagingDelivered).toHaveBeenCalledWith('msg-1', 'thread-1');
});

test('a customer-sent message does not raise the unread count', async () => {
  mockActiveThreadState.current = null;
  setup();

  await waitFor(() => expect(socketHandlers.newMessage).toBeDefined());
  await emit('newMessage', { ...inboundMessage, direction: 'OUTBOUND' });

  expect(threadRow()?.customerUnreadCount).toBe(0);
  expect(threadRow()?.categories).toEqual(['bookings']);
});

test('a deleted thread evicts its message cache', async () => {
  setup();
  queryClient.setQueryData(customerMessagingKeys.messages(null, 'thread-1'), [
    inboundMessage,
  ]);

  await waitFor(() => expect(socketHandlers.threadDeleted).toBeDefined());
  await emit('threadDeleted', { threadId: 'thread-1' });

  expect(openThreadMessages()).toBeUndefined();
});

test('a notification payload carrying a message patches the row', async () => {
  mockActiveThreadState.current = null;
  setup();

  await waitFor(() => expect(socketHandlers.notification).toBeDefined());
  await emit('notification', { type: 'new_message', message: inboundMessage });

  expect(threadRow()?.customerUnreadCount).toBe(1);
});

test('an incoming message update rewrites the stored message', async () => {
  setup();
  queryClient.setQueryData(customerMessagingKeys.messages(null, 'thread-1'), [
    inboundMessage,
  ]);

  await waitFor(() => expect(socketHandlers.messageUpdate).toBeDefined());
  await emit('messageUpdate', {
    id: 'msg-1',
    threadId: 'thread-1',
    content: 'Confirmed, see you Sunday',
  });

  expect(openThreadMessages()?.[0]).toMatchObject({
    content: 'Confirmed, see you Sunday',
  });
});

describe('markCustomerThreadReadLocally', () => {
  const unreadThread: ConversationThread = {
    ...thread,
    subjectType: 'BOOKING',
    categories: ['unread', 'bookings'],
    customerUnreadCount: 3,
  };

  beforeEach(() => {
    queryClient.clear();
  });

  test('clears the badge and drops the row out of the Unread chip', () => {
    queryClient.setQueryData(customerMessagingKeys.threads(), [unreadThread]);

    markCustomerThreadReadLocally('thread-1');

    const rows = queryClient.getQueryData<ConversationThread[]>(
      customerMessagingKeys.threads(),
    );
    expect(rows?.[0]?.customerUnreadCount).toBe(0);
    // The unread badge and the Unread *filter* are the same piece of state, so
    // the row has to leave the chip as well as lose its count.
    expect(rows?.[0]?.categories).not.toContain('unread');
    // Still a booking, though: reading a thread must not re-file it.
    expect(rows?.[0]?.categories).toContain('bookings');
  });

  test('leaves other threads untouched', () => {
    const other = { ...unreadThread, id: 'thread-2' };
    queryClient.setQueryData(customerMessagingKeys.threads(), [
      unreadThread,
      other,
    ]);

    markCustomerThreadReadLocally('thread-1');

    const rows = queryClient.getQueryData<ConversationThread[]>(
      customerMessagingKeys.threads(),
    );
    expect(rows?.[0]?.customerUnreadCount).toBe(0);
    expect(rows?.[1]?.customerUnreadCount).toBe(3);
    expect(rows?.[1]?.categories).toContain('unread');
  });

  test('is idempotent, so re-opening a read thread does not churn the cache', () => {
    queryClient.setQueryData(customerMessagingKeys.threads(), [
      { ...unreadThread, customerUnreadCount: 0, categories: ['bookings'] },
    ]);
    const key = customerMessagingKeys.threads();
    const before = queryClient.getQueryData(key);

    markCustomerThreadReadLocally('thread-1');

    // Same object identity: an already-read row is returned untouched.
    expect(queryClient.getQueryData(key)).toBe(before);
  });

  test('is a no-op when the threads list is not cached yet', () => {
    expect(() => markCustomerThreadReadLocally('thread-1')).not.toThrow();
    expect(queryClient.getQueryData(customerMessagingKeys.threads())).toBeUndefined();
  });
});

describe('threadCategoriesFor', () => {
  test('files a deal claim under deals, never bookings', () => {
    expect(threadCategoriesFor({ ...thread, subjectType: 'CLAIM' }, 1)).toEqual([
      'unread',
      'deals',
    ]);
  });

  test('drops the unread chip once the count reaches zero', () => {
    expect(threadCategoriesFor({ ...thread, subjectType: 'BOOKING' }, 0)).toEqual([
      'bookings',
    ]);
  });
});

/**
 * `useMutation` resolves its client from context, so the provider is required.
 * A fresh client per render keeps a mutation's cache writes from leaking into
 * the shared one the other suites in this file assert against.
 */
function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useMarkCustomerThreadRead', () => {
  beforeEach(() => {
    queryClient.clear();
    jest
      .spyOn(messagingApi, 'markCustomerThreadRead')
      .mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('clears the unread state on success so the server count cannot win the race', async () => {
    const unread = {
      ...thread,
      categories: ['unread', 'bookings'],
      customerUnreadCount: 2,
    };
    queryClient.setQueryData(customerMessagingKeys.threads(), [unread]);

    const { result } = await renderHook(() => useMarkCustomerThreadRead(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('thread-1');
    });

    expect(messagingApi.markCustomerThreadRead).toHaveBeenCalledWith('thread-1');
    const rows = queryClient.getQueryData<ConversationThread[]>(
      customerMessagingKeys.threads(),
    );
    // The local patch runs in onSuccess too, so the badge is correct whether or
    // not the invalidation's refetch has landed yet.
    expect(rows?.[0]?.customerUnreadCount).toBe(0);
    expect(rows?.[0]?.categories).not.toContain('unread');
  });

  test('leaves the badge alone when the server rejects the clear', async () => {
    const unread = {
      ...thread,
      categories: ['unread', 'bookings'],
      customerUnreadCount: 2,
    };
    queryClient.setQueryData(customerMessagingKeys.threads(), [unread]);
    jest
      .spyOn(messagingApi, 'markCustomerThreadRead')
      .mockRejectedValue(new Error('nope') as never);

    const { result } = await renderHook(() => useMarkCustomerThreadRead(), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync('thread-1')).rejects.toThrow('nope');
    });

    // A failed clear must not look like a read one — the screen already patched
    // optimistically, but the refetch must be free to restore the truth.
    expect(queryClient.getQueryData(customerMessagingKeys.threads())).toEqual([
      unread,
    ]);
  });
});
