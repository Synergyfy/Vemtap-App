import type { BusinessLocationDraft } from '@features/business/screens/WhereIsYourBusinessLocatedScreen';
import type { BusinessOnboardingProfile } from '@store/businessOnboardingStore';

/**
 * Bridges the location screen's draft to the fields `register/owner` accepts.
 *
 * `state`, `city` and the coordinates come from the device position when the
 * owner used it; otherwise they stay empty rather than invented, since all four
 * are optional on the DTO. `registerLocationGap` records what is still owed.
 */
export function mapLocationDraft(
  draft: BusinessLocationDraft,
): BusinessOnboardingProfile['location'] {
  const parts = [draft.street, draft.landmark, draft.district].map(part => part.trim());
  const address = parts.filter(Boolean).join(', ') || draft.search.trim();

  return {
    address,
    state: draft.state ?? '',
    city: draft.city ?? '',
    latitude: draft.latitude ?? 0,
    longitude: draft.longitude ?? 0,
  };
}

/** Fields `register/owner` wants that the setup screens cannot currently supply. */
export interface RegistrationGap {
  field: string;
  reason: string;
}

export function registerLocationGap(
  location: BusinessOnboardingProfile['location'],
): RegistrationGap[] {
  const gaps: RegistrationGap[] = [];
  if (!location.state) {
    gaps.push({
      field: 'state',
      reason: 'The owner typed the address instead of using their location.',
    });
  }
  if (!location.city) {
    gaps.push({
      field: 'city',
      reason: 'The owner typed the address instead of using their location.',
    });
  }
  if (!location.latitude || !location.longitude) {
    gaps.push({
      field: 'latitude/longitude',
      reason: 'The owner typed the address instead of using their location.',
    });
  }
  return gaps;
}
