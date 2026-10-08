import type { BusinessLocationDraft } from '@features/business/screens/WhereIsYourBusinessLocatedScreen';
import type { BusinessOnboardingProfile } from '@store/businessOnboardingStore';

/**
 * Bridges the location screen's free-text draft to the fields `register/owner`
 * accepts.
 *
 * The screen collects `search` / `street` / `landmark` / `district` as strings
 * and has no geocoder, so `state`, `city` and `latitude` / `longitude` cannot be
 * derived here. All four are optional on the DTO, so registration still
 * succeeds and they are carried as empty rather than invented — a fabricated
 * coordinate would be worse than a missing one. `registerLocationGap` records
 * what is still owed so the gap is visible instead of silent.
 */
export function mapLocationDraft(
  draft: BusinessLocationDraft,
): BusinessOnboardingProfile['location'] {
  const parts = [draft.street, draft.landmark, draft.district].map(part => part.trim());
  const address = parts.filter(Boolean).join(', ') || draft.search.trim();

  return {
    address,
    state: '',
    city: '',
    latitude: 0,
    longitude: 0,
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
    gaps.push({ field: 'state', reason: 'No state input on the location screen.' });
  }
  if (!location.city) {
    gaps.push({ field: 'city', reason: 'No city input on the location screen.' });
  }
  if (!location.latitude || !location.longitude) {
    gaps.push({
      field: 'latitude/longitude',
      reason: 'The location screen has no geocoder, so coordinates are never resolved.',
    });
  }
  return gaps;
}
