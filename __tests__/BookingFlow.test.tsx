import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ServiceDetailScreen } from '@features/booking/screens/ServiceDetailScreen';
import { ScheduleAppointmentScreen } from '@features/booking/screens/ScheduleAppointmentScreen';
import { BookingCheckoutScreen } from '@features/booking/screens/BookingCheckoutScreen';
import { BookingConfirmedScreen } from '@features/booking/screens/BookingConfirmedScreen';

const navigate = jest.fn();
const replace = jest.fn();
const reset = jest.fn();
const goBack = jest.fn();
const navigation = { navigate, replace, reset, goBack } as never;

const draft = {
  addons: ['led-light-therapy'],
  therapistId: 'amara',
  date: '2024-10-17',
  time: '1:15',
  notes: 'Sensitive skin',
};

function route(name: string, params?: unknown) {
  return { key: name, name, params } as never;
}

describe('booking flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens scheduling from service detail with selected options', async () => {
    const screen = await render(
      <ServiceDetailScreen navigation={navigation} route={route('ServiceDetail')} />,
    );

    expect(screen.getByText('Deep Hydration Radiance Facial')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Book Appointment'));

    expect(navigate).toHaveBeenCalledWith('ScheduleAppointment', {
      draft: expect.objectContaining({ therapistId: 'any' }),
    });
  });

  it('carries schedule choices into checkout', async () => {
    const screen = await render(
      <ScheduleAppointmentScreen
        navigation={navigation}
        route={route('ScheduleAppointment', { draft })}
      />,
    );

    await fireEvent.press(screen.getByLabelText('Review Booking Details'));

    expect(navigate).toHaveBeenCalledWith('BookingCheckout', { draft });
  });

  it('confirms the booking reservation', async () => {
    const screen = await render(
      <BookingCheckoutScreen
        navigation={navigation}
        route={route('BookingCheckout', { draft })}
      />,
    );

    await fireEvent.press(screen.getByLabelText('Confirm Booking with Glow & Serenity'));

    expect(replace).toHaveBeenCalledWith('BookingConfirmed', { draft });
  });

  it('returns to Home from the confirmation screen', async () => {
    const screen = await render(
      <BookingConfirmedScreen
        navigation={navigation}
        route={route('BookingConfirmed', { draft })}
      />,
    );

    expect(screen.getByText('Appointment Confirmed!')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Back to Home Discovery'));

    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  });
});
