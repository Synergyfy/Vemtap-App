import { create } from 'zustand';

/**
 * A guest's cart in Customer Public Mode (table QR / kiosk). Kept apart from
 * the staff till ticket so a guest ordering on the kiosk never edits a sale a
 * cashier is ringing up.
 */
export interface PublicCartLine {
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface PublicPosCartState {
  branchId: string | null;
  tableNumber: string | null;
  lines: PublicCartLine[];
  name: string;
  phone: string;
  notes: string;
  /** Last order placed from this cart, for the tracking screen. */
  trackingToken: string | null;
  setContext: (context: { branchId: string; tableNumber?: string | null }) => void;
  add: (line: Omit<PublicCartLine, 'quantity'>) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  setGuest: (
    guest: Partial<Pick<PublicPosCartState, 'name' | 'phone' | 'notes'>>,
  ) => void;
  placed: (trackingToken: string | null) => void;
}

export const usePublicPosCartStore = create<PublicPosCartState>()(set => ({
  branchId: null,
  tableNumber: null,
  lines: [],
  name: '',
  phone: '',
  notes: '',
  trackingToken: null,
  setContext: ({ branchId, tableNumber }) =>
    set(state =>
      state.branchId === branchId
        ? { tableNumber: tableNumber ?? state.tableNumber }
        : { branchId, tableNumber: tableNumber ?? null, lines: [] },
    ),
  add: line =>
    set(state => {
      const existing = state.lines.find(item => item.itemId === line.itemId);
      return {
        lines: existing
          ? state.lines.map(item =>
              item.itemId === line.itemId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...state.lines, { ...line, quantity: 1 }],
      };
    }),
  setQuantity: (itemId, quantity) =>
    set(state => ({
      lines:
        quantity <= 0
          ? state.lines.filter(item => item.itemId !== itemId)
          : state.lines.map(item =>
              item.itemId === itemId ? { ...item, quantity } : item,
            ),
    })),
  setGuest: guest => set(guest),
  placed: trackingToken => set({ trackingToken, lines: [], notes: '' }),
}));
