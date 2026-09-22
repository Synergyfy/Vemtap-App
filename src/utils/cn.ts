import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose Tailwind classNames with conflict resolution.
 * Always use `cn()` for conditional / merged classNames instead of string concat.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
