import type { OpeningHours } from '@api/businessProfileApi';

/**
 * Derived views of a merchant's weekly `openingHours`.
 *
 * The screens never compare raw `from`/`to` strings themselves: "Open now" is
 * a claim about the API's data and has to be honest when the data is missing —
 * a day with no entry, a closed flag, or times that cannot be parsed must read
 * as *unknown*, never as open.
 *
 * Keys are matched case-insensitively: the seeds write `monday`, the merchant
 * profile form writes `Monday`.
 *
 * Time is compared in device-local time — the column carries no usable
 * timezone today (merchants are Nigerian, matching the seeds).
 */

/** Indexed by `Date#getDay()`. */
const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** Monday-first, the order the terms screen lists days in. */
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

type Day = OpeningHours[keyof OpeningHours];

function findDay(hours: OpeningHours, key: string): Day | undefined {
  const direct = hours[key];
  if (direct) {
    return direct;
  }
  const match = Object.keys(hours).find(name => name.toLowerCase() === key);
  return match ? hours[match] : undefined;
}

/** `'09:30'` → `570`. Unparseable or missing → `null`. */
function toMinutes(time: string | null): number | null {
  if (!time) {
    return null;
  }
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Is the merchant open at `at`?
 *
 * `true` / `false` only when today's entry exists and its window is known;
 * `null` means *unknown* (no hours at all, no entry for today, or unusable
 * times) and callers should show no badge rather than guess.
 */
export function isOpenNow(
  hours: OpeningHours | null | undefined,
  at: Date = new Date(),
): boolean | null {
  if (!hours) {
    return null;
  }
  const day = findDay(hours, DAY_KEYS[at.getDay()]);
  if (!day) {
    return null;
  }
  if (day.isClosed) {
    return false;
  }
  const from = toMinutes(day.from);
  const to = toMinutes(day.to);
  if (from === null || to === null) {
    return null;
  }
  const now = at.getHours() * 60 + at.getMinutes();
  if (from <= to) {
    return now >= from && now < to;
  }
  // A window that wraps midnight (`18:00` → `02:00`): open from `from` or,
  // after the wrap, before `to`.
  return now >= from || now < to;
}

export type BusinessHoursWindow = {
  /** e.g. `10:00 AM – 11:00 PM` — the earliest open to the latest close. */
  window: string;
  /** e.g. `Monday through Saturday`, `Monday, Wednesday and Friday`, `every day`. */
  days: string;
};

function formatClock(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(rest).padStart(2, '0')} ${suffix}`;
}

function formatDays(openByDay: boolean[]): string {
  const openCount = openByDay.filter(Boolean).length;
  if (openCount === 7) {
    return 'every day';
  }

  // Contiguous when walking the week cyclically there is exactly one
  // closed → open transition (e.g. Mon–Sat, or Fri–Sun).
  let transitions = 0;
  for (let i = 0; i < 7; i += 1) {
    const previous = openByDay[(i + 6) % 7];
    if (!previous && openByDay[i]) {
      transitions += 1;
    }
  }

  if (transitions === 1 && openCount > 1) {
    const start = openByDay.findIndex((open, day) => open && !openByDay[(day + 6) % 7]);
    const end = openByDay.findIndex((open, day) => open && !openByDay[(day + 1) % 7]);
    if (start !== -1 && end !== -1) {
      return `${DAY_NAMES[start]} through ${DAY_NAMES[end]}`;
    }
  }

  const names = DISPLAY_ORDER.filter(day => openByDay[day]).map(day => DAY_NAMES[day]);
  if (names.length === 1) {
    return names[0];
  }
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * The aggregate "when can I use this" window across the week: earliest open,
 * latest close, and the days — `null` when no day has a usable pair, so the
 * screen falls back to neutral copy instead of inventing a window.
 */
export function hoursWindow(
  hours: OpeningHours | null | undefined,
): BusinessHoursWindow | null {
  if (!hours) {
    return null;
  }

  const openByDay = DAY_KEYS.map(() => false);
  let earliest: number | null = null;
  let latest: number | null = null;
  let any = false;

  DAY_KEYS.forEach((key, day) => {
    const entry = findDay(hours, key);
    if (!entry || entry.isClosed) {
      return;
    }
    const from = toMinutes(entry.from);
    const to = toMinutes(entry.to);
    if (from === null || to === null) {
      return;
    }
    openByDay[day] = true;
    any = true;
    if (earliest === null || from < earliest) {
      earliest = from;
    }
    if (latest === null || to > latest) {
      latest = to;
    }
  });

  if (!any || earliest === null || latest === null) {
    return null;
  }

  return {
    window: `${formatClock(earliest)} – ${formatClock(latest)}`,
    days: formatDays(openByDay),
  };
}
