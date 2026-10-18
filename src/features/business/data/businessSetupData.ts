export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function formatNaira(value: number): string {
  return `₦${value.toLocaleString('en-US')}`;
}
