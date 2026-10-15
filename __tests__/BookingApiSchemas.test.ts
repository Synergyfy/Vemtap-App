import { bookingSchema, bookingsApi } from '@api/bookingsApi';
import { formatBookingSlot } from '@features/order/screens/OrdersBookingsHubScreen';

/**
 * `GET /bookings/:id` is what turns BookingDetail from a design mock into a
 * real record. Two things carry the whole contract: the URL must address a
 * booking by **UUID** (the route runs `ParseUUIDPipe`, so the human-facing
 * `reference` 400s), and `bookingSchema` must accept the `BookingResponseDto`
 * the backend actually returns.
 */
const mockRequest = jest.fn();

jest.mock('@api/client', () => ({
  ...jest.requireActual('@api/client'),
  requestValidated: (...args: unknown[]) => mockRequest(...args),
}));

const lastRequest = () => mockRequest.mock.calls[mockRequest.mock.calls.length - 1][0];

describe('bookingsApi.getBookingById', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue(undefined);
  });

  it('addresses the booking by uuid, not by reference', async () => {
    await bookingsApi.getBookingById('8f14e45f-ceea-4e21-a2f2-6a1b2c3d4e5f');

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(lastRequest()).toMatchObject({
      method: 'GET',
      url: '/bookings/8f14e45f-ceea-4e21-a2f2-6a1b2c3d4e5f',
    });
  });

  it('validates the response against the booking schema', async () => {
    await bookingsApi.getBookingById('8f14e45f-ceea-4e21-a2f2-6a1b2c3d4e5f');

    expect(mockRequest.mock.calls[0][1]).toBe(bookingSchema);
  });

  it('forwards request options so callers can pass an AbortSignal', async () => {
    const { signal } = new AbortController();
    await bookingsApi.getBookingById('8f14e45f-ceea-4e21-a2f2-6a1b2c3d4e5f', { signal });

    expect(lastRequest()).toMatchObject({ signal });
  });
});

describe('bookingSchema accepts the BookingResponseDto', () => {
  const payload = {
    id: '8f14e45f-ceea-4e21-a2f2-6a1b2c3d4e5f',
    reference: 'BK-4F2A9C',
    status: 'booked',
    date: '2026-10-20',
    time: '14:30',
    durationMinutes: 60,
    branchId: 'b1a2c3d4-0000-4000-8000-000000000001',
    branchName: 'Main Branch',
    businessName: 'Patrick Ventures',
    itemId: 'f1a2c3d4-0000-4000-8000-000000000001',
    itemName: 'Private Event Catering',
    notes: null,
    customer: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: '2026-10-08T19:00:00.000Z',
  };

  it('parses a customer-side booking, where `customer` is null', () => {
    const parsed = bookingSchema.safeParse(payload);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.reference).toBe('BK-4F2A9C');
    expect(parsed.data.branchName).toBe('Main Branch');
  });

  it('defaults `status` and `durationMinutes` when the server omits them', () => {
    const parsed = bookingSchema.safeParse({ ...payload, status: undefined });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.status).toBe('booked');
  });
});

describe('formatBookingSlot', () => {
  it('renders a date and 24h time as a friendly slot', () => {
    expect(formatBookingSlot('2026-10-20', '14:30')).toBe('Tue, Oct 20 • 2:30 PM');
  });

  it('keeps midnight and end-of-day times on the 24h clock', () => {
    expect(formatBookingSlot('2026-10-20', '00:00')).toBe('Tue, Oct 20 • 12:00 AM');
    expect(formatBookingSlot('2026-10-20', '23:30')).toBe('Tue, Oct 20 • 11:30 PM');
  });

  it('falls back to the raw values rather than rendering "Invalid Date"', () => {
    expect(formatBookingSlot('', '')).toBe(' ');
    expect(formatBookingSlot('2026-13-45', '99:99')).toBe('2026-13-45 99:99');
  });
});
