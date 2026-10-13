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
