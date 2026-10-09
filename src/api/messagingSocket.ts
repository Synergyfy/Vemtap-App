/**
 * Socket.io client for the backend `/messaging` namespace.
 *
 * One process-wide connection: the business tab mounts a single realtime hook
 * that owns it, and screens interact through the module-level helpers (join,
 * leave, typing, read receipts) so no screen can spawn a duplicate socket.
 *
 * Tokens live only in secure storage; the socket connects lazily once one is
 * available and stays quiet when the build has no API base URL.
 */

import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL_ORIGIN, IS_API_CONFIGURED } from '@constants/config';
import { getSecureItem } from '@utils/secureStorage';
import { logger } from '@utils/logger';

const MESSAGING_NAMESPACE = '/messaging';

let socket: Socket | null = null;
let connecting: Promise<Socket | null> | null = null;
/** Thread currently open on screen; inbound messages in it are acked as read. */
let activeThreadId: string | null = null;

export function isMessagingSocketConfigured(): boolean {
  return IS_API_CONFIGURED && API_BASE_URL_ORIGIN.length > 0;
}

export function getMessagingSocket(): Socket | null {
  return socket;
}

export function isMessagingSocketConnected(): boolean {
  return socket?.connected === true;
}

export function setActiveMessagingThread(threadId: string | null): void {
  activeThreadId = threadId;
}

export function getActiveMessagingThread(): string | null {
  return activeThreadId;
}

/**
 * Connect (or reconnect) the messaging socket. Reuses the existing instance so
 * listeners bound once survive background/foreground cycles. Resolves null when
 * unconfigured or signed out.
 */
export async function connectMessagingSocket(): Promise<Socket | null> {
  if (!isMessagingSocketConfigured()) return null;

  if (socket) {
    if (socket.connected) return socket;
    const token = await getSecureItem('accessToken');
    if (!token) return null;
    socket.auth = { token, Authorization: `Bearer ${token}` };
    socket.connect();
    return socket;
  }

  if (connecting) return connecting;

  connecting = (async () => {
    const token = await getSecureItem('accessToken');
    if (!token) return null;

    const next = io(`${API_BASE_URL_ORIGIN}${MESSAGING_NAMESPACE}`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 15_000,
      auth: { token, Authorization: `Bearer ${token}` },
    });

    next.on('connect_error', error => {
      logger.warn(
        'api',
        `messaging socket connect error: ${error?.message ?? 'unknown'}`,
      );
    });

    socket = next;
    return next;
  })().finally(() => {
    connecting = null;
  });

  return connecting;
}

/** Drop the transport but keep the instance and its listeners (app backgrounds). */
export function disconnectMessagingSocket(): void {
  socket?.disconnect();
}

/** Tear the instance down completely (owner unmounts / sign-out). */
export function disposeMessagingSocket(): void {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  activeThreadId = null;
}

export function joinMessagingThread(threadId: string): void {
  socket?.emit('joinThread', { threadId });
}

export function leaveMessagingThread(threadId: string): void {
  socket?.emit('leaveThread', { threadId });
}

export function emitMessagingTyping(threadId: string, isTyping: boolean): void {
  socket?.emit('typing', { threadId, isTyping });
}

export function markMessagingRead(threadId: string, messageIds?: string[]): void {
  socket?.emit('markRead', { threadId, messageIds });
}

export function markMessagingDelivered(messageId: string, threadId: string): void {
  socket?.emit('markDelivered', { messageId, threadId });
}
