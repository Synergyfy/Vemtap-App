import { uploadImage } from '@api/uploadClient';

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

beforeEach(() => {
  mockRequest.mockReset();
});

describe('uploadImage', () => {
  const base = { fileUri: 'file://avatar.jpg', fileName: 'avatar.jpg' };

  it('reads a raw { url } response', async () => {
    mockRequest.mockResolvedValueOnce({ data: { url: 'https://cdn/a.jpg' } });
    await expect(uploadImage(base)).resolves.toBe('https://cdn/a.jpg');
  });

  it('reads an enveloped { data: { url } } response', async () => {
    mockRequest.mockResolvedValueOnce({
      data: { data: { url: 'https://cdn/b.jpg' } },
    });
    await expect(uploadImage(base)).resolves.toBe('https://cdn/b.jpg');
  });

  it('throws when the response carries no URL', async () => {
    mockRequest.mockResolvedValueOnce({ data: {} });
    await expect(uploadImage(base)).rejects.toThrow(/did not include a hosted URL/);
  });

  it('posts multipart to /uploads', async () => {
    mockRequest.mockResolvedValueOnce({ data: { url: 'https://cdn/c.jpg' } });
    await uploadImage(base);
    const config = mockRequest.mock.calls[0][0];
    expect(config).toEqual(expect.objectContaining({ method: 'POST', url: '/uploads' }));
    expect(config.data).toBeInstanceOf(FormData);
  });
});
