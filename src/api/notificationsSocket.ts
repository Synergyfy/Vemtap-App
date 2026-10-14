/**
 * Socket.io client for the backend `/notifications` namespace.
 *
 * Same connection lifecycle as `/messaging` (shared per-namespace singleton in
 * `namespaceSocket`), different vocabulary. The gateway puts every connection in
 * a single personal room, so there is nothing to join — the server already knows
 * which user the token belongs to.
 *
 * The one thing this client adds is `sync`: a connection misses every emit made
 * while it was away, so on (re)connect the client asks for the authoritative
 * unread count instead of trusting whatever it last cached. That is what makes
 * the bell safe to read from rather than a number that drifts.
 */
import type { Socket } from 'socket.io-client';
import {
  connectNamespaceSocket,
  disconnectNamespaceSocket,
  disposeNamespaceSocket,
  getNamespaceSocket,
  isNamespaceSocketConnected,
  isSocketConfigured,
} from '@api/namespaceSocket';

const NOTIFICATIONS_NAMESPACE = '/notifications';

export function isNotificationsSocketConfigured(): boolean {
  return isSocketConfigured();
}

export function getNotificationsSocket(): Socket | null {
  return getNamespaceSocket(NOTIFICATIONS_NAMESPACE);
}

export function isNotificationsSocketConnected(): boolean {
  return isNamespaceSocketConnected(NOTIFICATIONS_NAMESPACE);
}

export function connectNotificationsSocket(): Promise<Socket | null> {
  return connectNamespaceSocket(NOTIFICATIONS_NAMESPACE);
}

export function disconnectNotificationsSocket(): void {
  disconnectNamespaceSocket(NOTIFICATIONS_NAMESPACE);
}

export function disposeNotificationsSocket(): void {
  disposeNamespaceSocket(NOTIFICATIONS_NAMESPACE);
}

/**
 * Ask the server for the current unread count.
 *
 * The server answers with the live number rather than echoing the one sent, so
 * a client that was offline — or connected after the notification it missed —
 * corrects itself instead of trusting a stale cache.
 */
export function syncNotificationsUnreadCount(): void {
  getNotificationsSocket()?.emit('sync', { unreadCount: 0 });
}
