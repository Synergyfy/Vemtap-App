import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { CreateDealStep1DiscountStrategyScreen } from '@features/business/screens/CreateDealStep1DiscountStrategyScreen';
import { CreateDealStep2LimitsGiftingRulesScreen } from '@features/business/screens/CreateDealStep2LimitsGiftingRulesScreen';
import { CreateDealStep3ParticipatingBranchesScheduleScreen } from '@features/business/screens/CreateDealStep3ParticipatingBranchesScheduleScreen';
import { CreateDealStep4ReviewLaunchScreen } from '@features/business/screens/CreateDealStep4ReviewLaunchScreen';
import { CreateDealOfferAutoImportedScreen } from '@features/business/screens/CreateDealOfferAutoImportedScreen';
import { reviewFixture } from './helpers/dealReviewFixture';

afterEach(cleanup);

describe('deal step 1 — discount strategy', () => {
  test('emits strategy and discount rate on continue', async () => {
    const onContinue = jest.fn();
    await render(
      <CreateDealStep1DiscountStrategyScreen
        onBack={jest.fn()}
        onContinue={onContinue}
      />,
    );

    await fireEvent.press(screen.getByText(/continue/i));

    expect(onContinue).toHaveBeenCalledTimes(1);
    const value = onContinue.mock.calls[0][0];
    expect(value.strategy).toBe('percentage');
    expect(value.discountRate).toBe(20);
  });
});

describe('deal step 2 — limits & gifting', () => {
  test('emits limits values on continue', async () => {
    const onContinue = jest.fn();
    await render(
      <CreateDealStep2LimitsGiftingRulesScreen
        onBack={jest.fn()}
        onContinue={onContinue}
      />,
    );

    await fireEvent.press(screen.getByText(/continue/i));

    expect(onContinue).toHaveBeenCalledTimes(1);
    const value = onContinue.mock.calls[0][0];
    expect(value.totalVouchers).toBe(50);
    expect(value.claimFrequency).toBe('once');
    expect(value.maxClaimsPerMonth).toBe(2);
    expect(value.acceptGifting).toBe(true);
  });
});

describe('deal step 3 — schedule & terms', () => {
  test('emits claim steps and terms on save', async () => {
    const onSave = jest.fn();
    await render(
      <CreateDealStep3ParticipatingBranchesScheduleScreen
        onBack={jest.fn()}
        onSave={onSave}
      />,
    );

    await fireEvent.press(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledTimes(1);
    const value = onSave.mock.calls[0][0];
    expect(value.claimSteps.length).toBeGreaterThan(0);
    expect(value.terms.length).toBeGreaterThan(0);
  });
});

describe('deal step 4 — review & launch', () => {
  test('launch button fires onLaunch', async () => {
    const onLaunch = jest.fn();
    await render(
      <CreateDealStep4ReviewLaunchScreen
        review={reviewFixture()}
        onBack={jest.fn()}
        onLaunch={onLaunch}
      />,
    );

    await fireEvent.press(screen.getByText(/publish deal to nearby feeds/i));
    await waitFor(() => expect(onLaunch).toHaveBeenCalledTimes(1), {
      timeout: 2500,
    });
  });
});

describe('deal auto-imported screen', () => {
  test('emits offer value on publish', async () => {
    const onPublish = jest.fn();
    await render(
      <CreateDealOfferAutoImportedScreen
        onBack={jest.fn()}
        onPublish={onPublish}
        initialBranchIds={['br-1']}
      />,
    );

    await fireEvent.press(screen.getByText(/publish|launch|create deal/i));

    expect(onPublish).toHaveBeenCalledTimes(1);
    const value = onPublish.mock.calls[0][0];
    expect(value.discountMode).toBe('percentage');
    expect(value.discountPercent).toBe(20);
    expect(value.totalVouchers).toBe(50);
    expect(value.selectedBranchIds.length).toBeGreaterThan(0);
  });
});
