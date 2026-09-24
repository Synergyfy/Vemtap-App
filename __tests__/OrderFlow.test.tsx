import React from 'react';
import { View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { ProductDetailScreen } from '@features/order/screens/ProductDetailScreen';
import { OrderCheckoutScreen } from '@features/order/screens/OrderCheckoutScreen';

const MockReact = React;
const MockView = View;

interface MockModalProps {
  visible: boolean;
  children: React.ReactNode;
}

jest.mock('@components/ui/Modal', () => ({
  AppModal: ({ visible, children }: MockModalProps) =>
    visible ? MockReact.createElement(MockView, {}, children) : null,
}));

const navigate = jest.fn();
const goBack = jest.fn();
const navigation = { navigate, goBack } as never;

const productRoute = {
  key: 'product-detail',
  name: 'ProductDetail',
  params: undefined,
} as never;

const checkoutRoute = {
  key: 'order-checkout',
  name: 'OrderCheckout',
  params: {
    draft: {
      quantity: 1,
      temperature: 'Medium Rare',
      side: 'Truffle Parmesan Wedges',
      addons: [],
      instructions: '',
      unitPrice: 14000,
      total: 14000,
    },
  },
} as never;

describe('order flow', () => {
  it('carries the selected product into checkout', async () => {
    const screen = await render(
      <ProductDetailScreen navigation={navigation} route={productRoute} />,
    );

    expect(screen.getByText('Woodfire Aged Ribeye Steak (400g)')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Add to Order • ₦14,000'));

    expect(navigate).toHaveBeenCalledWith('OrderCheckout', {
      draft: expect.objectContaining({
        quantity: 1,
        temperature: 'Medium Rare',
        side: 'Truffle Parmesan Wedges',
        unitPrice: 14000,
      }),
    });
  });

  it('opens confirmation and opens the placed order', async () => {
    const screen = await render(
      <OrderCheckoutScreen navigation={navigation} route={checkoutRoute} />,
    );

    await fireEvent.press(screen.getByLabelText('Place Order with Urban Grill'));
    expect(screen.getByText('Order Transmitted to Kitchen!')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('View Active Order Status'));

    expect(navigate).toHaveBeenCalledWith('OrderPlaced', {
      total: '₦18,400',
      fulfillment: 'pickup',
      orderNumber: '#UG-92841',
    });
  });
});
