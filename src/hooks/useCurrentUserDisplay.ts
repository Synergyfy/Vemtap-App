import { useAuthStore } from '@store/authStore';
import { strings } from '@constants/strings';

/**
 * The signed-in customer's profile as it should be *shown* — the fields the
 * signup flow collected (first/last name, email, phone), read from the session
 * the login/register response stored in `authStore`.
 *
 * Every personal-hub surface that prints a name, initials, email or phone goes
 * through this hook so they can never disagree. When a field is absent the
 * design's own placeholder value is returned instead, so an identity slot can
 * never render blank.
 */
export interface CurrentUserDisplay {
  /** First name only — used by greetings. */
  firstName: string;
  lastName: string;
  /** First + last, for rows and headers. */
  fullName: string;
  /** Up to two initials derived from `fullName`. */
  initials: string;
  email: string;
  phone: string;
}

const placeholderName = strings.accountScreens.moreHub.name;
const placeholderEmail = strings.accountScreens.moreHub.email;
const placeholderPhone = strings.accountScreens.moreHub.phone;

function initialsOf(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
}

export function useCurrentUserDisplay(): CurrentUserDisplay {
  const user = useAuthStore(state => state.user);

  const rawFirst = user?.firstName?.trim() ?? '';
  const rawLast = user?.lastName?.trim() ?? '';
  const hasName = Boolean(rawFirst || rawLast);

  const [placeholderFirst, ...placeholderRest] = placeholderName.split(' ');
  const firstName = hasName ? rawFirst : placeholderFirst;
  const lastName = hasName ? rawLast : placeholderRest.join(' ');
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || placeholderName;

  return {
    firstName,
    lastName,
    fullName,
    initials: initialsOf(fullName),
    email: user?.email?.trim() || placeholderEmail,
    phone: user?.phone?.trim() || placeholderPhone,
  };
}
