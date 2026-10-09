import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { BusinessOrdersHubScreen } from '@features/business/screens/BusinessOrdersHubScreen';
import { OrderDetailScreen } from '@features/business/screens/BusinessOrderDetailScreen';
import { BusinessBookingsHubScreen } from '@features/business/screens/BusinessBookingsHubScreen';
import {
  presentOrder,
  presentOrderDetail,
  relativeOrderTime,
  type PresentedOrder,
} from '@features/business/hooks/useBusinessOrders';
import { presentBooking } from '@features/business/hooks/useBusinessBookings';
import type { CatalogueOrder } from '@api/ordersApi';
import type { BusinessBooking } from '@api/bookingsApi';
import { strings } from '@constants/strings';

const copy = strings.businessOrders;

const baseOrder = {
  id: 'abcdef12-3456-7890-abcd-ef1234567890',
  createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
  status: 'new',
  totalAmount: 34500,
  items: [{ quantity: 2, name: 'Ribeye Steak' }],
  customer: { firstName: 'Amina', lastName: 'Bello' },
  deviceId: null,
  notes: null,
  tableNumber: null,
  bookingDate: null,
} as unknown as CatalogueOrder;

describe('presentOrder', () => {
  it('maps a new order to an Accept → processing action', () => {
    const presented = presentOrder(baseOrder);

    expect(presented.reference).toBe('#ABCDEF12');
    expect(presented.channel).toBe('New');
    expect(presented.cta).toBe('Accept');
    expect(presented.nextStatus).toBe('processing');
    expect(presented.customer).toBe('Amina Bello');
    expect(presented.amount).toBe('₦34,500');
    expect(presented.items).toBe('1 item (Ribeye Steak)');
    expect(presented.urgent).toBe(true);
  });

  it('moves processing → ready and ready → completed', () => {
    expect(presentOrder({ ...baseOrder, status: 'processing' })).toMatchObject({
      channel: 'Processing',
      cta: 'Mark Ready',
      nextStatus: 'ready',
    });
    expect(presentOrder({ ...baseOrder, status: 'ready' })).toMatchObject({
      channel: 'Ready',
      cta: 'Handover',
      nextStatus: 'completed',
    });
  });

  it('mutes terminal statuses and drops the CTA', () => {
    const completed = presentOrder({ ...baseOrder, status: 'completed' });
    expect(completed.cta).toBeUndefined();
    expect(completed.muted).toBe(true);
  });

  it('formats relative times', () => {
    expect(relativeOrderTime(new Date().toISOString())).toBe('Just now');
    expect(relativeOrderTime(new Date(Date.now() - 2 * 60 * 60_000).toISOString())).toBe(
      '2h ago',
    );
  });
});

describe('presentBooking', () => {
  const baseBooking = {
    id: 'bk-1',
    status: 'booked',
    date: '2099-10-20',
    time: '14:30',
    durationMinutes: 35,
    itemName: 'Facial & Manicure',
    notes: 'Window seat',
    customer: { firstName: 'Zainab', lastName: 'Ahmed' },
  } as unknown as BusinessBooking;

  it('maps time, service and the Check-In action', () => {
    const presented = presentBooking(baseBooking);

    expect(presented.time).toBe('2:30 PM');
    expect(presented.duration).toBe('35m');
    expect(presented.customer).toBe('Zainab Ahmed');
    expect(presented.service).toBe('Facial & Manicure');
    expect(presented.cta).toBe('Check-In');
    expect(presented.nextStatus).toBe('completed');
  });

  it('has no Check-In once completed', () => {
    const presented = presentBooking({ ...baseBooking, status: 'completed' });
    expect(presented.cta).toBeUndefined();
    expect(presented.badge).toBe('Completed');
  });
});

const liveOrder: PresentedOrder = {
  id: 'order-1',
  reference: '#ORDER1',
  status: 'new',
  channel: 'New',
  channelTone: 'brand',
  fulfilment: 'Table 4',
  time: '4m ago',
  urgent: true,
  customer: 'Amina Bello',
  items: '2 items (Ribeye + 1)',
  amount: '₦34,500',
  payment: 'POS Terminal · In-Store',
  cta: 'Accept',
  ctaStyle: 'primary',
  nextStatus: 'processing',
  muted: false,
};

describe('orders hub live wiring', () => {
  it('renders live rows/counts and reports the status change', async () => {
    const onUpdateOrderStatus = jest.fn();
    const view = await render(
      <BusinessOrdersHubScreen
        orders={[liveOrder]}
        orderCounts={{
          new: 1,
          processing: 2,
          ready: 0,
          completed: 5,
          cancelled: 0,
        }}
        orderTotal={8}
        bookingTotal={3}
        onUpdateOrderStatus={onUpdateOrderStatus}
      />,
    );

    expect(view.getByText('#ORDER1')).toBeTruthy();
    expect(view.getByText(copy.alertTitleFor(3))).toBeTruthy();
    expect(view.getAllByText('8').length).toBeGreaterThan(0);
    expect(view.getAllByText('3').length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(view.getByLabelText('Accept'));
    });
    expect(onUpdateOrderStatus).toHaveBeenCalledWith('order-1', 'processing');
  });

  it('shows the empty state when the API answered with no orders', async () => {
    const view = await render(<BusinessOrdersHubScreen orders={[]} />);
    expect(view.getByText(copy.emptyTitle)).toBeTruthy();
  });
});

