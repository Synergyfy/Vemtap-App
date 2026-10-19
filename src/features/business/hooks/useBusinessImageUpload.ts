import { useCallback, useState } from 'react';
import { showToast } from '@components/shared/toast';
import { strings } from '@constants/strings';
import { usePickBusinessImages } from '@features/business/hooks/usePickBusinessImages';
import { useUpdateBusinessProfile } from '@features/business/hooks/useUpdateBusinessProfile';

export type BusinessImageKind = 'logo' | 'cover';

const LOGO_ASPECT: [number, number] = [1, 1];
const COVER_ASPECT: [number, number] = [16, 9];

/**
 * Change the business logo or storefront banner: pick one image, upload it to
 * `POST /uploads`, then save its URL with `PATCH /businesses/my-business`
 * (`logoUrl` / `coverImage`). The save refreshes every reader of the business,
 * so the hub, profile and public storefront all show the new image.
 */
export function useBusinessImageUpload() {
  const logoPicker = usePickBusinessImages(1, LOGO_ASPECT);
  const coverPicker = usePickBusinessImages(1, COVER_ASPECT);
  const update = useUpdateBusinessProfile();
  const [busy, setBusy] = useState<BusinessImageKind | null>(null);
  const copy = strings.businessEditProfile;

  const change = useCallback(
    async (kind: BusinessImageKind) => {
      if (busy) return;
      setBusy(kind);
      try {
        const [url] = await (kind === 'logo' ? logoPicker : coverPicker).pick();
        // Cancelled, or the upload failed (the picker already said so).
        if (!url) return;
        await update.mutateAsync(
          kind === 'logo' ? { logoUrl: url } : { coverImage: url },
        );
        showToast(kind === 'logo' ? copy.logoSaved : copy.coverSaved, 'success');
      } catch {
        showToast(copy.imageSaveFailed, 'error');
      } finally {
        setBusy(null);
      }
    },
    [busy, copy, coverPicker, logoPicker, update],
  );

  return { change, busy };
}
