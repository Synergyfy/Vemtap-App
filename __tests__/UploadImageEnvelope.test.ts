import { uploadFile } from '@api/uploadClient';

const mockRequest = jest.fn();

jest.mock('axios', () => {
  // `uploadClient` registers interceptors at import time, so the stub has to
  // answer `create` and both interceptor registries. `request` delegates
  // rather than holding the reference: the factory runs while the module
  // under test is still being evaluated, so `mockRequest` is not yet bound.
  const instance = {
    request: (...args: unknown[]) => mockRequest(...args),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: { create: jest.fn(() => instance) },
    AxiosError: class extends Error {},
    AxiosHeaders: { from: () => ({ set: jest.fn() }) },
  };
});

/**
 * This suite used to describe an `uploadImage(uri)` helper that unwrapped a URL
 * out of the response and defaulted to `/uploads`. `uploadClient` was
 * generalised into `uploadFile(options)` instead — the URL is supplied by the
 * caller and the response is passed through untouched — so the old assertions no
 * longer described anything and the file sat failing on `main`. These cover the
 * contract that actually ships: multipart POST to the caller's URL, the caller's
 * fields travelling with it, and the response envelope handed back as-is.
 */
describe('uploadFile', () => {
  const options = {
    url: '/uploads',
    fileUri: 'file://avatar.jpg',
    fileName: 'avatar.jpg',
  };

  // `FormData.get` is not a faithful reader under Jest — a file entry reads back
  // as the string "[object Object]" — so the file payload is read from the
  // `append` call that produced it instead.
  let appended: [string, unknown][];

  beforeEach(() => {
    mockRequest.mockReset();
    appended = [];
    jest
      .spyOn(FormData.prototype, 'append')
      .mockImplementation((...args: [string, unknown]) => {
        appended.push([args[0], args[1]]);
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const appendedAs = (field: string) => appended.find(([key]) => key === field)?.[1];

  it('posts multipart to the caller-supplied url', async () => {
    mockRequest.mockResolvedValueOnce({ data: { url: 'https://cdn/c.jpg' } });

    await uploadFile(options);

    const config = mockRequest.mock.calls[0][0];
    expect(config).toEqual(expect.objectContaining({ method: 'POST', url: '/uploads' }));
    expect(config.data).toBeInstanceOf(FormData);
  });

  // `FormData.get` is not a faithful reader under Jest — a file entry reads back
  // as the string "[object Object]" — so the file payload is read from the
  // `append` call that produced it instead.

  it('sends the file under the default field name and content type', async () => {
    mockRequest.mockResolvedValueOnce({ data: {} });

    await uploadFile(options);

    expect(appendedAs('file')).toEqual(
      expect.objectContaining({
        uri: 'file://avatar.jpg',
        name: 'avatar.jpg',
        type: 'application/octet-stream',
      }),
    );
  });

  it('honours a custom field name and mime type', async () => {
    mockRequest.mockResolvedValueOnce({ data: {} });

    await uploadFile({ ...options, fieldName: 'avatar', mimeType: 'image/jpeg' });

    expect(appendedAs('avatar')).toEqual(expect.objectContaining({ type: 'image/jpeg' }));
  });

  it('carries additionalFields alongside the file', async () => {
    mockRequest.mockResolvedValueOnce({ data: {} });

    await uploadFile({ ...options, additionalFields: { folder: 'avatars' } });

    expect(appendedAs('folder')).toBe('avatars');
  });

  /**
   * Unwrapping used to live here. Callers now read `result.data.url` themselves
   * — `useProfile` accepts both `{ url }` and `{ data: { url } }` for that
   * reason — so a response is returned exactly as the transport saw it.
   */
  it('returns the response payload without unwrapping it', async () => {
    mockRequest.mockResolvedValueOnce({ data: { url: 'https://cdn/a.jpg' } });

    await expect(uploadFile(options)).resolves.toEqual({
      data: { url: 'https://cdn/a.jpg' },
    });
  });

  it('reports progress as a fraction, with the byte counts', async () => {
    mockRequest.mockResolvedValueOnce({ data: {} });
    const onProgress = jest.fn();

    await uploadFile({ ...options, onProgress });
    const config = mockRequest.mock.calls[0][0];

    config.onUploadProgress({ total: 200, loaded: 50 });

    // (fraction, loaded, total) — the counts are there so a caller can render
    // "3.2 MB of 12 MB" rather than only a percentage.
    expect(onProgress).toHaveBeenCalledWith(0.25, 50, 200);
  });
});
