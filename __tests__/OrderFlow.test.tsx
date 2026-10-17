import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { catalogueApi, type CatalogueItem } from '@api/catalogueApi';
import { productCommentsApi } from '@api/productCommentsApi';
import { ordersApi, type CatalogueOrder } from '@api/ordersApi';
import { ApiError } from '@api/ApiError';
import { strings } from '@constants/strings';
import { useAuthStore } from '@store/authStore';
import { ProductDetailScreen } from '@features/order/screens/ProductDetailScreen';
import { OrderCheckoutScreen } from '@features/order/screens/OrderCheckoutScreen';
import { OrderPlacedScreen } from '@features/order/screens/OrderPlacedScreen';

const navigate = jest.fn();
const replace = jest.fn();
const goBack = jest.fn();
const reset = jest.fn();
const navigation = { navigate, replace, goBack, reset } as never;

const liveItem = {
  id: 'item-1',
  name: 'Smoked Chicken Wrap',
  price: 5000,
  description: 'Grilled chicken, slaw and pepper sauce.',
  mainImage: 'https://img.test/wrap.jpg',
  galleryImages: [],
  status: 'active',
  itemType: 'product',
  discountType: 'percentage',
  discountValue: 10,
  stockQuantity: 20,
  isSuspended: false,
  branches: [
    { id: 'branch-2', name: 'Ikeja', isActive: true, isMainBranch: false },
    { id: 'branch-3', name: 'Lekki', isActive: true, isMainBranch: true },
  ],
} as unknown as CatalogueItem;

const draft = {
  branchId: 'branch-1',
  businessName: 'Aurora Grill',
  branchName: 'Wuse',
  items: [
    {
      itemId: 'item-1',
      name: 'Smoked Chicken Wrap',
      image: null,
      unitPrice: 4500,
      quantity: 2,
    },
  ],
  instructions: 'No onions',
};

const copy = strings.orderCheckout;

function withClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function mockProduct() {
  jest.spyOn(catalogueApi, 'getItem').mockResolvedValue(liveItem);
  jest.spyOn(productCommentsApi, 'list').mockResolvedValue({
    comments: [],
    total: 0,
    page: 1,
    limit: 20,
    averageRating: null,
    ratingCount: 0,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: {
      firstName: 'Ada',
      lastName: 'Okafor',
      phone: '+2348012345678',
      email: 'ada@test.dev',
    },
  } as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('product to checkout', () => {
  it('carries the live product and its branch into checkout', async () => {
    mockProduct();
    const screen = await withClient(
      <ProductDetailScreen
        navigation={navigation}
        route={
          {
            key: 'p',
            name: 'ProductDetail',
            params: {
              productId: 'item-1',
              branchId: 'branch-1',
              businessName: 'Aurora Grill',
            },
          } as never
        }
      />,
    );

    await waitFor(() => expect(screen.getByText('Smoked Chicken Wrap')).toBeTruthy());
    expect(catalogueApi.getItem).toHaveBeenCalledWith('item-1', 'branch-1');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Add to Order • ₦4,500'));
    });

    expect(navigate).toHaveBeenCalledWith('OrderCheckout', {
      draft: expect.objectContaining({
        branchId: 'branch-1',
        items: [
          expect.objectContaining({ itemId: 'item-1', quantity: 1, unitPrice: 4500 }),
        ],
      }),
    });
  });

  it('orders from the main branch when opened without one', async () => {
    mockProduct();
    const screen = await withClient(
      <ProductDetailScreen
        navigation={navigation}
        route={
          { key: 'p', name: 'ProductDetail', params: { productId: 'item-1' } } as never
        }
      />,
    );

    await waitFor(() => expect(screen.getByText('Smoked Chicken Wrap')).toBeTruthy());
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Add to Order • ₦4,500'));
    });

    expect(navigate).toHaveBeenCalledWith('OrderCheckout', {
      draft: expect.objectContaining({ branchId: 'branch-3', branchName: 'Lekki' }),
    });
  });
});

