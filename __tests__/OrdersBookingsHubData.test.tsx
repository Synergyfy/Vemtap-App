import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { OrdersBookingsHubScreen } from '@features/order/screens/OrdersBookingsHubScreen';
import type { CatalogueOrder } from '@api/ordersApi';
import { strings } from '@constants/strings';

/**
 * The Orders tab reads `GET /catalogue/orders/my-orders`. The hook is mocked so
 * this covers the screen's own behaviour — status grouping, live counts and the
 * loading/error/empty branches — rather than the network, which
 * `__tests__/live/ordersContract.test.ts` covers against the real server.
 */
const mockUseCustomerOrders = jest.fn();

jest.mock('@features/order/hooks/useCustomerOrders', () => ({
  useCustomerOrders: () => mockUseCustomerOrders(),
}));

type QueryState = {
  data?: CatalogueOrder[];
  isLoading: boolean;
  isError: boolean;
  refetch?: jest.Mock;
};

function setQuery(state: QueryState) {
  mockUseCustomerOrders.mockReturnValue({
    refetch: jest.fn(),
    ...state,
  });
}

/** Built from the live `my-orders` payload, including the transformed item fields. */
function makeOrder(overrides: Partial<CatalogueOrder>): CatalogueOrder {
  return {
    id: 'ac46bc8c-b2d7-465a-8b86-1a11acab4513',
    createdAt: '2026-10-08T08:40:14.946Z',
    status: 'new',
    totalAmount: 1000,
    branch: { name: 'Urban Grill & Bistro' },
    items: [
      {
        id: '000d6edf-48a5-43d9-8552-b665f660581d',
        itemId: '60d85400-64ac-451e-a406-d59a9fe595cb',
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
    ...overrides,
  };
}

const activeOrder = makeOrder({});
const doneOrder = makeOrder({
  id: 'b77f0f34-2f9f-4a3c-9a2f-0f34b77f2f9f',
  status: 'completed',
  totalAmount: 2400,
  branch: { name: 'The Daily Knead Bakery' },
  items: [
    {
      id: 'line-2',
      itemId: 'item-2',
      quantity: 2,
      name: 'Sourdough Loaf',
      image: null,
      unitPrice: 1200,
      totalPrice: 2400,
      refundedQuantity: 0,
      loyaltyPointsAtOrder: 0,
      offerId: null,
      orderId: 'b77f0f34-2f9f-4a3c-9a2f-0f34b77f2f9f',
    },
  ],
});

function renderScreen(props: Record<string, unknown> = {}) {
  return render(<OrdersBookingsHubScreen {...props} />);
}

test('shows the loading state before the query settles', async () => {
  setQuery({ isLoading: true, isError: false });

  const screen = await renderScreen();

  expect(screen.getByText(strings.common.loading)).toBeTruthy();
});

test('shows an error state that can retry', async () => {
  const refetch = jest.fn();
  mockUseCustomerOrders.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: true,
    refetch,
  });

  const screen = await renderScreen();

  fireEvent.press(screen.getByText(strings.common.retry));
  expect(refetch).toHaveBeenCalledTimes(1);
});

test('shows the empty state when the account has no orders', async () => {
  setQuery({ data: [], isLoading: false, isError: false });

  const screen = await renderScreen();

  expect(screen.getByText(strings.ordersHub.emptyOrdersTitle)).toBeTruthy();
});

test('renders live orders with their branch, item line and total', async () => {
  setQuery({ data: [activeOrder], isLoading: false, isError: false });

  const screen = await renderScreen();

  expect(screen.getByText('Urban Grill & Bistro')).toBeTruthy();
  expect(screen.getByText('1x Soft Drinks')).toBeTruthy();
  // Once for the line, once for the order total.
  expect(screen.getAllByText('₦1,000')).toHaveLength(2);
  expect(screen.getByText('New')).toBeTruthy();
  expect(screen.getByText(/^Order #AC46BC8C/)).toBeTruthy();
});

test('counts orders on the tab and inside each status chip', async () => {
  setQuery({ data: [activeOrder, doneOrder], isLoading: false, isError: false });

  const screen = await renderScreen();

  expect(screen.getByText('Orders (2)')).toBeTruthy();
  expect(screen.getByText('Active (1)')).toBeTruthy();
  expect(screen.getByText('Completed (1)')).toBeTruthy();
  expect(screen.getByText('Cancelled (0)')).toBeTruthy();
  expect(screen.getByText('Refunded (0)')).toBeTruthy();
});

test('filters orders by the chip status group', async () => {
  setQuery({ data: [activeOrder, doneOrder], isLoading: false, isError: false });

  const screen = await renderScreen();

  // Default chip is Active, so the completed order starts filtered out.
  expect(screen.getByText('Urban Grill & Bistro')).toBeTruthy();
  expect(screen.queryByText('The Daily Knead Bakery')).toBeNull();

  await fireEvent.press(screen.getByText('Completed (1)'));

  expect(screen.queryByText('Urban Grill & Bistro')).toBeNull();
  expect(screen.getByText('The Daily Knead Bakery')).toBeTruthy();
  // Chips stay mounted — only the list below them is filtered.
  expect(screen.getByText('Active (1)')).toBeTruthy();
});

test('opens the order detail when a card is pressed', async () => {
  const onOpenOrder = jest.fn();
  setQuery({ data: [activeOrder], isLoading: false, isError: false });

  const screen = await renderScreen({ onOpenOrder });

  await fireEvent.press(screen.getByLabelText('Urban Grill & Bistro'));
  expect(onOpenOrder).toHaveBeenCalledWith(activeOrder.id);
});
