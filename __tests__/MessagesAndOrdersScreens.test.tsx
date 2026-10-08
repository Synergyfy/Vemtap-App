import React from 'react';
import { render } from '@testing-library/react-native';
import { MessagesScreen } from '@features/merchantChat/screens/MessagesScreen';
import { UrbanConversationScreen } from '@features/merchantChat/screens/UrbanConversationScreen';
import { OrdersBookingsHubScreen } from '@features/order/screens/OrdersBookingsHubScreen';
import { UrbanOrderDetailScreen } from '@features/order/screens/UrbanOrderDetailScreen';
import {
  useCustomerThreadMessages,
  useCustomerThreads,
  useSendCustomerReply,
} from '@features/merchantChat/hooks/useCustomerMessaging';
import {
  useCustomerOrderDetail,
  useCustomerOrders,
} from '@features/order/hooks/useCustomerOrders';
import type { CatalogueOrder } from '@api/ordersApi';
import type { ChatMessage, ConversationThread } from '@api/messagingApi';

/**
 * Smoke test: all four standalone messages and order screens render without
 * hitting the network. The data hooks are mocked so each screen renders a
 * deterministic state.
 */

jest.mock('@features/merchantChat/hooks/useCustomerMessaging', () => ({
  useCustomerThreads: jest.fn(),
  useCustomerThreadMessages: jest.fn(),
  useSendCustomerReply: jest.fn(),
}));

jest.mock('@features/order/hooks/useCustomerOrders', () => ({
  useCustomerOrders: jest.fn(),
  useCustomerOrderDetail: jest.fn(),
}));

const order: CatalogueOrder = {
  id: 'ac46bc8c-b2d7-465a-8b86-1a11acab4513',
  createdAt: '2026-10-08T08:40:14.946Z',
  updatedAt: '2026-10-08T08:40:14.946Z',
  status: 'processing',
  totalAmount: 1000,
  branch: { name: 'Urban Grill & Bistro', address: '12 Apo Boulevard, Abuja' },
  items: [
    {
      id: 'line-1',
      itemId: 'item-1',
      quantity: 1,
      name: 'Soft Drinks',
      image: null,
      unitPrice: 1000,
      totalPrice: 1000,
      refundedQuantity: 0,
      loyaltyPointsAtOrder: 5,
      offerId: null,
      orderId: 'ac46bc8c-b2d7-465a-8b86-1a11acab4513',
    },
  ],
};

const thread: ConversationThread = {
  id: 'f7de9d67-6d7d-4701-9e84-e522131e8dbe',
  branch: { name: 'Urban Grill & Bistro', logoUrl: null },
  branchId: 'de9abc24-fbe0-4b9b-8362-89663b6b4d1e',
  channel: 'IN_HOUSE',
  status: 'OPEN',
  lastMessageContent: 'Hi',
  branchUnreadCount: 0,
  customerUnreadCount: 0,
};

const message: ChatMessage = {
  id: '41712e34-c0d2-48c1-88c8-bf6c5620bedf',
  content: 'Hi, thank you for reaching out.',
  createdAt: '2026-10-08T08:40:14.782Z',
  direction: 'OUTBOUND',
  threadId: 'f7de9d67-6d7d-4701-9e84-e522131e8dbe',
  channel: 'IN_HOUSE',
  status: 'SENT',
};

beforeEach(() => {
  (useCustomerOrders as jest.Mock).mockReturnValue({
    data: [order],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
  (useCustomerOrderDetail as jest.Mock).mockReturnValue({
    data: [order],
    order,
    isNotFound: false,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
  (useCustomerThreads as jest.Mock).mockReturnValue({
    data: [thread],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
  (useCustomerThreadMessages as jest.Mock).mockReturnValue({
    data: [message],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
  (useSendCustomerReply as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  });
});

test('renders the four standalone messages and order screens', async () => {
  const messages = await render(<MessagesScreen />);
  const conversation = await render(<UrbanConversationScreen threadId={thread.id} />);
  const hub = await render(<OrdersBookingsHubScreen />);
  const detail = await render(<UrbanOrderDetailScreen orderId={order.id} />);

  expect(
    messages.getByPlaceholderText('Search conversations, businesses...'),
  ).toBeTruthy();
  expect(conversation.getByText('20% Off Prime Lunch Gourmet Combo')).toBeTruthy();
  expect(hub.getByText('Orders And Bookings')).toBeTruthy();
  expect(detail.getByText('Kitchen is crafting your meal')).toBeTruthy();
});
