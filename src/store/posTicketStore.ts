import { create } from 'zustand';
import type { PosOrderType } from '@api/posApi';

/**
 * The ticket being rung up on this till: lines, the attached customer and the
 * table. It drives New Sale → Cart → Tender → Split and is mirrored to the
 * customer display. Prices are the catalogue's; the server reprices on submit.
 */

export interface TicketLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  /** Line discount in naira. */
  discount: number;
  detail?: string;
  imageUrl?: string;
  /** Stock on hand when added; null when the item is not stock-tracked. */
  stock?: number | null;
}

export interface TicketCustomer {
  id: string;
  name: string;
  phone?: string;
  tier?: string;
  points?: number;
}

export interface TicketState {
  branchId: string | null;
  tillId: string | null;
  lines: TicketLine[];
  customer: TicketCustomer | null;
  tableNumber: string | null;
  orderType: PosOrderType;
  waiveServiceCharge: boolean;
  /** Whole-ticket discount in naira. */
  cartDiscount: number;
  note: string;
  /** Set when the ticket was resumed from a held sale. */
  heldSaleId: string | null;
  setContext: (context: { branchId?: string | null; tillId?: string | null }) => void;
  addItem: (line: Omit<TicketLine, 'quantity' | 'discount'>) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setLineDiscount: (productId: string, discount: number) => void;
  removeLine: (productId: string) => void;
  setCustomer: (customer: TicketCustomer | null) => void;
  setTable: (tableNumber: string | null) => void;
  setOrderType: (orderType: PosOrderType) => void;
  setWaiveServiceCharge: (waive: boolean) => void;
  setCartDiscount: (amount: number) => void;
  setNote: (note: string) => void;
  loadHeld: (ticket: {
    heldSaleId: string;
    lines: TicketLine[];
    customer: TicketCustomer | null;
    orderType: PosOrderType;
    cartDiscount: number;
    note: string;
  }) => void;
  clear: () => void;
}

const emptyTicket = {
  lines: [] as TicketLine[],
  customer: null,
  tableNumber: null,
  orderType: 'dine_in' as PosOrderType,
  waiveServiceCharge: false,
  cartDiscount: 0,
  note: '',
  heldSaleId: null,
};

export const usePosTicketStore = create<TicketState>()(set => ({
  branchId: null,
  tillId: null,
  ...emptyTicket,
  setContext: context =>
    set(state => ({
      branchId: context.branchId !== undefined ? context.branchId : state.branchId,
      tillId: context.tillId !== undefined ? context.tillId : state.tillId,
    })),
  addItem: line =>
    set(state => {
      const existing = state.lines.find(item => item.productId === line.productId);
      if (existing) {
        return {
          lines: state.lines.map(item =>
            item.productId === line.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return { lines: [...state.lines, { ...line, quantity: 1, discount: 0 }] };
    }),
  setQuantity: (productId, quantity) =>
    set(state => ({
      lines:
        quantity <= 0
          ? state.lines.filter(item => item.productId !== productId)
          : state.lines.map(item =>
              item.productId === productId ? { ...item, quantity } : item,
            ),
    })),
  setLineDiscount: (productId, discount) =>
    set(state => ({
      lines: state.lines.map(item =>
        item.productId === productId
          ? {
              ...item,
              discount: Math.max(0, Math.min(discount, item.unitPrice * item.quantity)),
            }
          : item,
      ),
    })),
  removeLine: productId =>
    set(state => ({ lines: state.lines.filter(item => item.productId !== productId) })),
  setCustomer: customer => set({ customer }),
  setTable: tableNumber => set({ tableNumber }),
  setOrderType: orderType => set({ orderType }),
  setWaiveServiceCharge: waiveServiceCharge => set({ waiveServiceCharge }),
  setCartDiscount: amount => set({ cartDiscount: Math.max(0, amount) }),
  setNote: note => set({ note }),
  loadHeld: ticket => set({ ...emptyTicket, ...ticket }),
  clear: () => set({ ...emptyTicket }),
}));
