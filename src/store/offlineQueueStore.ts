import { createMMKV } from 'react-native-mmkv';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';
import { create } from 'zustand';

const storage = createMMKV({ id: 'vemtap-offline-queue' });

const zustandStorage = {
  getItem: (name: string): string | null => storage.getString(name) ?? null,
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};

export interface QueuedMutation {
  id: string;
  kind: string;
  payload: unknown;
  createdAt: string;
  attempts: number;
}

interface OfflineQueueState {
  queue: QueuedMutation[];
  enqueue: (mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'attempts'>) => string;
  dequeue: (id: string) => void;
  markAttempt: (id: string) => void;
  clear: () => void;
}

/**
 * Offline mutation queue — persist non-idempotent-safe ops made while offline
 * and replay them on reconnect (see services/offlineReplay.ts).
 * Do NOT enqueue payments here without an idempotency key on the server.
 */
export const useOfflineQueueStore = create<OfflineQueueState>()(
  devtools(
    persist(
      set => ({
        queue: [],
        enqueue: mutation => {
          const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          set(state => ({
            queue: [
              ...state.queue,
              {
                ...mutation,
                id,
                createdAt: new Date().toISOString(),
                attempts: 0,
              },
            ],
          }));
          return id;
        },
        dequeue: id =>
          set(state => ({ queue: state.queue.filter(item => item.id !== id) })),
        markAttempt: id =>
          set(state => ({
            queue: state.queue.map(item =>
              item.id === id ? { ...item, attempts: item.attempts + 1 } : item,
            ),
          })),
        clear: () => set({ queue: [] }),
      }),
      {
        name: 'vemtap-offline-queue',
        storage: createJSONStorage(() => zustandStorage),
      },
    ),
    { name: 'OfflineQueue' },
  ),
);
