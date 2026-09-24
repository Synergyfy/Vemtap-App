import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { HowToClaimScreen } from '@features/howToClaim/screens/HowToClaimScreen';

const navigate = jest.fn();
const navigation = {
  goBack: jest.fn(),
  navigate,
} as never;

const route = {
  key: 'how-to-claim',
  name: 'HowToClaim',
  params: { dealId: 'urban-grill-lunch' },
} as never;

describe('HowToClaimScreen', () => {
  it('renders the three claim steps and opens claim success', async () => {
    const screen = await render(
      <HowToClaimScreen navigation={navigation} route={route} />,
    );

    expect(screen.getByText('Claim your deal in 3 simple steps')).toBeTruthy();
    expect(screen.getByText('Claim the Deal')).toBeTruthy();
    expect(screen.getByText('Visit the Business')).toBeTruthy();
    expect(screen.getByText('Show Your Claim')).toBeTruthy();

    await fireEvent.press(screen.getByText('Claim Deal'));

    expect(navigate).toHaveBeenCalledWith('DealClaimedSuccess', {
      dealId: 'urban-grill-lunch',
    });
  });
});
