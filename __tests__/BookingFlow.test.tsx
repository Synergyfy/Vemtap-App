import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ServiceDetailScreen } from '@features/booking/screens/ServiceDetailScreen';
import { ScheduleAppointmentScreen } from '@features/booking/screens/ScheduleAppointmentScreen';
import { BookingCheckoutScreen } from '@features/booking/screens/BookingCheckoutScreen';
import { BookingConfirmedScreen } from '@features/booking/screens/BookingConfirmedScreen';

/**
 * The booking flow against the backend contract.
 *
 * Every screen here used to run on fixture data — a fixed `1:15` October 2024
 * slot, an assigned specialist, a ₦5,000 voucher line — and "confirmed" without
 * calling anything. These tests pin the wiring that replaced it: the service
 * and its price come from `GET /public/catalogue/items/:id`, the grid comes
 * from `GET /bookings/availability`, `POST /bookings` is the only way to reach
 * the confirmation screen, and it carries exactly the five fields
 * `CreateBookingDto` accepts — no `therapistId`, no `addons`.
 */
const mockRequest = jest.fn();

jest.mock('@api/client', () => ({
  ...jest.requireActual('@api/client'),
  requestValidated: (request: unknown) => mockRequest(request),
}));

type RecordedRequest = {
  method: string;
  url: string;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

const recorded = (): RecordedRequest[] =>
  mockRequest.mock.calls.map(call => call[0] as RecordedRequest);

const respond = (handler: (request: RecordedRequest) => unknown) => {
  mockRequest.mockImplementation(async (request: RecordedRequest) => handler(request));
};

const BRANCH_ID = 'b1a2c3d4-0000-4000-8000-000000000001';
const ITEM_ID = 'f1a2c3d4-0000-4000-8000-000000000001';
const BOOKING_ID = '8f14e45f-ceea-4e21-a2f2-6a1b2c3d4e5f';

const service = {
  id: ITEM_ID,
  name: 'Deep Tissue Massage',
  itemType: 'service',
  status: 'active',
  price: 16000,
  duration: '60 mins',
  description: 'Firm-pressure work over the whole back and shoulders.',
  mainImage: 'https://cdn.example.test/massage.jpg',
  galleryImages: [],
  isBookable: true,
  branchId: BRANCH_ID,
};

const created = {
  id: BOOKING_ID,
  reference: 'BK-4F2A9C',
  status: 'booked',
  date: '2026-12-10',
  time: '14:30',
  durationMinutes: 60,
  branchId: BRANCH_ID,
  branchName: 'Lekki Branch',
  businessName: 'Glow & Serenity',
  itemId: ITEM_ID,
  itemName: 'Deep Tissue Massage',
  notes: 'Sensitive skin',
};

const draft = {
  itemId: ITEM_ID,
  branchId: BRANCH_ID,
  date: '2026-12-10',
  time: '14:30',
  notes: 'Sensitive skin',
  businessName: 'Glow & Serenity',
  branchName: 'Lekki Branch',
};

const navigate = jest.fn();
const replace = jest.fn();
const reset = jest.fn();
const goBack = jest.fn();
const navigation = { navigate, replace, reset, goBack } as never;

function route(name: string, params?: unknown) {
  return { key: name, name, params } as never;
}

describe('booking flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockReset();
    respond(() => undefined);
  });

  it('loads the real service and opens scheduling with its branch', async () => {
    respond(request =>
      request.url.startsWith('/public/catalogue/items/') ? service : undefined,
    );

    const screen = await render(
      <ServiceDetailScreen
        navigation={navigation}
        route={route('ServiceDetail', {
          serviceId: ITEM_ID,
          branchId: BRANCH_ID,
          businessName: 'Glow & Serenity',
          branchName: 'Lekki Branch',
        })}
      />,
    );

    expect(await screen.findByText('Deep Tissue Massage')).toBeTruthy();
    expect(screen.getByText('60 mins')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Book Appointment'));

    expect(navigate).toHaveBeenCalledWith('ScheduleAppointment', {
      draft: {
        itemId: ITEM_ID,
        branchId: BRANCH_ID,
        date: '',
        time: '',
        notes: '',
        businessName: 'Glow & Serenity',
        branchName: 'Lekki Branch',
      },
    });
  });

  it('carries a live availability slot into checkout', async () => {
    respond(request => {
      if (request.url.startsWith('/public/catalogue/items/')) return service;
      if (request.url === '/bookings/availability') {
        return {
          date: '2026-12-10',
          branchId: BRANCH_ID,
          itemId: ITEM_ID,
          slots: [
            { time: '14:30', available: true },
            { time: '15:00', available: false },
          ],
        };
      }
      return undefined;
    });

    const screen = await render(
      <ScheduleAppointmentScreen
        navigation={navigation}
        route={route('ScheduleAppointment', { draft: { ...draft, date: '', time: '' } })}
      />,
    );

    expect(await screen.findByText('2:30 PM')).toBeTruthy();
    await fireEvent.press(screen.getByText('2:30 PM'));
    await fireEvent.press(screen.getByLabelText('Review Booking Details'));

    expect(navigate).toHaveBeenCalledWith('BookingCheckout', {
      draft: expect.objectContaining({
        itemId: ITEM_ID,
        branchId: BRANCH_ID,
        time: '14:30',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    });
  });

  it('POSTs exactly the fields CreateBookingDto accepts before confirming', async () => {
    respond(request => {
      if (request.url.startsWith('/public/catalogue/items/')) return service;
      if (request.method === 'POST' && request.url === '/bookings') return created;
      return undefined;
    });

    const screen = await render(
      <BookingCheckoutScreen
        navigation={navigation}
        route={route('BookingCheckout', { draft })}
      />,
    );

    expect(await screen.findByText('Deep Tissue Massage')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Confirm booking'));

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('BookingConfirmed', {
        draft,
        bookingId: BOOKING_ID,
      }),
    );

    const post = recorded().find(request => request.method === 'POST');
    expect(post?.url).toBe('/bookings');
    expect(post?.data).toEqual({
      branchId: BRANCH_ID,
      itemId: ITEM_ID,
      date: '2026-12-10',
      time: '14:30',
      notes: 'Sensitive skin',
    });
    expect(post?.data).not.toHaveProperty('therapistId');
    expect(post?.data).not.toHaveProperty('addons');
  });

  it('shows the booking the server returned and returns to Home', async () => {
    respond(request => (request.url === `/bookings/${BOOKING_ID}` ? created : undefined));

    const screen = await render(
      <BookingConfirmedScreen
        navigation={navigation}
        route={route('BookingConfirmed', { draft, bookingId: BOOKING_ID })}
      />,
    );

    expect(await screen.findByText('BK-4F2A9C')).toBeTruthy();
    expect(screen.getAllByText('Glow & Serenity').length).toBeGreaterThan(0);
    expect(screen.getByText('Deep Tissue Massage')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Back to Home Discovery'));

    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  });

  it('refuses to confirm a draft with no slot instead of booking a default', async () => {
    respond(request =>
      request.url.startsWith('/public/catalogue/items/') ? service : undefined,
    );

    const screen = await render(
      <BookingCheckoutScreen
        navigation={navigation}
        route={route('BookingCheckout', { draft: { ...draft, time: '' } })}
      />,
    );

    expect(await screen.findByText('Finish your booking first')).toBeTruthy();
    expect(recorded().filter(request => request.method === 'POST')).toHaveLength(0);
    expect(replace).not.toHaveBeenCalled();
  });
});
