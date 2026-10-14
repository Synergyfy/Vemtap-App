/**
 * Socket.io connections, one per backend namespace.
 *
 * The backend exposes several gateways that are separate namespaces on one
 * origin — `/messaging` and `/notifications` today. socket.io treats each
 * namespace as its own connection, so this keeps one singleton per namespace
 * rather than one socket shared across them, and gives each the same
 * connect/reconnect/dispose lifecycle that the messaging socket already had.
 *
 * A shared singleton per namespace is the whole point: two owners racing to
 * connect the same namespace would produce two connections, and a screen
 * mounting its own socket would spawn one per screen. Callers get the same
 * instance, so listeners bound once survive background/foreground cycles.
 *
 * The namespace lives at the server root — NestJS applies its global prefix to
 * HTTP routes only — so a base URL carrying a path prefix must not be reused
 * here. Hence `API_WEBSOCKET_ORIGIN`, which strips it.
 *
 * Tokens live only in secure storage, so the socket connects lazily once one is
 * available and stays quiet when the build has no API base URL.
 */
import { io, type Socket } from 'socket.io-client';
import { API_WEBSOCKET_ORIGIN, IS_API_CONFIGURED } from '@constants/config';
import { getSecureItem } from '@utils/secureStorage';
import { logger } from '@utils/logger';

const sockets = new Map<string, Socket>();
const connecting = new Map<string, Promise<Socket | null>>();

export function isSocketConfigured(): boolean {
  return IS_API_CONFIGURED && API_WEBSOCKET_ORIGIN.length > 0;
}

export function getNamespaceSocket(namespace: string): Socket | null {
  return sockets.get(namespace) ?? null;
}

export function isNamespaceSocketConnected(namespace: string): boolean {
  return sockets.get(namespace)?.connected === true;
}

/**
 * Connect (or reconnect) one namespace's socket. Reuses the existing instance so
 * listeners bound once survive background/foreground cycles. Resolves null when
 * unconfigured or signed out.
 */
export async function connectNamespaceSocket(namespace: string): Promise<Socket | null> {
  if (!isSocketConfigured()) return null;

  const existing = sockets.get(namespace);
  if (existing) {
    if (existing.connected) return existing;
    const token = await getSecureItem('accessToken');
    if (!token) return null;
    existing.auth = { token, Authorization: `Bearer ${token}` };
    existing.connect();
    return existing;
  }

  // A connect already in flight for this namespace is the one to wait on;
  // starting a second would race and leave an orphan socket behind.
  const inFlight = connecting.get(namespace);
  if (inFlight) return inFlight;

  const pending = (async () => {
    const token = await getSecureItem('accessToken');
    if (!token) return null;

    const next = io(`${API_WEBSOCKET_ORIGIN}${namespace}`, {
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
        `${namespace} socket connect error: ${error?.message ?? 'unknown'}`,
      );
    });

    sockets.set(namespace, next);
    return next;
  })().finally(() => {
    connecting.delete(namespace);
  });

  connecting.set(namespace, pending);
  return pending;
}

/** Drop the transport but keep the instance and its listeners (app backgrounds). */
export function disconnectNamespaceSocket(namespace: string): void {
  sockets.get(namespace)?.disconnect();
}

/** Tear the instance down completely (owner unmounts / sign-out). */
export function disposeNamespaceSocket(namespace: string): void {
  const socket = sockets.get(namespace);
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  sockets.delete(namespace);
}
