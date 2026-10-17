import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { ordersApi } from '@api/ordersApi';
import { supportApi } from '@api/supportApi';
import * as csvExport from '@utils/csvExport';
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
  branchId: 'branch-1',
  branch: {
    name: 'Wuse',
    address: '12 Aminu Kano Crescent, Abuja',
    phone: '+2348011112222',
    business: { name: 'Aurora Grill' },
  },
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
  expect(screen.getByText('Aurora Grill \u2022 Wuse')).toBeTruthy();
  expect(screen.getByText('12 Aminu Kano Crescent, Abuja')).toBeTruthy();
  expect(screen.getByText('Soft Drinks')).toBeTruthy();
  expect(screen.getByText(strings.urbanOrderDetail.subtotal)).toBeTruthy();
  expect(screen.getByText(strings.urbanOrderDetail.totalPaid)).toBeTruthy();
  // Subtotal, line total and order total all read ₦1,000 for this one-line order.
  expect(screen.getAllByText('₦1,000')).toHaveLength(3);
  // The pickup code is the order reference the business also sees.
  expect(screen.getAllByText('#AC46BC8C').length).toBeGreaterThanOrEqual(2);
  // None of the old demo facts.
  expect(screen.queryByText('6241')).toBeNull();
  expect(screen.queryByText(/Visa ending/)).toBeNull();
  expect(screen.queryByText(/Open until/)).toBeNull();
});

test('downloads the receipt and shares the PDF', async () => {
  setDetail({ isLoading: false, isError: false, order });
  const receipt = jest.spyOn(ordersApi, 'getMyOrderReceipt').mockResolvedValue({
    filename: 'vemtap-receipt-ac46bc8c.pdf',
    mimeType: 'application/pdf',
    contentBase64: 'JVBERi0=',
  });
  const share = jest.spyOn(csvExport, 'shareBase64File').mockResolvedValue(true);

  const screen = await render(<UrbanOrderDetailScreen orderId={order.id} />);
  await act(async () => {
    fireEvent.press(screen.getByLabelText(strings.urbanOrderDetail.invoice));
  });

  await waitFor(() => expect(share).toHaveBeenCalled());
  expect(receipt).toHaveBeenCalledWith(order.id);
  expect(share.mock.calls[0][0]).toBe('vemtap-receipt-ac46bc8c.pdf');
  jest.restoreAllMocks();
});

test('reports an issue as a support ticket naming the order', async () => {
  setDetail({ isLoading: false, isError: false, order });
  const ticket = jest
    .spyOn(supportApi, 'createTicket')
    .mockResolvedValue({ id: 't1' } as never);

  const screen = await render(<UrbanOrderDetailScreen orderId={order.id} />);
  await act(async () => {
    fireEvent.press(screen.getByLabelText(strings.urbanOrderDetail.issue));
  });
  await act(async () => {
    fireEvent.changeText(
      screen.getByLabelText(strings.urbanOrderDetail.issueTitle),
      'Missing a drink',
    );
  });
  await act(async () => {
    fireEvent.press(screen.getByText(strings.urbanOrderDetail.issueSend));
  });

  await waitFor(() =>
    expect(ticket).toHaveBeenCalledWith({
      subject: strings.urbanOrderDetail.issueSubject('#AC46BC8C'),
      category: strings.urbanOrderDetail.issueCategory,
      message: 'Missing a drink',
    }),
  );
  jest.restoreAllMocks();
});

test('reorders the same items at the same branch', async () => {
  setDetail({ isLoading: false, isError: false, order });
  const onReorder = jest.fn();

  const screen = await render(
    <UrbanOrderDetailScreen orderId={order.id} onReorder={onReorder} />,
  );
  await act(async () => {
    fireEvent.press(screen.getByText(strings.urbanOrderDetail.reorder));
  });

  expect(onReorder).toHaveBeenCalledWith({
    branchId: 'branch-1',
    businessName: 'Aurora Grill',
    branchName: 'Wuse',
    items: [
      {
        itemId: 'item-1',
        name: 'Soft Drinks',
        image: null,
        unitPrice: 1000,
        quantity: 1,
      },
    ],
    instructions: '',
  });
});

test('marks timeline stages from the real status', async () => {
  setDetail({ isLoading: false, isError: false, order });

  const screen = await render(<UrbanOrderDetailScreen orderId={order.id} />);

  // `processing` means the first stage is done and the second is active.
  expect(screen.getByText(strings.urbanOrderDetail.status.placed)).toBeTruthy();
  expect(screen.getByText(strings.urbanOrderDetail.status.preparing)).toBeTruthy();
  expect(screen.getByText(strings.ordersHub.orderNotStarted)).toBeTruthy();
});
