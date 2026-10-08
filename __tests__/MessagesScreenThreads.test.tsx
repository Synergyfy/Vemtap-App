import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MessagesScreen } from '@features/merchantChat/screens/MessagesScreen';
import { strings } from '@constants/strings';

const mockThreads = jest.fn();

jest.mock('@features/merchantChat/hooks/useCustomerMessaging', () => ({
  ...jest.requireActual('@features/merchantChat/hooks/useCustomerMessaging'),
  useCustomerThreads: () => mockThreads(),
}));

const copy = strings.messagesHub;

function thread(overrides: Record<string, unknown> = {}) {
  return {
    id: 'thread-1',
    business: { name: 'Urban Grill & Bistro' },
    branch: { address: 'Apo Boulevard, Abuja' },
    lastMessageContent: 'Your table is reserved for 2:30 PM.',
    lastActivityAt: new Date().toISOString(),
    customerUnreadCount: 0,
    ...overrides,
  };
}

function mockWith(data: unknown[]) {
  mockThreads.mockReturnValue({
    isLoading: false,
    isError: false,
    data,
    refetch: jest.fn(),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockThreads.mockReturnValue({
    isLoading: true,
    isError: false,
    data: undefined,
    refetch: jest.fn(),
  });
});

test('shows a loading state while threads fetch', async () => {
  await render(<MessagesScreen />);

  expect(screen.getByText(strings.common.loading)).toBeTruthy();
});

test('renders live threads with unread badge on pill, chip and card', async () => {
  mockWith([
    thread({ id: 't1', customerUnreadCount: 3 }),
    thread({
      id: 't2',
      business: { name: 'Glow Serenity Spa' },
      lastMessageContent: 'See you tomorrow!',
    }),
  ]);

  await render(<MessagesScreen />);

  expect(screen.getByText('Urban Grill & Bistro')).toBeTruthy();
  expect(screen.getByText('Your table is reserved for 2:30 PM.')).toBeTruthy();
  expect(screen.getByText('Glow Serenity Spa')).toBeTruthy();
  expect(screen.getByText('See you tomorrow!')).toBeTruthy();
  // Branch address from the API drives the context chip.
  expect(screen.getAllByText('Apo Boulevard, Abuja').length).toBeGreaterThan(0);
  // One conversation with unread messages: header pill + Unread chip badge.
  expect(screen.getByText('1 unread')).toBeTruthy();
  expect(screen.getByText('Unread')).toBeTruthy();
  expect(screen.getByText('1')).toBeTruthy();
  // Per-thread unread count stays on the card.
  expect(screen.getByText('3')).toBeTruthy();
});

test('empty account shows the empty state, never stale fiction', async () => {
  mockWith([]);

  await render(<MessagesScreen />);

  expect(screen.getByText(copy.empty.title)).toBeTruthy();
  expect(screen.getByText(copy.empty.body)).toBeTruthy();
  expect(screen.queryByText('0 unread')).toBeNull();
});

test('query failures surface a retry that refetches threads', async () => {
  const refetch = jest.fn();
  mockThreads.mockReturnValue({
    isLoading: false,
    isError: true,
    data: undefined,
    refetch,
  });

  await render(<MessagesScreen />);

  expect(screen.getByText(strings.common.error)).toBeTruthy();
  fireEvent.press(screen.getByText(strings.common.retry));
  expect(refetch).toHaveBeenCalled();
});

test('Unread chip keeps only conversations with unread messages', async () => {
  mockWith([
    thread({ id: 't1', lastMessageContent: 'hi there', customerUnreadCount: 2 }),
    thread({
      id: 't2',
      business: { name: 'Glow Serenity Spa' },
      lastMessageContent: 'all caught up',
      customerUnreadCount: 0,
    }),
  ]);

  await render(<MessagesScreen />);
  fireEvent.press(screen.getByText('Unread'));

  await waitFor(() => expect(screen.queryByText('Glow Serenity Spa')).toBeNull());
  expect(screen.getByText('Urban Grill & Bistro')).toBeTruthy();
});

test('Deals & Inquiries keeps only deal conversations', async () => {
  mockWith([
    thread({ id: 'd1', lastMessageContent: 'Your 20% OFF voucher is ready to claim.' }),
    thread({
      id: 'b1',
      business: { name: 'Glow Serenity Spa' },
      lastMessageContent: 'Your table is reserved for 2:30 PM.',
    }),
    thread({
      id: 'c1',
      business: { name: 'Cafe Neo Artisan' },
      lastMessageContent: 'Hello! Thanks for reaching out.',
    }),
  ]);

  await render(<MessagesScreen />);
  fireEvent.press(screen.getByText('Deals & Inquiries'));

  await waitFor(() => expect(screen.queryByText('Glow Serenity Spa')).toBeNull());
  expect(screen.getByText('Urban Grill & Bistro')).toBeTruthy();
  expect(screen.queryByText('Cafe Neo Artisan')).toBeNull();
});

test('Bookings & Orders keeps only booking conversations', async () => {
  mockWith([
    thread({ id: 'd1', lastMessageContent: 'Your 20% OFF voucher is ready to claim.' }),
    thread({
      id: 'b1',
      business: { name: 'Glow Serenity Spa' },
      lastMessageContent: 'Your table is reserved for 2:30 PM.',
    }),
  ]);

  await render(<MessagesScreen />);
  fireEvent.press(screen.getByText('Bookings & Orders'));

  await waitFor(() => expect(screen.queryByText('Urban Grill & Bistro')).toBeNull());
  expect(screen.getByText('Glow Serenity Spa')).toBeTruthy();
});

test('a filter with no matches shows the filtered empty state', async () => {
  mockWith([thread({ id: 'c1', lastMessageContent: 'Hello! Thanks for reaching out.' })]);

  await render(<MessagesScreen />);
  fireEvent.press(screen.getByText('Deals & Inquiries'));

  await waitFor(() => expect(screen.getByText(copy.emptyFiltered.title)).toBeTruthy());
  expect(screen.getByText(copy.emptyFiltered.body)).toBeTruthy();
  expect(screen.queryByText(copy.empty.title)).toBeNull();
});

test('search narrows the live list by business or message', async () => {
  mockWith([
    thread({ id: 't1', lastMessageContent: 'hi' }),
    thread({
      id: 't2',
      business: { name: 'Glow Serenity Spa' },
      lastMessageContent: 'yo',
    }),
  ]);

  await render(<MessagesScreen />);

  fireEvent.changeText(screen.getByPlaceholderText(copy.searchPlaceholder), 'Glow');

  await waitFor(() => expect(screen.queryByText('Urban Grill & Bistro')).toBeNull());
  expect(screen.getByText('Glow Serenity Spa')).toBeTruthy();
});
