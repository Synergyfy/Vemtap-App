import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { DealClaimedSuccessScreen } from '@features/claimedDeal/screens/DealClaimedSuccessScreen';
import { MyClaimedDealScreen } from '@features/claimedDeal/screens/MyClaimedDealScreen';
import { MerchantChatScreen } from '@features/merchantChat/screens/MerchantChatScreen';
import { GiftDealSentSuccessScreen } from '@features/giftDeal/screens/GiftDealSentSuccessScreen';

const baseNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  canGoBack: jest.fn(() => true),
};

const baseRoute = {
  key: 'route',
  name: 'route',
  params: { dealId: 'urban-grill-lunch' },
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('opens My Claimed Deal from claim success', async () => {
  const navigation = { ...baseNavigation };
  const screen = await render(
    <DealClaimedSuccessScreen
      navigation={navigation as never}
      route={{ ...baseRoute, name: 'DealClaimedSuccess' } as never}
    />,
  );

  expect(screen.getByText('Deal Claimed!')).toBeTruthy();
  await fireEvent.press(screen.getByText('View My Deal'));

  expect(navigation.navigate).toHaveBeenCalledWith('MyClaimedDeal', {
    dealId: 'urban-grill-lunch',
  });
});

test('opens merchant chat from contact business options', async () => {
  const navigation = { ...baseNavigation };
  const screen = await render(
    <MyClaimedDealScreen
      navigation={navigation as never}
      route={{ ...baseRoute, name: 'MyClaimedDeal' } as never}
    />,
  );

  expect(screen.getByText('Claim Active')).toBeTruthy();
  await fireEvent.press(screen.getByText('Contact Business'));
  await fireEvent.press(await screen.findByText('In-App Chat'));

  expect(navigation.navigate).toHaveBeenCalledWith('MerchantChat', {
    dealId: 'urban-grill-lunch',
  });
});

test('sends a merchant chat message', async () => {
  const navigation = { ...baseNavigation };
  const screen = await render(
    <MerchantChatScreen
      navigation={navigation as never}
      route={{ ...baseRoute, name: 'MerchantChat' } as never}
    />,
  );

  await fireEvent.changeText(
    screen.getByPlaceholderText('Message Urban Grill & Bistro...'),
    'Can I bring two guests?',
  );
  await fireEvent.press(screen.getByLabelText('Send message'));

  expect(screen.getByText('Can I bring two guests?')).toBeTruthy();
});

test('renders gift sent success with recipient details', async () => {
  const navigation = { ...baseNavigation };
  const screen = await render(
    <GiftDealSentSuccessScreen
      navigation={navigation as never}
      route={
        {
          ...baseRoute,
          name: 'GiftDealSentSuccess',
          params: {
            dealId: 'urban-grill-lunch',
            recipient: {
              firstName: 'Amara',
              lastName: 'Okafor',
              email: 'amara@email.com',
              phone: '8012345678',
            },
          },
        } as never
      }
    />,
  );

  expect(screen.getByText('Gift Deal Sent!')).toBeTruthy();
  expect(screen.getByText('Amara Okafor')).toBeTruthy();
  expect(screen.getByText('#VT-GIFT-83921')).toBeTruthy();
});
