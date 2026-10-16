import { sponsoredApi } from '@api/sponsoredApi';
import { sponsoredTracker } from '@services/sponsoredTracker';
import { newViewerKey, useViewerKeyStore } from '@store/viewerKeyStore';

const view = (campaignId = 'c-1', offerId = 'o-1') => ({
  campaignId,
  offerId,
  type: 'impression' as const,
});

describe('sponsored tracker', () => {
  let record: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    sponsoredTracker.reset();
    useViewerKeyStore.setState({ key: 'v-test-viewer' });
    record = jest.spyOn(sponsoredApi, 'recordEvents').mockResolvedValue({ recorded: 1 });
  });

  afterEach(() => {
    sponsoredTracker.reset();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('batches events and sends them after a few seconds with the viewer key', async () => {
    sponsoredTracker.track(view('c-1'));
    sponsoredTracker.track({ ...view('c-1'), type: 'tap' });
    expect(record).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(5_000);
    expect(record).toHaveBeenCalledWith('v-test-viewer', [
      view('c-1'),
      { ...view('c-1'), type: 'tap' },
    ]);
  });

  it('does not resend the same view within the hour', async () => {
    const now = Date.parse('2026-10-16T10:00:00Z');
    sponsoredTracker.track(view(), now);
    sponsoredTracker.track(view(), now + 60_000);
    await sponsoredTracker.flush();
    expect(record.mock.calls[0][1]).toHaveLength(1);

    sponsoredTracker.track(view(), now + 61 * 60_000);
    await sponsoredTracker.flush();
    expect(record).toHaveBeenCalledTimes(2);
  });

  it('sends at once when the batch fills, and drops a failed batch', async () => {
    record.mockRejectedValueOnce(new Error('offline'));
    for (let i = 0; i < 20; i += 1) sponsoredTracker.track(view(`c-${i}`));
    await Promise.resolve();
    expect(record).toHaveBeenCalledTimes(1);
    expect(record.mock.calls[0][1]).toHaveLength(20);

    // Nothing is retried.
    await jest.advanceTimersByTimeAsync(10_000);
    expect(record).toHaveBeenCalledTimes(1);
  });

  it('makes anonymous keys the API accepts', () => {
    const key = newViewerKey();
    expect(key).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
    expect(newViewerKey()).not.toBe(key);
  });
});
