import { notificationCategory } from '@api/notificationsApi';

/**
 * The filter chips are only as good as this mapping.
 *
 * The old screen matched on loose substrings, which sent `new_order`,
 * `order_status`, `new_pos_order` and `promotion_claim` to the System tab —
 * real backend types, all four misfiled. Every value below is one a writer
 * actually emits.
 */
describe('notificationCategory', () => {
  const backendTypes: Array<[string, string]> = [
    ['deal_spike', 'deals'],
    ['promotion_claim', 'deals'],
    ['new_order', 'bookings'],
    ['order_status', 'bookings'],
    ['new_pos_order', 'bookings'],
    ['new_message', 'system'],
    ['password_reset', 'system'],
    ['announcement', 'system'],
    ['info', 'system'],
    ['warning', 'system'],
  ];

  test.each(backendTypes)('files %s under %s', (type, expected) => {
    expect(notificationCategory(type)).toBe(expected);
  });

  test('handles namespaced types from writers that use dots', () => {
    expect(notificationCategory('deal.claimed')).toBe('deals');
    expect(notificationCategory('booking.confirmed')).toBe('bookings');
    expect(notificationCategory('loyalty.points')).toBe('rewards');
    expect(notificationCategory('system.welcome')).toBe('system');
  });

  test('is case insensitive', () => {
    expect(notificationCategory('DEAL_SPIKE')).toBe('deals');
  });

  test('falls back to system rather than dropping an unknown type', () => {
    // An unrecognised type must still be visible somewhere.
    expect(notificationCategory('quantum_entanglement')).toBe('system');
    expect(notificationCategory('')).toBe('system');
    expect(notificationCategory(null)).toBe('system');
    expect(notificationCategory(undefined)).toBe('system');
  });
});
