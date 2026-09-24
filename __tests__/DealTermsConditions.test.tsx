import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { DealTermsConditionsScreen } from '@features/dealDetail/screens/DealTermsConditionsScreen';

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

function renderScreen() {
  return render(
    <DealTermsConditionsScreen
      route={{ params: { dealId: 'urban-grill-lunch' } } as never}
      navigation={navigation as never}
    />,
  );
}

describe('DealTermsConditionsScreen', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the terms and expands the FAQ', async () => {
    const screen = await renderScreen();

    expect(screen.getByText('Deal Terms & Conditions')).toBeTruthy();
    expect(screen.getByText('Redemption Rules')).toBeTruthy();
    expect(
      screen.queryByText(
        'Yes! Unredeemed claims can be released penalty-free up to 30 minutes before the end of the daily lunch window so other members can enjoy them.',
      ),
    ).toBeNull();

    await fireEvent.press(screen.getByLabelText('Can I cancel if my plans change?'));

    expect(
      screen.getByText(
        'Yes! Unredeemed claims can be released penalty-free up to 30 minutes before the end of the daily lunch window so other members can enjoy them.',
      ),
    ).toBeTruthy();
  });

  it('opens the How to Claim screen', async () => {
    const screen = await renderScreen();

    await fireEvent.press(screen.getByLabelText('Claim Deal'));

    expect(navigation.navigate).toHaveBeenCalledWith('HowToClaim', {
      dealId: 'urban-grill-lunch',
    });
  });
});
