import type { OwnerRegistration } from '@api/ownerAuthApi';
import type { Category } from '@api/categoriesApi';

/**
 * Turns the values the four business profile screens collect into the single
 * payload `POST /auth/register/owner` accepts.
 *
 * Three constraints from the live API shape this mapper has to respect, all of
 * them discovered by probing rather than from the spec:
 *
 *  1. **The taxonomy is real, the screens are fictional.** `register/owner`
 *     wants `categoryId` / `subcategoryId` UUIDs. The setup screens offer
 *     invented labels (`Restaurant & Dining`, `Spa & Wellness`, …) that share
 *     *no* names with the API's 24 seeded categories (`Food & Hospitality`,
 *     `Beauty & Personal Care`, …). So a selection is resolved by name against
 *     the real taxonomy, and an unmatched name is an error — never a made-up id.
 *
 *  2. **`description` is not accepted at registration.** `RegisterOwnerDto` has
 *     no `description` field; only `PATCH /businesses/my-business`
 *     (`UpdateBusinessDto`) does. So the description the Basic Info screen
 *     collects is returned separately for that follow-up call.
 *
 *  3. **Socials nest.** The screens collect a website plus social handles;
 *     the DTO has `businessWebsite` and an `engagement` object.
 */

/** Values as emitted by BusinessProfileBasicInfoScreen. */
export interface BasicInfoDraft {
  name: string;
  category: string;
  specialties: string[];
  description: string;
}

/** Values as emitted by BusinessProfileBrandingScreen. */
export interface BrandingDraft {
  logoUrl?: string;
  specialtyNames?: string[];
}

/**
 * Ids straight from the category picker. Preferred over resolving by name,
 * because it removes the fictional-taxonomy problem entirely.
 */
export interface CategorySelection {
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  /** Second specialty: the API can only accept this one as free text. */
  otherSubcategoryName?: string;
}

/** Values as emitted by BusinessProfileContactChannelsScreen. */
export interface ContactChannelsDraft {
  email: string;
  whatsappNumber?: string;
  website?: string;
  socials?: Record<string, string>;
}

/** Values as emitted by the business location screens. */
export interface LocationDraft {
  address: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
}

/** Everything collected before credentials are known. */
export interface BusinessProfileDraft {
  basic: BasicInfoDraft;
  branding: BrandingDraft;
  contact: ContactChannelsDraft;
  location: LocationDraft;
  /**
   * Present once the picker has been used. When set, the ids come straight from
   * the API taxonomy and name resolution is skipped entirely.
   */
  category?: CategorySelection;
}

/** The part of the payload that registration accepts. */
export type OwnerRegistrationPayload = Omit<OwnerRegistration, 'email' | 'password'>;

export interface MappedOwnerRegistration {
  payload: OwnerRegistrationPayload;
  /**
   * Fields `register/owner` cannot carry. Apply these with
   * `PATCH /businesses/my-business` once the owner has a session.
   */
  deferred: {
    description: string;
  };
  /** Unmapped draft fields, so the screens can surface them rather than drop them. */
  unresolved: {
    category: string;
    specialties: string[];
  };
}

/** Case- and whitespace-insensitive: the API ships `'Agriculture '` with a trailing space. */
function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export class UnresolvableCategoryError extends Error {
  constructor(
    public readonly requested: string,
    public readonly available: string[],
  ) {
    super(
      `No API category matches "${requested}". The setup screens use fictional ` +
        `category names; they must be mapped onto the real taxonomy before registration.`,
    );
    this.name = 'UnresolvableCategoryError';
  }
}

function findCategory(requested: string, categories: Category[]): Category | undefined {
  const target = normalize(requested);
  return categories.find(category => normalize(category.name) === target);
}

function resolveSpecialties(
  requested: string[],
  category: Category | undefined,
): string[] {
  if (!category) return requested;
  const available = category.subcategories.map(sub => normalize(sub.name));
  return requested.filter(specialty => available.includes(normalize(specialty)));
}

/**
 * Resolve the category by name and split out what registration cannot send.
 *
 * @throws {UnresolvableCategoryError} when the chosen category has no real
 * counterpart — the API would reject a fabricated UUID anyway, and failing here
 * keeps that rejection close to its cause instead of surfacing as an opaque 400.
 */
export function mapDraftToOwnerRegistration(
  draft: BusinessProfileDraft,
  categories: Category[],
): MappedOwnerRegistration {
  // A picker selection is already API-sourced, so prefer it; otherwise fall back
  // to resolving the drafted name against the real taxonomy.
  const category = draft.category
    ? (categories.find(item => item.id === draft.category?.categoryId) ??
      ({
        id: draft.category.categoryId,
        name: draft.category.categoryName,
        subcategories: [],
      } as Category))
    : findCategory(draft.basic.category, categories);

  if (!category) {
    throw new UnresolvableCategoryError(
      draft.basic.category,
      categories.map(item => item.name),
    );
  }

  const subcategoryId =
    draft.category?.subcategoryId ??
    category.subcategories.find(
      sub => normalize(sub.name) === normalize(draft.branding.specialtyNames?.[0] ?? ''),
    )?.id;

  // The API takes one subcategory id; a second specialty can only travel as text.
  const otherSubcategoryName =
    draft.category?.otherSubcategoryName ?? draft.branding.specialtyNames?.[1];

  const engagement: Record<string, string> = { ...draft.contact.socials };
  // Only send socials that actually carry a value, so the API does not store blanks.
  for (const [key, value] of Object.entries(engagement)) {
    if (!value.trim()) delete engagement[key];
  }

  const payload: OwnerRegistrationPayload = {
    businessName: draft.basic.name,
    categoryId: category.id,
    subcategoryId,
    otherSubcategoryName,
    businessLogo: draft.branding.logoUrl,
    whatsappNumber: draft.contact.whatsappNumber,
    officialEmail: draft.contact.email,
    businessAddress: draft.location.address,
    state: draft.location.state,
    city: draft.location.city,
    latitude: draft.location.latitude,
    longitude: draft.location.longitude,
    businessWebsite: draft.contact.website,
    engagement: Object.keys(engagement).length ? engagement : undefined,
  };

  // Drop undefined so the request body carries only real fields; the API
  // distinguishes absent from empty, and absent is what it expects here.
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) delete (payload as Record<string, unknown>)[key];
  }

  return {
    payload,
    deferred: { description: draft.basic.description },
    unresolved: {
      category: draft.category?.categoryName ?? draft.basic.category,
      specialties: resolveSpecialties(draft.basic.specialties, category),
    },
  };
}
