import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UrbanOrderDetailScreen } from '@features/order/screens/UrbanOrderDetailScreen';
import { useCustomerOrderDetail } from '@features/order/hooks/useCustomerOrders';
import { strings } from '@constants/strings';
import type { CatalogueOrder } from '@api/ordersApi';

jest.mock('@features/order/hooks/useCustomerOrders', () => ({
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

function setDetail(state: Record<string, unknown>) {
  (useCustomerOrderDetail as jest.Mock).mockReturnValue({
    refetch: jest.fn(),
    ...state,
  });
}

test('shows the loading state while the order list is fetched', async () => {
  setDetail({ isLoading: true, isError: false, order: undefined });

  const screen = await render(<UrbanOrderDetailScreen orderId={order.id} />);

  expect(screen.getByText(strings.common.loading)).toBeTruthy();
});

test('shows an error state that can retry', async () => {
  const refetch = jest.fn();
  setDetail({ isLoading: false, isError: true, order: undefined, refetch });

  const screen = await render(<UrbanOrderDetailScreen orderId={order.id} />);

  fireEvent.press(screen.getByText(strings.common.retry));
  expect(refetch).toHaveBeenCalledTimes(1);
});

test('shows the not-found state when the order is not in the customer list', async () => {
  setDetail({ isLoading: false, isError: false, order: undefined, isNotFound: true });

  const screen = await render(<UrbanOrderDetailScreen orderId={order.id} />);

  expect(screen.getByText(strings.ordersHub.orderDetailUnavailableTitle)).toBeTruthy();
});

test('renders the order status, branch, items and total', async () => {
  setDetail({ isLoading: false, isError: false, order });

  const screen = await render(<UrbanOrderDetailScreen orderId={order.id} />);

  expect(screen.getByText('Preparing')).toBeTruthy();
  expect(screen.getByText('Urban Grill & Bistro')).toBeTruthy();
  expect(screen.getByText('12 Apo Boulevard, Abuja')).toBeTruthy();
  expect(screen.getByText('Soft Drinks')).toBeTruthy();
  expect(screen.getByText(strings.urbanOrderDetail.subtotal)).toBeTruthy();
  expect(screen.getByText(strings.urbanOrderDetail.totalPaid)).toBeTruthy();
  // Subtotal, line total and order total all read ₦1,000 for this one-line order.
  expect(screen.getAllByText('₦1,000')).toHaveLength(3);
  expect(screen.getByText('Order #AC46BC8C')).toBeTruthy();
});

test('marks timeline stages from the real status', async () => {
  setDetail({ isLoading: false, isError: false, order });

  const screen = await render(<UrbanOrderDetailScreen orderId={order.id} />);

  // `processing` means the first stage is done and the second is active.
  expect(screen.getByText(strings.urbanOrderDetail.status.placed)).toBeTruthy();
  expect(screen.getByText(strings.urbanOrderDetail.status.preparing)).toBeTruthy();
  expect(screen.getByText(strings.ordersHub.orderNotStarted)).toBeTruthy();
});
