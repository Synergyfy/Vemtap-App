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
  /**
   * Picked files that failed to upload. Best-effort still returns whatever
   * made it, but the caller must tell the user what is missing — a silent
   * drop left owners believing a logo was saved when it was not.
   */
  failures: number;
}

/**
 * Uploads a document (PDF, image) to `POST /uploads` and returns its hosted URL.
 * Used for verification documents (NIN, CAC, etc.).
 */
export async function uploadDocument({
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
    logger.warn('business', 'Document upload failed', {
      fileName,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
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
  const uploads: BrandingMediaUploads = { failures: 0 };
  let attempts = 0;
  let succeeded = 0;

  if (branding.logoUri) {
    attempts += 1;
    const url = await uploadBusinessImage({
      fileUri: branding.logoUri,
      fileName: 'business-logo.jpg',
    });
    if (url) {
      uploads.logoUrl = url;
      succeeded += 1;
    }
  }

  if (branding.coverUri) {
    attempts += 1;
    const url = await uploadBusinessImage({
      fileUri: branding.coverUri,
      fileName: 'business-cover.jpg',
    });
    if (url) {
      uploads.coverImage = url;
      succeeded += 1;
    }
  }

  const localGallery = (branding.galleryUris ?? []).filter(
    uri => !/^https?:\/\//i.test(uri),
  );
  if (localGallery.length > 0) {
    attempts += localGallery.length;
    const urls = await Promise.all(
      localGallery.map((fileUri, index) =>
        uploadBusinessImage({
          fileUri,
          fileName: `business-photo-${index + 1}.jpg`,
        }),
      ),
    );
    const uploaded = urls.filter((url): url is string => Boolean(url));
    succeeded += uploaded.length;
    if (uploaded.length > 0) uploads.gallery = uploaded;
  }

  uploads.failures = attempts - succeeded;
  return uploads;
}
