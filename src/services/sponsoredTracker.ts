import { AppState } from 'react-native';
import { sponsoredApi, type SponsoredEvent } from '@api/sponsoredApi';
import { useViewerKeyStore } from '@store/viewerKeyStore';

/**
 * Views and taps of promoted deals, batched to `/sponsored/events`.
 *
 * Analytics must never get in the way: events are queued, sent every few
 * seconds (or when the batch fills, or the app leaves the foreground), and a
 * failed batch is dropped. The same card seen again within the hour is not
 * re-sent — the API would not count it either.
 */

const FLUSH_MS = 5_000;
const MAX_BATCH = 20;
const REPEAT_MS = 60 * 60 * 1000;

let queue: SponsoredEvent[] = [];
const lastSent = new Map<string, number>();
let timer: ReturnType<typeof setTimeout> | null = null;
let appStateSubscribed = false;

function subscribeToAppState() {
  if (appStateSubscribed) return;
  appStateSubscribed = true;
  AppState.addEventListener('change', state => {
    if (state !== 'active') void sponsoredTracker.flush();
  });
}

export const sponsoredTracker = {
  track(event: SponsoredEvent, now: number = Date.now()): void {
    const key = `${event.campaignId}:${event.offerId}:${event.type}`;
    const previous = lastSent.get(key);
    if (previous !== undefined && now - previous < REPEAT_MS) return;
    lastSent.set(key, now);
    queue.push(event);
    subscribeToAppState();
    if (queue.length >= MAX_BATCH) {
      void sponsoredTracker.flush();
    } else if (!timer) {
      timer = setTimeout(() => void sponsoredTracker.flush(), FLUSH_MS);
    }
  },

  async flush(): Promise<void> {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!queue.length) return;
    const batch = queue;
    queue = [];
    try {
      await sponsoredApi.recordEvents(useViewerKeyStore.getState().key, batch);
    } catch {
      // Dropped: a lost view is better than a retry storm on a bad network.
    }
  },

  /** Tests only. */
  reset(): void {
    if (timer) clearTimeout(timer);
    timer = null;
    queue = [];
    lastSent.clear();
  },
};
