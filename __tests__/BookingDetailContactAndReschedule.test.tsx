import React from 'react';
import { Linking } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { BookingDetailScreen } from '@features/accountHub/screens/BookingDetailScreen';
import { BusinessBookingDetailScreen } from '@features/business/screens/BusinessBookingDetailScreen';
import type { Booking } from '@api/bookingsApi';
import { strings } from '@constants/strings';

const mockReschedule = jest.fn();
let mockBooking: Booking;

jest.mock('@features/booking/hooks/useBookings', () => ({
  useBooking: () => ({
    data: mockBooking,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useCancelBooking: () => ({ mutate: jest.fn(), isPending: false }),
  useRescheduleBooking: () => ({
    mutate: mockReschedule,
    isPending: false,
    isError: false,
    reset: jest.fn(),
  }),
  useBookingAvailability: () => ({
    data: {
      date: '2026-10-22',
      branchId: 'br-1',
      isClosed: false,
      slots: [
        { time: '10:00', available: true },
        { time: '10:30', available: false },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

jest.mock('@components/shared/toast', () => ({ showToast: jest.fn() }));

const booking: Booking = {
  id: '7c2f0a4e-1d1b-4f0f-9a51-2f1c2d3e4f50',
  reference: 'BK-4F2A9C',
  status: 'booked',
  date: '2026-10-21',
  time: '13:30',
  durationMinutes: 60,
  branchId: 'br-1',
  branchName: 'Jabi',
  businessName: 'Aurora Spa',
  itemId: 'svc-1',
  itemName: 'Deep tissue massage',
  customer: {
    id: 'cust-1',
    firstName: 'Ada',
    lastName: 'Obi',
    phone: '+2348011111111',
    email: 'ada@example.test',
  },
  merchant: {
    businessCode: 'BIZ123XYZ',
    logoUrl: null,
    phone: '+2348099999999',
    address: '12 Jabi Lake Road',
    city: 'Abuja',
    latitude: 9.07,
    longitude: 7.42,
  },
};

const copy = strings.accountScreens.bookingDetail;
const biz = strings.businessBookingDetail;

beforeEach(() => {
  mockBooking = booking;
  mockReschedule.mockReset();
  jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
});

describe('customer booking detail', () => {
  it('shows the business and wires chat, call, directions and the profile link', async () => {
    const onOpenChat = jest.fn();
    const onOpenBusiness = jest.fn();
    const view = await render(
      <BookingDetailScreen
        bookingId={booking.id}
        onOpenChat={onOpenChat}
        onOpenBusiness={onOpenBusiness}
      />,
    );
    expect(view.getByText('Aurora Spa')).toBeTruthy();
    expect(view.getAllByText('12 Jabi Lake Road, Abuja').length).toBeGreaterThan(0);

    await act(async () => fireEvent.press(view.getByText(copy.chat)));
    expect(onOpenChat).toHaveBeenCalledWith({
      branchId: 'br-1',
      businessName: 'Aurora Spa',
    });

    await act(async () => fireEvent.press(view.getByText(copy.call)));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:+2348099999999');

    await act(async () => fireEvent.press(view.getByText(copy.directions)));
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://www.google.com/maps/search/?api=1&query=9.07,7.42',
    );

    await act(async () => fireEvent.press(view.getByLabelText(copy.viewBusiness)));
    expect(onOpenBusiness).toHaveBeenCalledWith('BIZ123XYZ');
  });

  it('reschedules to a free slot the branch offers', async () => {
    const view = await render(<BookingDetailScreen bookingId={booking.id} />);
    await act(async () => fireEvent.press(view.getByText(copy.reschedule)));

    await act(async () => fireEvent.press(view.getByText('10:00 AM')));
    await act(async () => fireEvent.press(view.getByText(copy.rescheduleSheet.confirm)));
    expect(mockReschedule).toHaveBeenCalledWith(
      expect.objectContaining({ id: booking.id, time: '10:00' }),
      expect.any(Object),
    );
  });

  it('offers no reschedule once the booking is finished', async () => {
    mockBooking = { ...booking, status: 'completed' };
    const view = await render(<BookingDetailScreen bookingId={booking.id} />);
    expect(view.queryByText(copy.reschedule)).toBeNull();
  });
});

describe('business booking detail', () => {
  it('shows the customer and the actions the status allows', async () => {
    const onChangeStatus = jest.fn();
    const onCallCustomer = jest.fn();
    const onChatCustomer = jest.fn();
    const view = await render(
      <BusinessBookingDetailScreen
        onBack={jest.fn()}
        booking={booking}
        onChangeStatus={onChangeStatus}
        onCallCustomer={onCallCustomer}
        onChatCustomer={onChatCustomer}
      />,
    );
    expect(view.getByText('Ada Obi')).toBeTruthy();
    expect(view.getByText('Deep tissue massage')).toBeTruthy();

    await act(async () => fireEvent.press(view.getByText(biz.confirm)));
    await act(async () => fireEvent.press(view.getByText(biz.checkIn)));
    expect(onChangeStatus.mock.calls).toEqual([['confirmed'], ['completed']]);

    await act(async () => fireEvent.press(view.getByText(biz.callCustomer)));
    await act(async () => fireEvent.press(view.getByText(biz.chat)));
    expect(onCallCustomer).toHaveBeenCalled();
    expect(onChatCustomer).toHaveBeenCalled();
  });

  it('has no actions left on a completed booking', async () => {
    const view = await render(
      <BusinessBookingDetailScreen
        onBack={jest.fn()}
        booking={{ ...booking, status: 'completed' }}
      />,
    );
    await waitFor(() => expect(view.getByText(biz.statusCompleted)).toBeTruthy());
    expect(view.queryByText(biz.confirm)).toBeNull();
    expect(view.queryByText(biz.cancel)).toBeNull();
  });
});
