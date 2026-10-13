import { uploadFile } from '@api/uploadClient';
import {
  uploadBrandingMedia,
  uploadBusinessImage,
} from '@features/business/utils/uploadBusinessMedia';

jest.mock('@api/uploadClient', () => ({
  uploadFile: jest.fn(),
}));

const mockUploadFile = uploadFile as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

test('reads the URL from a raw or enveloped upload response', async () => {
  mockUploadFile
    .mockResolvedValueOnce({ data: { url: 'https://cdn/logo.png' } })
    .mockResolvedValueOnce({ data: { data: { url: 'https://cdn/cover.png' } } });

  await expect(
    uploadBusinessImage({ fileUri: 'file://logo.png', fileName: 'logo.png' }),
  ).resolves.toBe('https://cdn/logo.png');
  await expect(
    uploadBusinessImage({ fileUri: 'file://cover.png', fileName: 'cover.png' }),
  ).resolves.toBe('https://cdn/cover.png');
});

test('is best-effort: a failed upload resolves to null', async () => {
  mockUploadFile.mockRejectedValueOnce(new Error('network down'));

  await expect(
    uploadBusinessImage({ fileUri: 'file://logo.png', fileName: 'logo.png' }),
  ).resolves.toBeNull();
});

test('uploads logo, cover and only locally picked gallery photos', async () => {
  mockUploadFile.mockResolvedValue({ data: { url: 'https://cdn/uploaded.jpg' } });

  const result = await uploadBrandingMedia({
    logoUri: 'file://logo.png',
    coverUri: 'file://cover.png',
    galleryUris: [
      'https://lh3.googleusercontent.com/bundled-demo.jpg',
      'file://photo-1.png',
      'file://photo-2.png',
    ],
  });

  expect(result).toEqual({
    logoUrl: 'https://cdn/uploaded.jpg',
    coverImage: 'https://cdn/uploaded.jpg',
    gallery: ['https://cdn/uploaded.jpg', 'https://cdn/uploaded.jpg'],
  });
  // 1 logo + 1 cover + 2 local gallery photos; the bundled https demo is skipped.
  expect(mockUploadFile).toHaveBeenCalledTimes(4);
  expect(mockUploadFile).toHaveBeenCalledWith(
    expect.objectContaining({ url: '/uploads', fileUri: 'file://logo.png' }),
  );
});

test('keeps registration moving when every upload fails', async () => {
  mockUploadFile.mockRejectedValue(new Error('cloudinary down'));

  await expect(
    uploadBrandingMedia({
      logoUri: 'file://logo.png',
      coverUri: 'file://cover.png',
      galleryUris: ['file://photo-1.png'],
    }),
  ).resolves.toEqual({});
});

test('uploads nothing when only bundled demo media is present', async () => {
  await expect(
    uploadBrandingMedia({
      galleryUris: ['https://lh3.googleusercontent.com/demo.jpg'],
    }),
  ).resolves.toEqual({});
  expect(mockUploadFile).not.toHaveBeenCalled();
});
