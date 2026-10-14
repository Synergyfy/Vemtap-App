import { matchSegment, resolveNotificationUrl } from '@navigation/notificationRoutes';

/**
 * One allowlist decides where a notification tap goes, and both the in-app
 * notification centre and the push-tap handler run through it. That shared rule
 * is the whole reason this file exists: the two used to resolve independently,
 * and the backend was writing a deep-link prefix the app never recognised, so
 * every messaging push tap silently did nothing.
 */
describe('resolveNotificationUrl', () => {
  it('reads an order id', () => {
    expect(resolveNotificationUrl('/orders/abc-123')).toEqual({
      kind: 'order',
      id: 'abc-123',
    });
  });

  it('reads a thread id', () => {
    expect(resolveNotificationUrl('/messages/thread-9')).toEqual({
      kind: 'message',
      id: 'thread-9',
    });
  });

  /**
   * Regression: the backend built messaging deep links with the socket
   * namespace (`/messaging`) rather than the route path (`/messages`). The
   * resolver has always keyed on `/messages`, so that URL matched nothing and
   * the tap landed on the home screen.
   */
  it('does not resolve the old /messaging prefix', () => {
    expect(resolveNotificationUrl('/messaging/thread-9')).toBeUndefined();
  });

  it('leaves an admin-broadcast path with no in-app destination', () => {
    // Written for the web panel; navigating to it blindly would dead-end.
    expect(resolveNotificationUrl('/dashboard/settings/subscription')).toBeUndefined();
  });

  it.each([undefined, null, '', 'orders/abc', '/'])('returns undefined for %p', value => {
    expect(resolveNotificationUrl(value)).toBeUndefined();
  });

  it('prefers an order over a thread when a url carries both', () => {
    expect(resolveNotificationUrl('/orders/abc/messages/xyz')).toEqual({
      kind: 'order',
      id: 'abc',
    });
  });

  it('accepts ids with dashes and underscores', () => {
    expect(resolveNotificationUrl('/orders/9f8a-b1c2_d3')).toEqual({
      kind: 'order',
      id: '9f8a-b1c2_d3',
    });
  });
});

describe('matchSegment', () => {
  it('extracts the segment', () => {
    expect(matchSegment('/orders/abc', 'orders')).toBe('abc');
  });

  it('returns undefined when the segment is absent', () => {
    expect(matchSegment('/messages/abc', 'orders')).toBeUndefined();
  });
});
