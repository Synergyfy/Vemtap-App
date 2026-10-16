/**
 * Socket.io client for the backend `/pos` namespace.
 *
 * Staff connections share the per-namespace singleton (`namespaceSocket`) and
 * authenticate with the access token; the server joins every branch room of
 * the business. A till or customer display then `till.join`s one till.
 *
 * Guests ordering from a table QR have no token. Their tracking screen opens a
 * separate connection authenticated with the order's tracking token, which the
 * server scopes to that one order — so it never shares the staff singleton.
 */
import { io, type Socket } from 'socket.io-client';
import {
  connectNamespaceSocket,
  disposeNamespaceSocket,
  getNamespaceSocket,
  isSocketConfigured,
} from '@api/namespaceSocket';
import { API_WEBSOCKET_ORIGIN } from '@constants/config';

export const POS_NAMESPACE = '/pos';

export const POS_SOCKET_EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_STATUS: 'order.status',
  TICKET_UPDATED: 'ticket.updated',
  TICKET_CLEARED: 'ticket.cleared',
  PAYMENT_COMPLETED: 'payment.completed',
  DISPLAY_TIP: 'display.tip',
} as const;

export interface PosOrderEvent {
  orderId: string;
  status: string;
  branchId?: string;
  at?: string;
}

export function connectPosSocket(): Promise<Socket | null> {
  return connectNamespaceSocket(POS_NAMESPACE);
}

export function getPosSocket(): Socket | null {
  return getNamespaceSocket(POS_NAMESPACE);
}

export function disposePosSocket(): void {
  disposeNamespaceSocket(POS_NAMESPACE);
}

/** Follow one till's ticket (customer display / till). Resolves the server ack. */
export async function joinPosTill(tillId: string): Promise<boolean> {
  const socket = await connectPosSocket();
  if (!socket) return false;
  try {
    const ack = (await socket.timeout(5_000).emitWithAck('till.join', { tillId })) as {
      ok?: boolean;
    };
    return ack?.ok === true;
  } catch {
    return false;
  }
}

export function leavePosTill(tillId: string): void {
  getPosSocket()?.emit('till.leave', { tillId });
}

/** A guest's own connection, scoped by the server to one order. */
export function openGuestTrackingSocket(trackingToken: string): Socket | null {
  if (!isSocketConfigured()) return null;
  return io(`${API_WEBSOCKET_ORIGIN}${POS_NAMESPACE}`, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelayMax: 15_000,
    auth: { trackingToken },
  });
}
