import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Category } from '@api/categoriesApi';
import type { Session } from '@api/authApi';
import { ownerAuthApi } from '@api/ownerAuthApi';
import { businessDashboardApi } from '@api/businessDashboardApi';
import { setTokenPair } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';
import {
  selectRegistrationDraft,
  useBusinessOnboardingStore,
} from '@store/businessOnboardingStore';
import {
  UnresolvableCategoryError,
  mapDraftToOwnerRegistration,
} from '@features/business/utils/ownerRegistrationMapper';
import { pruneRegistrationPayload } from '@features/business/utils/registrationPayload';
import { uploadBrandingMedia } from '@features/business/utils/uploadBusinessMedia';
import { useCategoryTaxonomy } from '@features/business/hooks/useCategoryTaxonomy';
import { logger } from '@utils/logger';

/**
 * Add an owner side to an already-authenticated customer account.
 *
 * The business fields come from the same wizard draft as a fresh signup, but
 * the API turns the existing account into an Owner instead of creating a new
 * one — customer history is kept. Local-auth accounts confirm their password;
 * Google-only accounts have none to confirm.
 */
export function useUpgradeOwnerRegistration(categoriesOverride?: Category[]) {
  const queryClient = useQueryClient();
  const taxonomy = useCategoryTaxonomy();
  const store = useBusinessOnboardingStore();
  const setSession = useAuthStore(state => state.setSession);

  const categories = useMemo(
    () => categoriesOverride ?? taxonomy.data ?? [],
    [categoriesOverride, taxonomy.data],
  );

  const upgrade = useCallback(
    async ({ password }: { password?: string }): Promise<Session> => {
      const mapped = mapDraftToOwnerRegistration(
        selectRegistrationDraft(store),
        categories,
      );

      const session = await ownerAuthApi.upgradeToOwner({
        ...pruneRegistrationPayload(mapped.payload),
        ...(password ? { password } : {}),
      });
      await setTokenPair({ accessToken: session.access_token });

      // Upload the picked branding media now that the upgrade session exists,
      // and apply the deferred description in the same PATCH. Best-effort: a
      // failure must not mask the upgrade.
      const media = await uploadBrandingMedia(store.profile.branding);
      const updates: Record<string, unknown> = { ...media };
      const description = mapped.deferred.description?.trim();
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

      return session;
    },
    [categories, store],
  );

  const mutation = useMutation<Session, Error, { password?: string }>({
    mutationFn: upgrade,
    onSuccess: session => {
      setSession(session);
      // The new owner should land on their business side, not the customer app.
      useAuthStore.getState().setActiveMode('business');
      store.reset();
      queryClient.invalidateQueries();
      logger.info('business', 'Customer upgraded to owner', {
        user: session.user.uniqueCode,
      });
    },
  });

  return mutation;
}

export { UnresolvableCategoryError };
