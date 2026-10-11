import type { ChatMessage } from '@api/messagingApi';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * When a message was actually sent.
 *
 * `timestamp` is the column the API orders threads and transcripts by, but it is
 * only filled for messages written through the messaging paths; `createdAt` is
 * the entity's own column and is present on every row. Reading `timestamp`
 * first keeps the transcript consistent with its own ordering, and falling back
 * means a row that somehow lacks it still shows a time instead of a blank.
 */
export function messageTimeOf(message: Pick<ChatMessage, 'timestamp' | 'createdAt'>):
  | string
  | undefined {
  return message.timestamp ?? message.createdAt ?? undefined;
}

function toDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `10:42 AM` — the bubble's timestamp slot, time only. */
export function formatClock(iso: string | undefined): string {
  const date = toDate(iso);
  if (!date) return '';
  const hours = date.getHours();
  const hour = ((hours + 11) % 12) + 1;
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** `Today` · `Yesterday` · `Oct 14` — the transcript's day separator. */
export function dayLabel(iso: string | undefined, now: Date = new Date()): string {
  const date = toDate(iso);
  if (!date) return '';
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Whether a day separator belongs above `current`.
 *
 * The transcript always opens on a separator (even mid-conversation) so the
 * date above the first message is never a guess.
 */
export function startsNewDay(
  previousIso: string | undefined,
  currentIso: string | undefined,
): boolean {
  const previous = toDate(previousIso);
  const current = toDate(currentIso);
  if (!current) return false;
  if (!previous) return true;
  return dayLabel(previousIso) !== dayLabel(currentIso);
}