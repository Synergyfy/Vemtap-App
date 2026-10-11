import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessDashboardApi } from '@api/businessDashboardApi';

/** The editable slice of a business profile, as the profile screens collect it. */
export interface UpdateBusinessProfileInput {
  name?: string;
  categoryId?: string;
  subcategoryId?: string;
  otherSubcategoryName?: string;
  about?: string;
  description?: string;
  phone?: string;
  officialEmail?: string;
  website?: string;
  socials?: Record<string, string>;
  amenities?: string[];
  address?: string;
  city?: string;
  state?: string;
}

/**
 * A business profile is read from several places at once — the hub view, the
 * dashboard tiles and the public storefront (`['business','public',code]`) —
 * so a save that only refreshed the screen the merchant was standing on would
 * leave the rest of the app showing the old details. They all share the
 * `business` prefix, so one invalidation covers every reader.
 */
const BUSINESS_QUERY_PREFIX = ['business'] as const;

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    // The shared API method takes an open record because the owner-registration
    // flow assembles a wider payload; this hook only ever sends the profile
    // fields declared above.
    mutationFn: (input: UpdateBusinessProfileInput) =>
      businessDashboardApi.updateMyBusiness({ ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_PREFIX });
    },
  });
}