import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

const money = z.union([z.string(), z.number()]).nullish();

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * The catalogue product an order line points at. Responses nest it under `item`
 * and it carries the display name and image the line itself does not.
 */
const orderLineProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().nullish(),
  price: money,
  mainImage: z.string().nullish(),
});

/**
 * `CatalogueOrderItem` exactly as the server sends it, verified against a live
 * `GET /catalogue/orders/my-orders` payload.
 *
 * The wire names differ from what the UI wants: there is no `name`,
 * `unitPrice` or `totalPrice` on the line at all — the price sits in
 * `priceAtOrder` and the label lives in the nested `item`. The earlier schema
 * asked for `catalogueItemId`/`name`/`unitPrice`/`totalPrice`, all of which are
 * absent, so `safeParse` succeeded while every item rendered blank. The
 * transform below turns the wire shape into the fields screens actually use.
 */
export const orderItemSchema = z
  .object({
    id: z.string().optional(),
    orderId: z.string().nullish(),
    itemId: z.string().nullish(),
    quantity: z.number().nullish().default(1),
    priceAtOrder: money,
    refundedQuantity: z.number().nullish().default(0),
    loyaltyPointsAtOrder: z.number().nullish(),
    offerId: z.string().nullish(),
    item: orderLineProductSchema.nullish(),
  })
  .transform(line => {
    const quantity = line.quantity ?? 1;
    const unitPrice = toNumber(line.priceAtOrder);
    return {
      id: line.id,
      orderId: line.orderId,
      itemId: line.itemId,
      quantity,
      name: line.item?.name ?? null,
      image: line.item?.mainImage ?? null,
      unitPrice: line.priceAtOrder ?? null,
      totalPrice: unitPrice === null ? null : unitPrice * quantity,
      refundedQuantity: line.refundedQuantity ?? 0,
      loyaltyPointsAtOrder: line.loyaltyPointsAtOrder ?? null,
      offerId: line.offerId ?? null,
    };
  });
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderBusinessSchema = z.object({
  id: z.string().optional(),
  name: z.string().nullish(),
  logoUrl: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

export const orderBranchSchema = z.object({
  id: z.string().optional(),
  name: z.string().nullish(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

/** The customer joined onto business-side order queries. */
export const orderCustomerSchema = z
  .object({
    id: z.string().optional(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    phone: z.string().nullish(),
    email: z.string().nullish(),
    avatar: z.string().nullish(),
  })
  .nullish();

export const catalogueOrderSchema = z.object({
  id: z.string(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  businessId: z.string().nullish(),
  business: orderBusinessSchema.nullish(),
  branchId: z.string().nullish(),
  branch: orderBranchSchema.nullish(),
  customerId: z.string().nullish(),
  customer: orderCustomerSchema,
  attendedByUser: orderCustomerSchema,
  deviceId: z.string().nullish(),
  status: z.string().nullish().default('new'),
  notes: z.string().nullable().optional(),
  tableNumber: z.string().nullable().optional(),
  totalAmount: money,
  loyaltyAwarded: z.boolean().nullish(),
  items: z.array(orderItemSchema).nullish().default([]),
  bookingDate: z.string().nullable().optional(),
  bookingTime: z.string().nullable().optional(),
});
export type CatalogueOrder = z.infer<typeof catalogueOrderSchema>;

export const customerOrdersSchema = z.union([
  z.array(catalogueOrderSchema),
  z
    .object({
      data: z.array(catalogueOrderSchema),
    })
    .transform(res => res.data),
]);

export const businessOrdersListSchema = z.union([
  z.object({
    data: z.array(catalogueOrderSchema),
    total: z.number().nullish(),
    page: z.number().nullish(),
    limit: z.number().nullish(),
  }),
  z.array(catalogueOrderSchema).transform(items => ({
    data: items,
    total: items.length,
    page: 1,
    limit: items.length,
  })),
]);
export type BusinessOrdersList = z.infer<typeof businessOrdersListSchema>;

export interface BusinessOrdersQuery {
  page?: number;
  limit?: number;
  status?: string;
  branchId?: string;
  type?: 'order' | 'booking';
}

export const ordersApi = {
  /**
   * List orders for the authenticated customer.
   */
  async getMyOrders(options: ApiRequestOptions = {}): Promise<CatalogueOrder[]> {
    return requestValidated<CatalogueOrder[]>(
      {
        method: 'GET',
        url: '/catalogue/orders/my-orders',
        ...options,
      },
      customerOrdersSchema,
    );
  },

  /**
   * Get single order detail.
   */
  async getOrder(id: string, options: ApiRequestOptions = {}): Promise<CatalogueOrder> {
    return requestValidated<CatalogueOrder>(
      {
        method: 'GET',
        url: `/catalogue/orders/${id}`,
        ...options,
      },
      catalogueOrderSchema,
    );
  },

  /**
   * Business: list orders with filtering.
   */
  async listBusinessOrders(
    query: BusinessOrdersQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<BusinessOrdersList> {
    return requestValidated<BusinessOrdersList>(
      {
        method: 'GET',
        url: '/catalogue/orders',
        params: query,
        ...options,
      },
      businessOrdersListSchema,
    );
  },

  /**
   * Business: update order status.
   */
  async updateOrderStatus(
    id: string,
    status: string,
    options: ApiRequestOptions = {},
  ): Promise<CatalogueOrder> {
    return requestValidated<CatalogueOrder>(
      {
        method: 'PATCH',
        url: `/catalogue/orders/${id}/status`,
        data: { status },
        ...options,
      },
      catalogueOrderSchema,
    );
  },
};
