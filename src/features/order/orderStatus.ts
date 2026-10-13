import { strings } from '@constants/strings';

const TERMINAL_STATUSES = new Set([
  'cancelled',
  'rejected',
  'refunded',
  'partial_refund',
]);

export function isActiveStatus(status: string | null | undefined): boolean {
  return status === 'new' || status === 'processing';
}

export function statusLabel(status: string | null | undefined): string {
  const labels = strings.ordersHub.orderStatusLabels as Record<string, string>;
  const key = status ?? '';
  return labels[key] ?? key;
}

/**
 * `neutral` is the muted treatment for terminal states that are neither a
 * highlight nor a warning — a cancelled or refunded order would otherwise have
 * to borrow the brand tint and read as a positive state.
 */
export function statusToneFor(
  status: string | null | undefined,
): 'success' | 'brand' | 'warning' | 'neutral' {
  if (isActiveStatus(status)) return 'warning';
  if (status === 'completed') return 'success';
  if (TERMINAL_STATUSES.has(status ?? '')) return 'neutral';
  return 'brand';
}
