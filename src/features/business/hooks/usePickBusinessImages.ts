import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { showError } from '@components/shared';
import { uploadBusinessImage } from '@features/business/utils/uploadBusinessMedia';

/**
 * Pick images from the library and upload them as business media. Resolves to
 * the hosted URLs (empty when the owner cancels or every upload fails).
 */
export function usePickBusinessImages(
  limit = 5,
  /** Crop frame for a single image (`[1, 1]` logo, `[16, 9]` banner). */
  aspect: [number, number] | null = null,
) {
  const [uploading, setUploading] = useState(false);

  const pick = useCallback(async (): Promise<string[]> => {
    if (uploading) return [];
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: limit > 1,
      selectionLimit: limit,
      // Cropping only applies to a single pick.
      allowsEditing: limit === 1 && aspect !== null,
      aspect: aspect ?? undefined,
      quality: 0.8,
    });
    if (result.canceled || !result.assets.length) return [];
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        result.assets.map(asset =>
          uploadBusinessImage({
            fileUri: asset.uri,
            fileName: asset.fileName ?? 'product.jpg',
            mimeType: asset.mimeType,
          }),
        ),
      );
      const urls = uploaded.filter((url): url is string => Boolean(url));
      if (!urls.length) showError('Could not upload media. Please try again.');
      return urls;
    } finally {
      setUploading(false);
    }
  }, [aspect, limit, uploading]);

  return { pick, uploading };
}
