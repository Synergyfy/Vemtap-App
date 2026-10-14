import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import {
  connectMessagingSocket,
  getMessagingSocket,
  isMessagingSocketConfigured,
} from '@api/messagingSocket';

export type PresenceKind = 'user' | 'business';

/** JSON-safe snapshot; `lastSeen` is an ISO string from the gateway. */
export interface PresenceStatus {
  isOnline: boolean;
  lastSeen: string | null;
}

export interface PresenceQuery {
  /** Track specific users (the staff side following a customer). */
  userIds?: string[];
  /** Track businesses (the customer side following a merchant). */
  businessIds?: string[];
}

const OFFLINE: PresenceStatus = { isOnline: false, lastSeen: null };

const statusKey = (kind: PresenceKind, id: string) => `${kind}:${id}`;

function normalizeStatus(raw: unknown): PresenceStatus {
  const value = (raw ?? {}) as Partial<PresenceStatus>;
  return {
    isOnline: value.isOnline === true,
    lastSeen: typeof value.lastSeen === 'string' ? value.lastSeen : null,
  };
}

/**
 * The socket is a process-wide singleton shared with the realtime hooks and
 * every other mounted screen, so room memberships have to be reference-counted
 * per channel: React Navigation keeps the thread list mounted underneath an
 * open conversation, and the conversation unmounting must not unsubscribe a
 * channel the list is still watching.
 */
const refCounts = new Map<string, number>();

function retain(keys: string[]): void {
  for (const key of keys) {
    refCounts.set(key, (refCounts.get(key) ?? 0) + 1);
  }
}

/** Keys whose count dropped to zero — the ones that may leave their rooms. */
function release(keys: string[]): string[] {
  const dropped: string[] = [];
  for (const key of keys) {
    const next = (refCounts.get(key) ?? 0) - 1;
    if (next > 0) {
      refCounts.set(key, next);
    } else {
      refCounts.delete(key);
      dropped.push(key);
    }
  }
  return dropped;
}

function splitKeys(dropped: string[]): PresenceQuery {
  const userIds: string[] = [];
  const businessIds: string[] = [];
  for (const key of dropped) {
    const [kind, id] = key.split(':');
    if (id) {
      if (kind === 'user') userIds.push(id);
      else if (kind === 'business') businessIds.push(id);
    }
  }
  return { userIds, businessIds };
}

/**
 * Live presence for the channels a screen renders.
 *
 * Wire protocol (see the messaging gateway):
 * - `presence:subscribe { userIds, businessIds }` → ack `{ users, businesses }`
 * - `presence:update { kind, id, isOnline, lastSeen }` while subscribed
 * - `presence:unsubscribe` on release of the last reference to a channel
 *
 * Server rooms die with the connection, so the subscription is re-emitted on
 * every `connect` — otherwise a reconnect leaves the screen showing whatever
 * the last snapshot said, frozen.
 */
export function usePresence(query: PresenceQuery): {
  userPresence: (id: string) => PresenceStatus;
  businessPresence: (id: string) => PresenceStatus;
} {
  const [statuses, setStatuses] = useState<Map<string, PresenceStatus>>(() => new Map());

  const userKey = [...new Set(query.userIds ?? [])].sort().join(',');
  const businessKey = [...new Set(query.businessIds ?? [])].sort().join(',');

  // Latest ids for the subscribe that runs on (re)connect, without re-binding
  // listeners every render.
  const payloadRef = useRef<PresenceQuery>({});
  payloadRef.current = {
    userIds: userKey ? userKey.split(',') : [],
    businessIds: businessKey ? businessKey.split(',') : [],
  };

  useEffect(() => {
    if (!isMessagingSocketConfigured()) return;
    if (!userKey && !businessKey) return;

    const userIds = userKey ? userKey.split(',') : [];
    const businessIds = businessKey ? businessKey.split(',') : [];
    const keys = [
      ...userIds.map(id => statusKey('user', id)),
      ...businessIds.map(id => statusKey('business', id)),
    ];

    let disposed = false;
    let bound: Socket | null = null;
    retain(keys);

    const applySnapshot = (ack: unknown) => {
      if (disposed) return;
      const value = (ack ?? {}) as {
        users?: Record<string, unknown>;
        businesses?: Record<string, unknown>;
      };
      setStatuses(prev => {
        const next = new Map(prev);
        for (const [id, status] of Object.entries(value.users ?? {})) {
          next.set(statusKey('user', id), normalizeStatus(status));
        }
        for (const [id, status] of Object.entries(value.businesses ?? {})) {
          next.set(statusKey('business', id), normalizeStatus(status));
        }
        return next;
      });
    };

    const subscribe = () => {
      if (disposed) return;
      const { current } = payloadRef;
      const payload = {
        userIds: current.userIds ?? [],
        businessIds: current.businessIds ?? [],
      };
      if (payload.userIds.length === 0 && payload.businessIds.length === 0) {
        return;
      }
      getMessagingSocket()?.emit('presence:subscribe', payload, applySnapshot);
    };

    const handleUpdate = (payload: {
      kind?: PresenceKind;
      id?: string;
      isOnline?: boolean;
      lastSeen?: string | null;
    }) => {
      if (!payload?.id) return;
      if (payload.kind !== 'user' && payload.kind !== 'business') return;
      const key = statusKey(payload.kind, payload.id);
      if (!refCounts.has(key)) return;
      setStatuses(prev => {
        const next = new Map(prev);
        next.set(key, normalizeStatus(payload));
        return next;
      });
    };

    const bind = (socket: Socket) => {
      if (disposed) return;
      bound = socket;
      socket.on('presence:update', handleUpdate);
      socket.on('connect', subscribe);
      if (socket.connected) subscribe();
    };

    connectMessagingSocket()
      .then(socket => {
        if (socket) bind(socket);
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      const dropped = release(keys);
      if (bound) {
        bound.off('presence:update', handleUpdate);
        bound.off('connect', subscribe);
        if (dropped.length > 0 && bound.connected) {
          bound.emit('presence:unsubscribe', splitKeys(dropped));
        }
      }
      // No socket ever arrived: nothing was joined server-side, and release()
      // above has already undone the retain() either way.
    };
  }, [userKey, businessKey]);

  return {
    userPresence: (id: string) => (id && statuses.get(statusKey('user', id))) || OFFLINE,
    businessPresence: (id: string) =>
      (id && statuses.get(statusKey('business', id))) || OFFLINE,
  };
}

/**
 * Human last-seen text for a known timestamp. `null` means we have never seen
 * them — callers should render the plain offline label instead of "Last seen
 * Offline".
 */
export function formatLastSeen(dateString: string | null): string {
  if (!dateString) return 'Offline';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (date.getTime() > now.getTime() - 60000) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatLastSeenShort(dateString: string | null): string {
  if (!dateString) return 'Offline';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (date.getTime() > now.getTime() - 60000) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * One-line presence caption for a header: "Active now" while connected, else
 * "Last seen 5 min ago", or the plain offline label when there is no record.
 */
export function presenceCaption(
  status: PresenceStatus,
  labels: { activeNow: string; offline: string; lastSeenPrefix: string },
): string {
  if (status.isOnline) return labels.activeNow;
  if (!status.lastSeen) return labels.offline;
  return `${labels.lastSeenPrefix} ${formatLastSeen(status.lastSeen)}`;
}
