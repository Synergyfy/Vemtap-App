import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { OrdersBookingsHubScreen } from '@features/order/screens/OrdersBookingsHubScreen';
import type { Booking } from '@api/bookingsApi';
import { strings } from '@constants/strings';
import { classNameOf, flattenStyle } from './helpers/CssInteropUpgradeSafety';

const mockBookings = jest.fn();

jest.mock('@features/order/hooks/useCustomerOrders', () => ({
  useCustomerOrders: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('@features/booking/hooks/useBookings', () => ({
  useMyBookings: () => mockBookings(),
}));

const booking: Booking = {
  id: '7c2f0a4e-1d1b-4f0f-9a51-2f1c2d3e4f50',
  reference: 'BK-4F2A9C',
  status: 'booked',
  date: '2026-10-19',
  time: '13:30',
  durationMinutes: 30,
  branchName: 'Jabi',
  businessName: 'Aurora Spa',
  itemName: 'Deep tissue massage',
};

const ordersLabel = strings.ordersHub.orders;
const bookingsLabel = strings.ordersHub.bookingsTab;

beforeEach(() => {
  mockBookings.mockReturnValue({
    data: [booking],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
});

describe('customer Orders & Bookings: Bookings tab', () => {
  it('lists the customer’s bookings with the real count', async () => {
    const view = await render(<OrdersBookingsHubScreen />);
    expect(view.getByText(`${bookingsLabel} (1)`)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(bookingsLabel));
    });
    expect(view.getByText('Aurora Spa')).toBeTruthy();
    expect(view.getByText('Deep tissue massage')).toBeTruthy();
  });

  it('switches tabs without changing className (the freeze)', async () => {
    const view = await render(<OrdersBookingsHubScreen />);
    const before = [classNameOf(view, ordersLabel), classNameOf(view, bookingsLabel)];

    await act(async () => {
      fireEvent.press(view.getByLabelText(bookingsLabel));
    });

    expect([classNameOf(view, ordersLabel), classNameOf(view, bookingsLabel)]).toEqual(
      before,
    );
    expect(
      flattenStyle(view.getByLabelText(bookingsLabel).props.style).backgroundColor,
    ).not.toBe('transparent');
    expect(
      flattenStyle(view.getByLabelText(ordersLabel).props.style).backgroundColor,
    ).toBe('transparent');
  });
});
