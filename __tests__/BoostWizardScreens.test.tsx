import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { BoostGoalAudienceScreen } from '@features/business/screens/BoostGoalAudienceScreen';
import { BoostBudgetScheduleScreen } from '@features/business/screens/BoostBudgetScheduleScreen';
import { BoostPreviewPaymentScreen } from '@features/business/screens/BoostPreviewPaymentScreen';
import { BoostPerformanceScreen } from '@features/business/screens/BoostPerformanceScreen';
import { BoostWalletScreen } from '@features/business/screens/BoostWalletScreen';
import {
  boostBudgetLiveFixture,
  boostGoalLiveFixture,
  boostPerformanceFixture,
  boostPreviewFixture,
  boostTiersFixture,
  boostWalletLiveFixture,
} from './helpers/growthFixtures';

const copy = strings.boostWizard;
const { goalStep: goal, budgetStep: budget, preview, performance: perf, wallet } = copy;

afterEach(cleanup);

describe('boost wizard step 1 — goal & audience', () => {
  it('renders the asset, every goal and the live radius reach', async () => {
    await render(<BoostGoalAudienceScreen live={boostGoalLiveFixture} />);
    expect(screen.getByText('Jollof Combo')).toBeTruthy();
    for (const option of goal.goals) {
      expect(screen.getByText(option.title)).toBeTruthy();
    }
    expect(screen.getByText(boostGoalLiveFixture.reach!.value)).toBeTruthy();
    expect(screen.getByText(goal.cta)).toBeTruthy();
  });

  it('waits for the reach estimate instead of inventing one', async () => {
    await render(
      <BoostGoalAudienceScreen live={{ ...boostGoalLiveFixture, reach: undefined }} />,
    );
    expect(screen.getByText('\u2026')).toBeTruthy();
  });

  it('hands the selection to the continue handler', async () => {
    const onContinue = jest.fn();
    await render(
      <BoostGoalAudienceScreen live={boostGoalLiveFixture} onContinue={onContinue} />,
    );
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

describe('boost wizard step 1 — live districts and clusters', () => {
  const live = (clusters = [{ id: 'cl-banex', name: 'Banex Plaza' }]) => ({
    ...boostGoalLiveFixture,
    areas: {
      districts: [
        { id: 'd-wuse', name: 'Wuse 2' },
        { id: 'd-maitama', name: 'Maitama' },
      ],
      clusters,
    },
  });

  it('lists districts in place of the radius and sends the picked ones', async () => {
    const onContinue = jest.fn();
    await render(<BoostGoalAudienceScreen live={live()} onContinue={onContinue} />);
    expect(screen.queryByText(copy.live.pickDistricts)).toBeNull();

    await fireEvent.press(screen.getByLabelText(goal.audienceScopes[1]));
    expect(screen.getByText(copy.live.pickDistricts)).toBeTruthy();
    // The radius no longer applies inside a district.
    expect(screen.queryByText(goal.radiusTitle)).toBeNull();

    await fireEvent.press(screen.getByLabelText('Maitama'));
    await fireEvent.press(screen.getByLabelText(goal.cta));
    expect(onContinue).toHaveBeenCalledWith(
      expect.objectContaining({
        audienceScope: goal.audienceScopes[1],
        clusterIds: ['d-maitama'],
      }),
    );
  });

  it('will not continue with an area scope and no area', async () => {
    const onContinue = jest.fn();
    await render(<BoostGoalAudienceScreen live={live()} onContinue={onContinue} />);
    await fireEvent.press(screen.getByLabelText(goal.audienceScopes[2]));
    expect(screen.getByText(copy.live.pickClusters)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(goal.cta));
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('hides the clusters scope when no branch is in a cluster', async () => {
    await render(<BoostGoalAudienceScreen live={live([])} />);
    expect(screen.getByLabelText(goal.audienceScopes[1])).toBeTruthy();
    expect(screen.queryByLabelText(goal.audienceScopes[2])).toBeNull();
  });

  it('sends no areas for nearby', async () => {
    const onContinue = jest.fn();
    await render(<BoostGoalAudienceScreen live={live()} onContinue={onContinue} />);
    await fireEvent.press(screen.getByLabelText(goal.cta));
    expect(onContinue.mock.calls[0][0].clusterIds).toEqual([]);
  });
});

describe('boost wizard step 2 — budget & schedule', () => {
  it('renders every budget tier with its live forecast', async () => {
    await render(<BoostBudgetScheduleScreen live={boostBudgetLiveFixture} />);
    expect(screen.getByText(budget.forecastTitle)).toBeTruthy();
    expect(screen.getByText('2k \u2013 3k')).toBeTruthy();
    expect(screen.getByText('4k \u2013 6k')).toBeTruthy();
    expect(screen.getAllByText(`${'\u20a6'}20,000`).length).toBeGreaterThan(0);
  });

  it('lists the tiers the API serves and starts on the middle one', async () => {
    const onContinue = jest.fn();
    await render(
      <BoostBudgetScheduleScreen
        live={boostBudgetLiveFixture}
        tiers={boostTiersFixture}
        onContinue={onContinue}
      />,
    );
    for (const tier of boostTiersFixture) {
      expect(screen.getAllByText(tier.label).length).toBeGreaterThan(0);
      expect(
        screen.getAllByText(`\u20a6${tier.amount.toLocaleString('en-NG')}`).length,
      ).toBeGreaterThan(0);
    }
    expect(screen.queryByText('\u20a610,000')).toBeNull();
    await fireEvent.press(screen.getByLabelText(budget.cta));
    expect(onContinue).toHaveBeenCalledWith(expect.objectContaining({ budget: 25_000 }));
  });

  it('blocks the CTA while the custom budget is under the floor', async () => {
    const onContinue = jest.fn();
    await render(
      <BoostBudgetScheduleScreen live={boostBudgetLiveFixture} onContinue={onContinue} />,
    );
    const input = screen.getByLabelText(budget.customLabel('₦2,000'));
    await fireEvent.changeText(input, '1000');
    expect(screen.getByText(budget.customError('₦2,000'))).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(budget.cta));
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('accepts any custom budget from the API minimum (₦2,000) up', async () => {
    await render(<BoostBudgetScheduleScreen live={boostBudgetLiveFixture} />);
    await fireEvent.changeText(
      screen.getByLabelText(budget.customLabel('₦2,000')),
      '2500',
    );
    expect(screen.queryByText(budget.customError('₦2,000'))).toBeNull();
  });

  it('toggles lunch dayparting through the shared switch row', async () => {
    await render(<BoostBudgetScheduleScreen live={boostBudgetLiveFixture} />);
    await fireEvent(screen.getByLabelText(budget.daypartTitle), 'valueChange', false);
    expect(screen.getByLabelText(budget.daypartTitle).props.value).toBe(false);
  });
});

describe('boost wizard step 3 — preview & payment', () => {
  it('swaps the live preview pane from the feed to the spotlight', async () => {
    await render(<BoostPreviewPaymentScreen preview={boostPreviewFixture} />);
    expect(screen.getAllByText(boostPreviewFixture.feed.name).length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByLabelText(preview.previewTabs[1]));
    expect(screen.getByText(preview.spotlightEyebrow)).toBeTruthy();
  });

  it('shows the push notice copy on the push tab', async () => {
    await render(<BoostPreviewPaymentScreen preview={boostPreviewFixture} />);
    await fireEvent.press(screen.getByLabelText(preview.previewTabs[2]));
    expect(screen.getByText(boostPreviewFixture.push.title)).toBeTruthy();
  });

  it('launches with the wallet by default', async () => {
    const onLaunch = jest.fn();
    await render(
      <BoostPreviewPaymentScreen preview={boostPreviewFixture} onLaunch={onLaunch} />,
    );
    await fireEvent.press(screen.getByLabelText(boostPreviewFixture.cta));
    expect(onLaunch).toHaveBeenCalledWith('wallet');
  });

  it('selects an alternative payment method', async () => {
    const onLaunch = jest.fn();
    await render(
      <BoostPreviewPaymentScreen preview={boostPreviewFixture} onLaunch={onLaunch} />,
    );
    await fireEvent.press(screen.getByLabelText(boostPreviewFixture.methods[1].title));
    await fireEvent.press(screen.getByLabelText(boostPreviewFixture.cta));
    expect(onLaunch).toHaveBeenCalledWith('card');
  });
});

describe('boost performance analytics', () => {
  it('renders the executive pulse, funnel and branches', async () => {
    await render(<BoostPerformanceScreen performance={boostPerformanceFixture} />);
    expect(screen.getByText(boostPerformanceFixture.name)).toBeTruthy();
    expect(
      screen.getAllByText(boostPerformanceFixture.kpis.spend.value).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(boostPerformanceFixture.funnel[0].label)).toBeTruthy();
    expect(screen.getByText('Jabi')).toBeTruthy();
  });

  it('shows a loader until the stats arrive', async () => {
    await render(<BoostPerformanceScreen />);
    expect(screen.queryByText(perf.pauseCta)).toBeNull();
  });

  it('exposes the in-flight optimisation actions', async () => {
    const onPause = jest.fn();
    const onAddBudget = jest.fn();
    await render(
      <BoostPerformanceScreen
        performance={boostPerformanceFixture}
        onPause={onPause}
        onAddBudget={onAddBudget}
      />,
    );
    await fireEvent.press(screen.getByLabelText(perf.pauseCta));
    await fireEvent.press(screen.getByLabelText(boostPerformanceFixture.addBudgetLabel!));
    expect(onPause).toHaveBeenCalled();
    expect(onAddBudget).toHaveBeenCalled();
  });
});

describe('boost wallet & advertising credits', () => {
  it('renders the live balance, partitions and ledger rows', async () => {
    await render(<BoostWalletScreen live={boostWalletLiveFixture} />);
    expect(screen.getByText('\u20a625,000')).toBeTruthy();
    expect(screen.getByText('\u20a65,000')).toBeTruthy();
    expect(screen.getByText('\u20a620,000')).toBeTruthy();
    expect(screen.getByText('Wallet top-up')).toBeTruthy();
    expect(screen.queryByText(/9940284411|TIN-/)).toBeNull();
  });

  it('shows a loader until the wallet arrives', async () => {
    await render(<BoostWalletScreen />);
    expect(screen.queryByText(wallet.prepackTitle)).toBeNull();
  });

  it('selects a pre-pack and tops it up', async () => {
    const onTopUp = jest.fn();
    await render(<BoostWalletScreen live={boostWalletLiveFixture} onTopUp={onTopUp} />);
    await fireEvent.press(screen.getAllByLabelText('\u20a610,000 Top-Up')[0]);
    await fireEvent.press(screen.getByLabelText(wallet.live.topUpCta('\u20a610,000')));
    expect(onTopUp).toHaveBeenCalledWith('p10', undefined, expect.anything());
  });
});
