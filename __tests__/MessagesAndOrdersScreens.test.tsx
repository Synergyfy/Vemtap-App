import React from 'react';
import { render } from '@testing-library/react-native';
import { MessagesScreen } from '@features/merchantChat/screens/MessagesScreen';
import { UrbanConversationScreen } from '@features/merchantChat/screens/UrbanConversationScreen';
import { OrdersBookingsHubScreen } from '@features/order/screens/OrdersBookingsHubScreen';
import { UrbanOrderDetailScreen } from '@features/order/screens/UrbanOrderDetailScreen';

test('renders the four standalone messages and order screens', async () => {
  const messages = await render(<MessagesScreen />);
  const conversation = await render(<UrbanConversationScreen />);
  const hub = await render(<OrdersBookingsHubScreen />);
  const detail = await render(<UrbanOrderDetailScreen />);

  expect(
    messages.getByPlaceholderText('Search conversations, businesses...'),
  ).toBeTruthy();
  expect(conversation.getByText('20% Off Prime Lunch Gourmet Combo')).toBeTruthy();
  expect(hub.getByText('Orders And Bookings')).toBeTruthy();
  expect(detail.getByText('Kitchen is crafting your meal')).toBeTruthy();
});
