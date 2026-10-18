import type { CatalogueOrder } from '@api/ordersApi';
import type { BusinessBooking } from '@api/bookingsApi';
import type { PosSale } from '@api/posApi';
import {
  presentOrder,
  presentOrderDetail,
} from '@features/business/hooks/useBusinessOrders';
import { presentBooking } from '@features/business/hooks/useBusinessBookings';
import { presentPosSaleRow } from '@features/business/screens/BusinessPosOrdersViewScreen';

/** API orders in each hub status, for the orders hub and order detail. */
export const catalogueOrdersFixture = [
  {
    id: 'abcdef12-3456-7890-abcd-ef1234567890',
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    status: 'new',
    totalAmount: 34500,
    items: [
      {
        id: 'line-1',
        quantity: 2,
        name: 'Ribeye Steak',
        unitPrice: 13000,
        totalPrice: 26000,
      },
    ],
    customer: { firstName: 'Amina', lastName: 'Bello' },
    branch: { id: 'br-1', name: 'The Azure Bistro Main' },
  },
  {
    id: 'bcdef123-4567-8901-bcde-f12345678901',
    createdAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    status: 'processing',
    totalAmount: 11200,
    items: [
      {
        id: 'line-2',
        quantity: 1,
        name: 'Jollof Combo',
        unitPrice: 11200,
        totalPrice: 11200,
      },
    ],
    customer: { firstName: 'Tunde', lastName: 'Bakare' },
    branch: { id: 'br-1', name: 'The Azure Bistro Main' },
  },
  {
    id: 'cdef1234-5678-9012-cdef-123456789012',
    createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    status: 'completed',
    totalAmount: 6500,
    items: [
      {
        id: 'line-3',
        quantity: 1,
        name: 'Zobo (50cl)',
        unitPrice: 6500,
        totalPrice: 6500,
      },
    ],
    customer: { firstName: 'Ada', lastName: 'Obi' },
    branch: { id: 'br-1', name: 'The Azure Bistro Main' },
  },
] as unknown as CatalogueOrder[];

export const ordersFixture = catalogueOrdersFixture.map(presentOrder);

export const orderDetailFixture = presentOrderDetail(catalogueOrdersFixture[0]);

export const bookingsFixture = [
  {
    id: 'bk-1',
    status: 'booked',
    date: '2099-10-20',
    time: '14:30',
    durationMinutes: 35,
    itemName: 'Facial & Manicure',
    customer: { firstName: 'Ada', lastName: 'Obi' },
  },
  {
    id: 'bk-2',
    status: 'booked',
    date: '2099-10-20',
    time: '16:00',
    durationMinutes: 60,
    itemName: 'Swedish Massage',
    customer: { firstName: 'Samuel', lastName: 'Adeleke' },
  },
].map(booking => presentBooking(booking as unknown as BusinessBooking));

export const posSalesFixture = [
  {
    id: 'sale-1',
    receiptNumber: 'POS-1049',
    branchId: 'br-1',
    cashierName: 'David K.',
    total: 9600,
    paymentMethod: 'card',
    status: 'completed',
    orderType: 'dine_in',
    orderedAt: '2026-10-18T13:42:00.000Z',
    items: [{ id: 'i1', productName: 'Lunch Combo', quantity: 1, totalPrice: 9600 }],
  },
  {
    id: 'sale-2',
    receiptNumber: 'POS-1048',
    branchId: 'br-1',
    cashierName: 'Sarah M.',
    total: 14800,
    paymentMethod: 'cash',
    status: 'completed',
    orderType: 'takeaway',
    orderedAt: '2026-10-18T13:15:00.000Z',
    items: [{ id: 'i2', productName: 'Smokey Jollof', quantity: 2, totalPrice: 14800 }],
  },
] as unknown as PosSale[];

export const posOrdersFixture = posSalesFixture.map(presentPosSaleRow);
