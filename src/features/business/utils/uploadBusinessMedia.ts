import { uploadFile } from '@api/uploadClient';
import { logger } from '@utils/logger';

/** Shape returned by `POST /uploads` (raw or enveloped). */
interface UploadResponse {
  url?: string;
  data?: { url?: string };
}

export interface BusinessImageInput {
  fileUri: string;
  fileName: string;
  mimeType?: string;
}

export interface BrandingMediaUploads {
  logoUrl?: string;
  coverImage?: string;
  gallery?: string[];
}

const MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

function guessMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXTENSION[extension] ?? 'image/jpeg';
}

/**
 * Uploads one picked image to `POST /uploads` and returns its hosted URL.
 * Best-effort: failures are logged and resolve to null so registration is
 * never blocked by a photo.
 */
export async function uploadBusinessImage({
  fileUri,
  fileName,
  mimeType,
}: BusinessImageInput): Promise<string | null> {
  try {
    const result = await uploadFile<UploadResponse>({
      url: '/uploads',
      fileUri,
      fileName,
      mimeType: mimeType ?? guessMimeType(fileName),
    });

    return result.data?.url ?? result.data?.data?.url ?? null;
  } catch (error) {
    logger.warn('business', 'Business image upload failed', {
      fileName,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Uploads everything picked on the Media & Branding step, in logo → cover →
 * gallery order. Only locally picked files are uploaded — the bundled demo
 * gallery ships as `https://` URLs and must not be re-hosted.
 */
export async function uploadBrandingMedia(branding: {
  logoUri?: string;
  coverUri?: string;
  galleryUris?: string[];
}): Promise<BrandingMediaUploads> {
  const uploads: BrandingMediaUploads = {};

  if (branding.logoUri) {
    const url = await uploadBusinessImage({
      fileUri: branding.logoUri,
      fileName: 'business-logo.jpg',
    });
    if (url) uploads.logoUrl = url;
  }

  if (branding.coverUri) {
    const url = await uploadBusinessImage({
      fileUri: branding.coverUri,
      fileName: 'business-cover.jpg',
    });
    if (url) uploads.coverImage = url;
  }

  const localGallery = (branding.galleryUris ?? []).filter(
    uri => !/^https?:\/\//i.test(uri),
  );
  if (localGallery.length > 0) {
    const urls = await Promise.all(
      localGallery.map((fileUri, index) =>
        uploadBusinessImage({
          fileUri,
          fileName: `business-photo-${index + 1}.jpg`,
        }),
      ),
    );
    const uploaded = urls.filter((url): url is string => Boolean(url));
    if (uploaded.length > 0) uploads.gallery = uploaded;
  }

  return uploads;
}
