import { useEffect, useRef } from 'react';
import {
  connectPosSocket,
  joinPosTill,
  leavePosTill,
  openGuestTrackingSocket,
  POS_SOCKET_EVENTS,
  type PosOrderEvent,
} from '@api/posSocket';
import type { DisplayState, DisplayTicket, TipOption } from '@api/posApi';
import { queryClient } from '@store/queryClient';
import { useAppState } from '@hooks/useAppState';
import { posKeys } from './usePos';

/**
 * Kitchen stream live updates: any order created or moved in the business
 * refreshes the stream (one bounded query) instead of patching rows by hand.
 */
export function useKitchenRealtime(branchId: string | null) {
  const appState = useAppState();
  useEffect(() => {
    if (appState !== 'active') return undefined;
    let cancelled = false;
    let detach: (() => void) | undefined;
    void connectPosSocket().then(socket => {
      if (!socket || cancelled) return;
      const refresh = (event: PosOrderEvent) => {
        if (!branchId || !event.branchId || event.branchId === branchId) {
          void queryClient.invalidateQueries({ queryKey: posKeys.kitchen(branchId) });
        }
      };
      socket.on(POS_SOCKET_EVENTS.ORDER_CREATED, refresh);
      socket.on(POS_SOCKET_EVENTS.ORDER_STATUS, refresh);
      detach = () => {
        socket.off(POS_SOCKET_EVENTS.ORDER_CREATED, refresh);
        socket.off(POS_SOCKET_EVENTS.ORDER_STATUS, refresh);
      };
    });
    return () => {
      cancelled = true;
      detach?.();
    };
  }, [appState, branchId]);
}

/**
 * Customer display live updates for one till: the pushed ticket is written
 * straight into the display query, and `onPaid` fires when the till settles it.
 */
export function useCustomerDisplayRealtime(
  tillId: string | undefined,
  handlers: { onPaid?: (saleId: string | null) => void } = {},
) {
  const appState = useAppState();
  // Held in a ref so a new handler each render does not re-join the till.
  const onPaidRef = useRef(handlers.onPaid);
  onPaidRef.current = handlers.onPaid;
  useEffect(() => {
    if (!tillId || appState !== 'active') return undefined;
    let cancelled = false;
    let detach: (() => void) | undefined;
    void joinPosTill(tillId).then(async joined => {
      if (!joined || cancelled) return;
      const socket = await connectPosSocket();
      if (!socket || cancelled) return;
      const key = posKeys.display(tillId);
      const onTicket = (payload: { ticket: DisplayTicket; tipOptions: TipOption[] }) => {
        queryClient.setQueryData<DisplayState>(key, current =>
          current
            ? { ...current, ticket: payload.ticket, tipOptions: payload.tipOptions }
            : current,
        );
      };
      const onCleared = () => {
        queryClient.setQueryData<DisplayState>(key, current =>
          current ? { ...current, ticket: null, tipOptions: [] } : current,
        );
      };
      const onPayment = (payload: { saleId?: string | null }) => {
        onCleared();
        onPaidRef.current?.(payload?.saleId ?? null);
      };
      socket.on(POS_SOCKET_EVENTS.TICKET_UPDATED, onTicket);
      socket.on(POS_SOCKET_EVENTS.TICKET_CLEARED, onCleared);
      socket.on(POS_SOCKET_EVENTS.PAYMENT_COMPLETED, onPayment);
      detach = () => {
        socket.off(POS_SOCKET_EVENTS.TICKET_UPDATED, onTicket);
        socket.off(POS_SOCKET_EVENTS.TICKET_CLEARED, onCleared);
        socket.off(POS_SOCKET_EVENTS.PAYMENT_COMPLETED, onPayment);
        leavePosTill(tillId);
      };
    });
    return () => {
      cancelled = true;
      detach?.();
    };
  }, [appState, tillId]);
}

/** Guest order tracking: status pushes refresh the public tracking query. */
export function useGuestTrackingRealtime(trackingToken: string | undefined) {
  const appState = useAppState();
  useEffect(() => {
    if (!trackingToken || appState !== 'active') return undefined;
    const socket = openGuestTrackingSocket(trackingToken);
    if (!socket) return undefined;
    socket.on(POS_SOCKET_EVENTS.ORDER_STATUS, () => {
      void queryClient.invalidateQueries({ queryKey: posKeys.tracking(trackingToken) });
    });
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [appState, trackingToken]);
}
