import { useCallback, useMemo } from 'react';
import type { Category } from '@api/categoriesApi';
import type { OwnerRegistration } from '@api/ownerAuthApi';
import type { Session } from '@api/authApi';
import {
  UnresolvableCategoryError,
  mapDraftToOwnerRegistration,
} from '@features/business/utils/ownerRegistrationMapper';
import { pruneRegistrationPayload } from '@features/business/utils/registrationPayload';
import { uploadBrandingMedia } from '@features/business/utils/uploadBusinessMedia';
import { businessDashboardApi } from '@api/businessDashboardApi';
import { registerLocationGap } from '@features/business/utils/locationDraftMapper';
import {
  selectRegistrationDraft,
  useBusinessOnboardingStore,
} from '@store/businessOnboardingStore';
import { useCategoryTaxonomy } from '@features/business/hooks/useCategoryTaxonomy';
import {
  useRegisterOwner,
  useOwnerRegistrationNeedsOtp,
} from '@features/business/hooks/useOwnerRegistration';
import { logger } from '@utils/logger';

/**
 * Assembles the collected wizard draft into `POST /auth/register/owner`.
 *
 * This is the seam between the onboarding wizard and the API. It is deliberately
 * UI-free: no owner credentials/OTP screen exists yet
 * (`stitch_vemtap_design_system/design.md` says "Do not design the business
 * onboarding screens yet"), so inventing one here would violate the repo's
 * "never invent a screen" rule. Mounting it needs only a screen that collects
 * email + password and runs the 4-character OTP.
 *
 * The API enforces its own ordering — `registerOwner` 400s with
 * "OTP must be verified before completing registration" — so `needsOtp` is
 * surfaced to the caller to route the user back to the OTP step rather than
 * showing a generic failure.
 */

export interface RegistrationReadiness {
  ready: boolean;
  /** Missing fields, each with the reason it cannot be filled yet. */
  gaps: import('@features/business/utils/locationDraftMapper').RegistrationGap[];
}

export interface SubmitOwnerRegistration {
  register: (input: { email: string; password: string }) => Promise<Session>;
  isPending: boolean;
  error: Error | null;
  /** True when the API refused because the email's OTP is not verified. */
  needsOtp: boolean;
  /** Non-fatal: fields the wizard cannot collect but the DTO allows. */
  gaps: import('@features/business/utils/locationDraftMapper').RegistrationGap[];
  reset: () => void;
  readiness: RegistrationReadiness;
}

export function useSubmitOwnerRegistration(
  categoriesOverride?: Category[] | undefined,
): SubmitOwnerRegistration {
  const store = useBusinessOnboardingStore();
  const taxonomy = useCategoryTaxonomy();
  const registerMutation = useRegisterOwner();
  const needsOtp = useOwnerRegistrationNeedsOtp(registerMutation.error);

  const categories = useMemo(
    () => categoriesOverride ?? taxonomy.data ?? [],
    [categoriesOverride, taxonomy.data],
  );

  const draft = useMemo(() => selectRegistrationDraft(store), [store]);

  const gaps = useMemo(
    () => registerLocationGap(store.profile.location),
    [store.profile.location],
  );

  const readiness = useMemo<RegistrationReadiness>(
    () => ({
      ready:
        Boolean(store.credentials.email) &&
        Boolean(store.credentials.password) &&
        Boolean(store.profile.basic.name) &&
        gaps.length === 0,
      gaps,
    }),
    [store.credentials.email, store.credentials.password, store.profile.basic.name, gaps],
  );

  const register = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      // Resolve the category first: `register/owner` needs a real taxonomy id, so
      // an unresolvable category has to fail here rather than as an opaque 400.
      const mapped = mapDraftToOwnerRegistration(draft, categories);

      const payload: OwnerRegistration = {
        email,
        password,
        ...pruneRegistrationPayload(mapped.payload),
      };

      const session = await registerMutation.mutateAsync(payload);

      // Apply what registration cannot carry: the deferred description and the
      // picked branding media (uploaded now that the owner has a session).
      // Best-effort — never mask a successful signup.
      const description = mapped.deferred.description?.trim();
      const media = await uploadBrandingMedia(store.profile.branding);
      const updates: Record<string, unknown> = { ...media };
      if (description) updates.description = description;

      if (Object.keys(updates).length > 0) {
        try {
          await businessDashboardApi.updateMyBusiness(updates);
        } catch (error) {
          logger.warn('business', 'Failed to apply deferred business fields', {
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (gaps.length) {
        logger.warn('business', 'Registered with location fields outstanding', {
          gaps: gaps.map(gap => gap.field),
        });
      }

      store.reset();
      return session;
    },
    [draft, categories, registerMutation, gaps, store],
  );

  return {
    register,
    isPending: registerMutation.isPending,
    error: registerMutation.error ?? null,
    needsOtp,
    gaps,
    reset: store.reset,
    readiness,
  };
}

export { UnresolvableCategoryError };