describe('checkout', () => {
  const route = { key: 'c', name: 'OrderCheckout', params: { draft } } as never;

  it('places a pickup order and shows the server total', async () => {
    const place = jest.spyOn(ordersApi, 'placeOrder').mockResolvedValue({
      id: 'abcdef12-3456-7890-abcd-ef1234567890',
      totalAmount: 9000,
    } as unknown as CatalogueOrder);
    const screen = await withClient(
      <OrderCheckoutScreen navigation={navigation} route={route} />,
    );

    expect(screen.getByText('Smoked Chicken Wrap')).toBeTruthy();
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText(copy.tableNumber), ' 12 ');
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(copy.placeOrder));
    });

    await waitFor(() =>
      expect(place).toHaveBeenCalledWith({
        branchId: 'branch-1',
        firstName: 'Ada',
        lastName: 'Okafor',
        phone: '+2348012345678',
        email: 'ada@test.dev',
        notes: 'No onions',
        tableNumber: '12',
        items: [{ itemId: 'item-1', quantity: 2 }],
      }),
    );
    expect(replace).toHaveBeenCalledWith('OrderPlaced', {
      orderId: 'abcdef12-3456-7890-abcd-ef1234567890',
      orderNumber: '#ABCDEF12',
      total: 9000,
      itemCount: 2,
      businessName: 'Aurora Grill',
      branchName: 'Wuse',
    });
  });

  it('asks for contact details before calling the API', async () => {
    useAuthStore.setState({ user: null } as never);
    const place = jest.spyOn(ordersApi, 'placeOrder');
    const screen = await withClient(
      <OrderCheckoutScreen navigation={navigation} route={route} />,
    );

    await act(async () => {
      fireEvent.press(screen.getByLabelText(copy.placeOrder));
    });

    expect(screen.getByText(copy.missingContact)).toBeTruthy();
    expect(place).not.toHaveBeenCalled();
  });

  it('shows the server’s reason when the order is refused', async () => {
    jest
      .spyOn(ordersApi, 'placeOrder')
      .mockRejectedValue(
        new ApiError('Insufficient stock for Smoked Chicken Wrap', { status: 400 }),
      );
    const screen = await withClient(
      <OrderCheckoutScreen navigation={navigation} route={route} />,
    );

    await act(async () => {
      fireEvent.press(screen.getByLabelText(copy.placeOrder));
    });

    await waitFor(() =>
      expect(screen.getByText('Insufficient stock for Smoked Chicken Wrap')).toBeTruthy(),
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it('posts every line of a multi-item draft, as a reorder builds', async () => {
    const place = jest.spyOn(ordersApi, 'placeOrder').mockResolvedValue({
      id: 'abcdef12-0000-0000-0000-000000000000',
      totalAmount: 12000,
    } as unknown as CatalogueOrder);
    const screen = await withClient(
      <OrderCheckoutScreen
        navigation={navigation}
        route={
          {
            key: 'c',
            name: 'OrderCheckout',
            params: {
              draft: {
                ...draft,
                items: [
                  ...draft.items,
                  {
                    itemId: 'item-2',
                    name: 'Zobo',
                    image: null,
                    unitPrice: 1500,
                    quantity: 2,
                  },
                ],
              },
            },
          } as never
        }
      />,
    );

    expect(screen.getByText('Zobo')).toBeTruthy();
    expect(screen.getByText(copy.itemsTitle(4))).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(copy.placeOrder));
    });
    await waitFor(() =>
      expect(place).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            { itemId: 'item-1', quantity: 2 },
            { itemId: 'item-2', quantity: 2 },
          ],
        }),
      ),
    );
    expect(replace).toHaveBeenCalledWith(
      'OrderPlaced',
      expect.objectContaining({ itemCount: 4, total: 12000 }),
    );
  });

  it('explains an empty checkout instead of inventing an order', async () => {
    const screen = await withClient(
      <OrderCheckoutScreen
        navigation={navigation}
        route={{ key: 'c', name: 'OrderCheckout' } as never}
      />,
    );
    expect(screen.getByText(copy.empty.title)).toBeTruthy();
  });
});

describe('order placed', () => {
  it('shows the order the server created and opens it', async () => {
    const screen = await render(
      <OrderPlacedScreen
        navigation={navigation}
        route={
          {
            key: 'o',
            name: 'OrderPlaced',
            params: {
              orderId: 'order-1',
              orderNumber: '#ABCDEF12',
              total: 9000,
              itemCount: 2,
              businessName: 'Aurora Grill',
              branchName: 'Wuse',
            },
          } as never
        }
      />,
    );

    expect(screen.getByText('#ABCDEF12')).toBeTruthy();
    expect(screen.getByText('₦9,000')).toBeTruthy();
    expect(screen.getByText('Aurora Grill • Wuse')).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.orderPlaced.viewOrder));
    });
    expect(navigate).toHaveBeenCalledWith('Tabs', {
      screen: 'Account',
      params: { screen: 'OrderDetail', params: { orderId: 'order-1' } },
    });
  });
});