describe('bookings hub live wiring', () => {
  it('reports Check-In for a live booking', async () => {
    const onCheckIn = jest.fn();
    const view = await render(
      <BusinessBookingsHubScreen
        bookings={[
          presentBooking({
            id: 'bk-1',
            status: 'booked',
            date: '2099-10-20',
            time: '09:00',
            durationMinutes: 60,
            itemName: 'Massage',
          } as unknown as BusinessBooking),
        ]}
        branchName="Main Branch"
        onCheckIn={onCheckIn}
      />,
    );

    expect(view.getAllByText('Main Branch').length).toBeGreaterThan(0);
    expect(view.getByText(strings.businessBookings.summaryTitleFor(1))).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Check-In'));
    });
    expect(onCheckIn).toHaveBeenCalledWith('bk-1');
  });
});

describe('presentOrderDetail', () => {
  const priced = {
    ...baseOrder,
    branch: { id: 'br-1', name: 'The Azure Bistro Main' },
    items: [
      {
        id: 'line-1',
        quantity: 2,
        name: 'Ribeye Steak',
        unitPrice: 13000,
        totalPrice: 26000,
        image: 'https://cdn/ribeye.jpg',
      },
    ],
  } as unknown as CatalogueOrder;

  it('maps status to hero, triage, items and capabilities', () => {
    const view = presentOrderDetail(priced);

    expect(view.reference).toBe('#ABCDEF12');
    expect(view.branchName).toBe('The Azure Bistro Main');
    expect(view.statusLabel).toBe('New Incoming Order');
    expect(view.showTriage).toBe(true);
    expect(view.canMarkProcessing).toBe(true);
    expect(view.canMarkReady).toBe(false);
    expect(view.canComplete).toBe(false);
    expect(view.customer.name).toBe('Amina Bello');
    expect(view.items[0]).toMatchObject({
      name: 'Ribeye Steak',
      quantity: 2,
      lineTotalLabel: '₦26,000',
    });
    expect(view.itemsCountLabel).toBe('1 item, 2 qty');
    expect(view.subtotalLabel).toBe('₦26,000');
    expect(view.totalLabel).toBe('₦34,500');
    expect(view.timeline[0].state).toBe('active');
    expect(view.timeline[2].state).toBe('pending');
  });

  it('unlocks Ready → Complete → Refund as the status advances', () => {
    const ready = presentOrderDetail({ ...priced, status: 'ready' });
    expect(ready.showTriage).toBe(false);
    expect(ready.canMarkReady).toBe(false);
    expect(ready.canComplete).toBe(true);
    expect(ready.canRefund).toBe(false);

    const completed = presentOrderDetail({ ...priced, status: 'completed' });
    expect(completed.canComplete).toBe(false);
    expect(completed.canRefund).toBe(true);
    expect(completed.timeline.every(step => step.state !== 'pending')).toBe(true);
  });
});

describe('order detail live rendering', () => {
  const detailCopy = strings.businessOrderDetail;

  const liveDetail = presentOrderDetail({
    ...baseOrder,
    branch: { id: 'br-1', name: 'Main Branch' },
    items: [
      {
        id: 'line-1',
        quantity: 2,
        name: 'Ribeye Steak',
        unitPrice: 13000,
        totalPrice: 26000,
      },
    ],
  } as unknown as CatalogueOrder);

  it('renders live customer, items and totals, and fires Accept', async () => {
    const onAcceptOrder = jest.fn();
    const view = await render(
      <OrderDetailScreen
        onBack={jest.fn()}
        detail={liveDetail}
        onAcceptOrder={onAcceptOrder}
      />,
    );

    expect(view.getByText(liveDetail.reference)).toBeTruthy();
    expect(view.getAllByText('Main Branch').length).toBeGreaterThan(0);
    expect(view.getByText('Amina Bello')).toBeTruthy();
    expect(view.getByText('Ribeye Steak')).toBeTruthy();
    expect(view.getByText(liveDetail.totalLabel)).toBeTruthy();
    // Unbacked design blocks are hidden for live orders.
    expect(view.queryByText(detailCopy.statusEstimate)).toBeNull();
    expect(view.queryByText(detailCopy.customerMeta)).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByLabelText(detailCopy.triageAccept));
    });
    expect(onAcceptOrder).toHaveBeenCalled();
  });

  it('offers Mark Ready for a processing order and hides triage', async () => {
    const onMarkReady = jest.fn();
    const view = await render(
      <OrderDetailScreen
        onBack={jest.fn()}
        detail={presentOrderDetail({ ...baseOrder, status: 'processing' })}
        onMarkReady={onMarkReady}
      />,
    );

    expect(view.queryByLabelText(detailCopy.triageAccept)).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByLabelText(detailCopy.markReady));
    });
    expect(onMarkReady).toHaveBeenCalled();
  });

  it('confirms before refunding a completed order', async () => {
    const onAdjustRefund = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(
      <OrderDetailScreen
        onBack={jest.fn()}
        detail={presentOrderDetail({ ...baseOrder, status: 'completed' })}
        onAdjustRefund={onAdjustRefund}
      />,
    );

    await act(async () => {
      fireEvent.press(view.getByLabelText(detailCopy.refundOrder));
    });

    expect(alertSpy).toHaveBeenCalled();
    const buttons = alertSpy.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    const refund = buttons.find(button => button.text === detailCopy.refundConfirmAction);
    refund?.onPress?.();
    expect(onAdjustRefund).toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
