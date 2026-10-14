/**
 * Socket.io client for the backend `/messaging` namespace.
 *
 * The connection itself is the shared per-namespace singleton in
 * `namespaceSocket` — this module is the messaging vocabulary layered on top
 * (join, leave, typing, read receipts) plus the one piece of state that socket
 * events need to see: the thread currently open on screen, so inbound messages
 * in it are acked as read instead of showing an unread badge.
 *
 * One process-wide connection: a single realtime hook owns it, and screens
 * interact through these helpers so no screen can spawn a duplicate socket.
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

const MESSAGING_NAMESPACE = '/messaging';

/** Thread currently open on screen; inbound messages in it are acked as read. */
let activeThreadId: string | null = null;

export function isMessagingSocketConfigured(): boolean {
  return isSocketConfigured();
}

export function getMessagingSocket(): Socket | null {
  return getNamespaceSocket(MESSAGING_NAMESPACE);
}

export function isMessagingSocketConnected(): boolean {
  return isNamespaceSocketConnected(MESSAGING_NAMESPACE);
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
  return connectNamespaceSocket(MESSAGING_NAMESPACE);
}

/** Drop the transport but keep the instance and its listeners (app backgrounds). */
export function disconnectMessagingSocket(): void {
  disconnectNamespaceSocket(MESSAGING_NAMESPACE);
}

/** Tear the instance down completely (owner unmounts / sign-out). */
export function disposeMessagingSocket(): void {
  disposeNamespaceSocket(MESSAGING_NAMESPACE);
  activeThreadId = null;
}

export function joinMessagingThread(threadId: string): void {
  getMessagingSocket()?.emit('joinThread', { threadId });
}

export function leaveMessagingThread(threadId: string): void {
  getMessagingSocket()?.emit('leaveThread', { threadId });
}

export function emitMessagingTyping(threadId: string, isTyping: boolean): void {
  getMessagingSocket()?.emit('typing', { threadId, isTyping });
}

export function markMessagingRead(threadId: string, messageIds?: string[]): void {
  getMessagingSocket()?.emit('markRead', { threadId, messageIds });
}

export function markMessagingDelivered(messageId: string, threadId: string): void {
  getMessagingSocket()?.emit('markDelivered', { messageId, threadId });
}
