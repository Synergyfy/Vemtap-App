/**
 * Pulls the id out of an `actionUrl` like `/orders/<id>`.
 *
 * Allowlist by construction: only the shapes the backend actually writes resolve,
 * and anything else — a web-panel path from an admin broadcast
 * (`/dashboard/settings/subscription`), a malformed link — returns undefined so
 * the caller can mark the row read and stay put rather than navigate somewhere
 * meaningless.
 *
 * Shared because both shells need the same answer: a consumer order and a
 * business order are different screens but the same `/orders/<id>` link, and two
 * copies of this rule is how they start disagreeing about where a tap goes.
 */
export function matchSegment(
  actionUrl: string | null | undefined,
  segment: string,
): string | undefined {
  const match = (actionUrl ?? '').match(new RegExp(`/${segment}/([\\w-]+)`));
  return match?.[1];
}

/**
 * Where a notification tap wants to go, expressed without naming a screen.
 *
 * The two shells resolve the *same* link to different routes — a customer order
 * and a business order are one `/orders/<id>` but two detail screens — so the
 * shared part is the intent, and each shell maps an intent to its own route
 * names. Duplicating the parsing per shell is how the app's push deep links and
 * its in-app rows end up disagreeing about where a tap goes.
 *
 * Returning undefined is deliberate: an allowlisted URL that has no in-app
 * destination (an admin broadcast path written for the web panel, a malformed
 * link) means "mark it read and stay put", not "navigate somewhere wrong".
 */
export type NotificationTarget =
  { kind: 'order'; id: string } | { kind: 'message'; id: string };

/**
 * Resolve an `actionUrl` to a navigation intent.
 *
 * Accepts both sources, which is the reason it is shared: an in-app row carries
 * `actionUrl` from the feed, while a push tap carries `data.url` in its payload
 * and has no row to look up.
 */
export function resolveNotificationUrl(
  actionUrl: string | null | undefined,
): NotificationTarget | undefined {
  const orderId = matchSegment(actionUrl, 'orders');
  if (orderId) {
    return { kind: 'order', id: orderId };
  }
  const threadId = matchSegment(actionUrl, 'messages');
  if (threadId) {
    return { kind: 'message', id: threadId };
  }
  return undefined;
}
