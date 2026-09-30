import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { BoostGoalAudienceScreen } from '@features/business/screens/BoostGoalAudienceScreen';
import { BoostBudgetScheduleScreen } from '@features/business/screens/BoostBudgetScheduleScreen';
import { BoostPreviewPaymentScreen } from '@features/business/screens/BoostPreviewPaymentScreen';
import { BoostPerformanceScreen } from '@features/business/screens/BoostPerformanceScreen';
import { BoostWalletScreen } from '@features/business/screens/BoostWalletScreen';

const copy = strings.boostWizard;
const { goalStep: goal, budgetStep: budget, preview, performance: perf, wallet } = copy;

afterEach(cleanup);

describe('boost wizard step 1 — goal & audience', () => {
  it('renders the asset, every goal and the default radius reach', async () => {
    await render(<BoostGoalAudienceScreen />);
    expect(screen.getByText(goal.assetName)).toBeTruthy();
    for (const option of goal.goals) {
      expect(screen.getByText(option.title)).toBeTruthy();
    }
    expect(screen.getByText(goal.radiusReach['3'].reach)).toBeTruthy();
    expect(screen.getByText(goal.cta)).toBeTruthy();
  });

  it('changes the projected reach when a wider radius is picked', async () => {
    await render(<BoostGoalAudienceScreen />);
    await fireEvent.press(screen.getByLabelText(goal.radiusOptions[3].label));
    expect(screen.getByText(goal.radiusReach['10'].reach)).toBeTruthy();
  });

  it('hands the selection to the continue handler', async () => {
    const onContinue = jest.fn();
    await render(<BoostGoalAudienceScreen onContinue={onContinue} />);
    await fireEvent.press(screen.getByLabelText(goal.placements[2].title));
    await fireEvent.press(screen.getByLabelText(goal.cta));
    expect(onContinue).toHaveBeenCalledWith(
      expect.objectContaining({
        goalId: goal.goals[0].id,
        audienceScope: goal.audienceScopes[0],
        radiusKm: '3',
      }),
    );
    expect(onContinue.mock.calls[0][0].placements).not.toContain(goal.placements[2].id);
  });
});

describe('boost wizard step 2 — budget & schedule', () => {
  it('renders every budget tier and the paced forecast', async () => {
    await render(<BoostBudgetScheduleScreen />);
    for (const tier of budget.tiers) {
      expect(screen.getAllByText(tier.amount).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(budget.forecastTitle)).toBeTruthy();
    expect(screen.getAllByText(`${'\u20a6'}20,000`).length).toBeGreaterThan(0);
  });

  it('blocks the CTA while the custom budget is under the floor', async () => {
    const onContinue = jest.fn();
    await render(<BoostBudgetScheduleScreen onContinue={onContinue} />);
    const input = screen.getByLabelText(budget.customLabel);
    await fireEvent.changeText(input, '1000');
    expect(screen.getByText(budget.customError)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(budget.cta));
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('toggles lunch dayparting through the shared switch row', async () => {
    await render(<BoostBudgetScheduleScreen />);
    await fireEvent(screen.getByLabelText(budget.daypartTitle), 'valueChange', false);
    expect(screen.getByLabelText(budget.daypartTitle).props.value).toBe(false);
  });
});

describe('boost wizard step 3 — preview & payment', () => {
  it('swaps the live preview pane from the feed to the spotlight', async () => {
    await render(<BoostPreviewPaymentScreen />);
    expect(screen.getAllByText(preview.feedName).length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByLabelText(preview.previewTabs[1]));
    expect(screen.getByText(preview.spotlightEyebrow)).toBeTruthy();
  });

  it('shows the push notice copy on the push tab', async () => {
    await render(<BoostPreviewPaymentScreen />);
    await fireEvent.press(screen.getByLabelText(preview.previewTabs[2]));
    expect(screen.getByText(preview.pushTitle)).toBeTruthy();
  });

  it('refuses to launch until the advertising terms are accepted', async () => {
    const onLaunch = jest.fn();
    await render(<BoostPreviewPaymentScreen onLaunch={onLaunch} />);
    await fireEvent.press(screen.getByLabelText(preview.cta));
    expect(onLaunch).toHaveBeenCalledWith(preview.methods[0].id);
  });

  it('selects an alternative payment method', async () => {
    const onLaunch = jest.fn();
    await render(<BoostPreviewPaymentScreen onLaunch={onLaunch} />);
    await fireEvent.press(screen.getByLabelText(preview.methods[1].title));
    await fireEvent.press(screen.getByLabelText(preview.cta));
    expect(onLaunch).toHaveBeenCalledWith(preview.methods[1].id);
  });
});

describe('boost performance analytics', () => {
  it('renders the executive pulse, funnel and geofence clusters', async () => {
    await render(<BoostPerformanceScreen />);
    expect(screen.getByText(perf.dealName)).toBeTruthy();
    expect(screen.getAllByText(perf.kpis[0].value).length).toBeGreaterThan(0);
    expect(screen.getByText(perf.funnel[0].label)).toBeTruthy();
    expect(screen.getByText(perf.geo[0].name)).toBeTruthy();
  });

  it('exposes the in-flight optimisation actions', async () => {
    const onPause = jest.fn();
    const onAddBudget = jest.fn();
    await render(<BoostPerformanceScreen onPause={onPause} onAddBudget={onAddBudget} />);
    await fireEvent.press(screen.getByLabelText(perf.pauseCta));
    await fireEvent.press(screen.getByLabelText(perf.addBudget));
    expect(onPause).toHaveBeenCalled();
    expect(onAddBudget).toHaveBeenCalled();
  });
});

describe('boost wallet & advertising credits', () => {
  it('renders the escrow balance, partitions and ledger rows', async () => {
    await render(<BoostWalletScreen />);
    expect(screen.getByText(wallet.balance)).toBeTruthy();
    expect(screen.getByText(wallet.reserved)).toBeTruthy();
    expect(screen.getByText(wallet.spendable)).toBeTruthy();
    for (const entry of wallet.transactions) {
      expect(screen.getByText(entry.title)).toBeTruthy();
    }
  });

  it('confirms the virtual account copy action', async () => {
    const onCopyAccount = jest.fn();
    await render(<BoostWalletScreen onCopyAccount={onCopyAccount} />);
    await fireEvent.press(screen.getByLabelText(wallet.copyAccount));
    expect(onCopyAccount).toHaveBeenCalled();
    expect(screen.getByText(wallet.copied)).toBeTruthy();
  });

  it('selects a top-up pre-pack', async () => {
    const onTopUp = jest.fn();
    await render(<BoostWalletScreen onTopUp={onTopUp} />);
    await fireEvent.press(screen.getAllByLabelText(wallet.prepacks[2].title)[0]);
    expect(onTopUp).toHaveBeenCalledWith(wallet.prepacks[2].id);
  });
});
