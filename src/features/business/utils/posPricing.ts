import type { PosOrderType, PosSettings } from '@api/posApi';
import type { TicketLine } from '@store/posTicketStore';

/**
 * Client-side estimate of a ticket's charges, mirroring the server's
 * `computePosCharges` so the till shows the total it will be charged. The
 * server reprices on submit and its figure is the one the receipt shows.
 */

export interface TicketTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  net: number;
  tax: number;
  serviceCharge: number;
  packagingFee: number;
  total: number;
}

type PricingSettings = Pick<
  PosSettings,
  | 'taxEnabled'
  | 'taxRate'
  | 'pricesIncludeTax'
  | 'takeawayVatExempt'
  | 'serviceChargeEnabled'
  | 'serviceChargeRate'
  | 'serviceChargeWaivable'
  | 'packagingFee'
  | 'packagingAutoApply'
>;

const round2 = (value: number) => Math.round(value * 100) / 100;

export function computeTicketTotals(
  lines: Pick<TicketLine, 'unitPrice' | 'quantity' | 'discount'>[],
  settings: Partial<PricingSettings> | undefined,
  options: {
    cartDiscount?: number;
    orderType?: PosOrderType;
    waiveServiceCharge?: boolean;
  } = {},
): TicketTotals {
  const subtotal = round2(
    lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  );
  const lineDiscount = lines.reduce((sum, line) => sum + (line.discount ?? 0), 0);
  const discount = round2(Math.min(subtotal, lineDiscount + (options.cartDiscount ?? 0)));
  const net = round2(subtotal - discount);
  const orderType = options.orderType ?? 'dine_in';

  const exempt = orderType === 'takeaway' && settings?.takeawayVatExempt;
  const rate = settings?.taxEnabled && !exempt ? (settings.taxRate ?? 0) / 100 : 0;
  const tax = settings?.pricesIncludeTax
    ? round2(net - net / (1 + rate))
    : round2(net * rate);

  const waived = options.waiveServiceCharge && (settings?.serviceChargeWaivable ?? true);
  const serviceCharge =
    settings?.serviceChargeEnabled && !waived
      ? round2((net * (settings.serviceChargeRate ?? 0)) / 100)
      : 0;
  const packagingFee =
    orderType === 'takeaway' && settings?.packagingAutoApply
      ? round2(settings.packagingFee ?? 0)
      : 0;

  return {
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    discount,
    net,
    tax,
    serviceCharge,
    packagingFee,
    total: round2(
      net + (settings?.pricesIncludeTax ? 0 : tax) + serviceCharge + packagingFee,
    ),
  };
}
