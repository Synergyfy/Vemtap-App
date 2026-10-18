import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { CampaignStep1ObjectiveScreen } from '@features/business/screens/CampaignStep1ObjectiveScreen';
import { CampaignStep2ContentScreen } from '@features/business/screens/CampaignStep2ContentScreen';
import { CampaignStep3AudienceScreen } from '@features/business/screens/CampaignStep3AudienceScreen';
import { CampaignStep4ScheduleScreen } from '@features/business/screens/CampaignStep4ScheduleScreen';
import { CampaignStep5BudgetScreen } from '@features/business/screens/CampaignStep5BudgetScreen';
import { CampaignStep6ReviewScreen } from '@features/business/screens/CampaignStep6ReviewScreen';
import { SegmentActionsSheet } from '@features/business/screens/SegmentActionsSheet';
import { CreateCustomSegmentScreen } from '@features/business/screens/CreateCustomSegmentScreen';
import { SegmentAudienceDetailsScreen } from '@features/business/screens/SegmentAudienceDetailsScreen';
import {
  campaignContentFixture,
  promotionTiersFixture,
  segmentDetailsFixture,
} from './helpers/growthFixtures';

const copy = strings.campaignWizard;

afterEach(cleanup);

const noop = () => undefined;

describe('create campaign — step 1 objective', () => {
  it('renders every objective and the helper note', async () => {
    await render(<CampaignStep1ObjectiveScreen onBack={noop} onContinue={noop} />);
    expect(screen.getByText(copy.step1.hero)).toBeTruthy();
    for (const option of copy.step1.objectives) {
      expect(screen.getByText(option.title)).toBeTruthy();
    }
    expect(screen.getByText(copy.step1.note)).toBeTruthy();
  });

  it('hands the chosen objective to the continue handler', async () => {
    const onContinue = jest.fn();
    await render(<CampaignStep1ObjectiveScreen onBack={noop} onContinue={onContinue} />);
    await fireEvent.press(screen.getByLabelText(copy.step1.objectives[1].title));
    await fireEvent.press(screen.getByLabelText(copy.step1.cta));
    expect(onContinue).toHaveBeenCalledWith(copy.step1.objectives[1].id);
  });
});

describe('create campaign — step 2 content', () => {
  const items = campaignContentFixture;

  it('lists the live assets and reports the selection count', async () => {
    await render(
      <CampaignStep2ContentScreen
        onBack={noop}
        onContinue={noop}
        items={items}
        initialAssetIds={['deal-1']}
      />,
    );
    expect(screen.getByText(copy.step2.selectedOne)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(items[1].title));
    expect(
      screen.getByText(copy.step2.selectedMany.replace('{count}', '2')),
    ).toBeTruthy();
  });

  it('narrows to a single asset group', async () => {
    await render(
      <CampaignStep2ContentScreen onBack={noop} onContinue={noop} items={items} />,
    );
    await fireEvent.press(screen.getByLabelText(`${copy.step2.liveFilters.deals} (1)`));
    expect(screen.queryByText(items[1].title)).toBeNull();
    expect(screen.getByText(items[0].title)).toBeTruthy();
  });
});

describe('create campaign — step 3 audience', () => {
  it('reveals cohort rows only under the segment strategy', async () => {
    await render(<CampaignStep3AudienceScreen onBack={noop} onContinue={noop} />);
    expect(screen.getByText(copy.step3.cohorts[0].name)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(copy.step3.strategies[0].title));
    expect(screen.queryByText(copy.step3.cohorts[0].name)).toBeNull();
  });

  it('carries a handed-over saved segment as a segment id, not a cohort', async () => {
    const onContinue = jest.fn();
    await render(
      <CampaignStep3AudienceScreen
        onBack={noop}
        onContinue={onContinue}
        initialSelection={{ strategy: 'segments', cohorts: [], segmentIds: ['seg-1'] }}
        segmentOptions={[{ id: 'seg-1', name: 'Lapsed regulars', size: 42 }]}
        branchOptions={[{ id: 'br-1', name: 'Wuse', address: '' }]}
      />,
    );
    expect(screen.getByText('Lapsed regulars')).toBeTruthy();
    // No districts to offer here.
    expect(screen.queryByText(copy.step3.clustersTitle)).toBeNull();
    await fireEvent.press(screen.getByLabelText(copy.step3.cta));
    const selection = onContinue.mock.calls[0][0];
    expect(selection.segmentIds).toEqual(['seg-1']);
    expect(selection.cohorts).toEqual([]);
    expect(selection.clusters).toEqual([]);
  });

  it('live: offers the real districts and reports the picked ids', async () => {
    const onContinue = jest.fn();
    await render(
      <CampaignStep3AudienceScreen
        onBack={noop}
        onContinue={onContinue}
        branchOptions={[{ id: 'br-1', name: 'Wuse', address: '' }]}
        districtOptions={[
          { id: 'd-wuse', name: 'Wuse 2' },
          { id: 'd-cbd', name: 'Central Business District' },
        ]}
      />,
    );
    expect(screen.getByText(copy.step3.clustersTitle)).toBeTruthy();
    // Nothing is picked until the owner does.
    await fireEvent.press(screen.getByLabelText('Central Business District'));
    await fireEvent.press(screen.getByLabelText(copy.step3.cta));
    expect(onContinue.mock.calls[0][0].clusters).toEqual(['d-cbd']);
  });
});

describe('create campaign — step 4 schedule', () => {
  it('renders the flight horizon and the high-intent windows', async () => {
    await render(<CampaignStep4ScheduleScreen onBack={noop} onContinue={noop} />);
    expect(screen.getByText(copy.step4.horizonTitle)).toBeTruthy();
    expect(screen.getByText(copy.step4.windows[0].name)).toBeTruthy();
  });

  it('hides the windows when dayparting is switched off', async () => {
    await render(<CampaignStep4ScheduleScreen onBack={noop} onContinue={noop} />);
    await fireEvent(screen.getByLabelText(copy.step4.daypartTitle), 'valueChange', false);
    expect(screen.queryByText(copy.step4.windows[0].name)).toBeNull();
  });

  it('reports the chosen duration and windows', async () => {
    const onContinue = jest.fn();
    await render(<CampaignStep4ScheduleScreen onBack={noop} onContinue={onContinue} />);
    await fireEvent.press(screen.getByLabelText(copy.step4.durations[0].label));
    await fireEvent.press(screen.getByLabelText(copy.step4.cta));
    expect(onContinue).toHaveBeenCalledWith(
      expect.objectContaining({ durationDays: 3, windows: ['lunch', 'dinner'] }),
    );
  });
});

describe('create campaign — step 5 budget', () => {
  it('lists the investment tiers with their daily pace', async () => {
    await render(
      <CampaignStep5BudgetScreen
        onBack={noop}
        onContinue={noop}
        tiers={promotionTiersFixture}
      />,
    );
    for (const tier of promotionTiersFixture) {
      expect(screen.getByText(tier.label)).toBeTruthy();
      expect(
        screen.getAllByText(`\u20a6${tier.amount.toLocaleString('en-NG')}`).length,
      ).toBeGreaterThan(0);
    }
    // The middle API tier is the suggested one.
    expect(screen.getByText(copy.step5.popularBadge)).toBeTruthy();
    expect(screen.getAllByText(copy.step5.guardTitle).length).toBeGreaterThan(0);
  });

  it('asks for a top-up when the wallet cannot cover the campaign', async () => {
    await render(
      <CampaignStep5BudgetScreen
        onBack={noop}
        onContinue={noop}
        walletSpendable={10_000}
      />,
    );
    await fireEvent.press(screen.getByLabelText('Market Leader Surge'));
    expect(screen.getByText(copy.step5.topUpTitle)).toBeTruthy();
  });

  it('confirms full wallet coverage for the starter tier', async () => {
    await render(
      <CampaignStep5BudgetScreen
        onBack={noop}
        onContinue={noop}
        walletSpendable={50_000}
      />,
    );
    await fireEvent.press(screen.getByLabelText('Starter Booster'));
    expect(screen.getByText(copy.step5.fullyFunded)).toBeTruthy();
  });

  it('live: pays the shortfall with the saved card in one tap', async () => {
    const onContinue = jest.fn();
    await render(
      <CampaignStep5BudgetScreen
        onBack={noop}
        onContinue={onContinue}
        walletSpendable={0}
        savedCard="Visa •• 4242"
      />,
    );
    expect(screen.getByText('Visa •• 4242')).toBeTruthy();
    expect(screen.getByText(copy.step5.liveSavedCardBody('Visa •• 4242'))).toBeTruthy();
    expect(screen.queryByText(copy.step5.liveSaveCard)).toBeNull();
    await fireEvent.press(screen.getByLabelText(copy.reviewCta));
    expect(onContinue).toHaveBeenCalledWith(
      expect.not.objectContaining({ saveCard: expect.anything() }),
    );
    expect(onContinue.mock.calls[0][0].funding).toBe('card');
  });

  it('live: without a saved card, the checkout can save the card', async () => {
    const onContinue = jest.fn();
    await render(
      <CampaignStep5BudgetScreen
        onBack={noop}
        onContinue={onContinue}
        walletSpendable={0}
      />,
    );
    expect(screen.queryByText(/•• [0-9]{4}/)).toBeNull();
    await fireEvent.press(screen.getByLabelText(copy.step5.liveSaveCard));
    await fireEvent.press(screen.getByLabelText(copy.reviewCta));
    expect(onContinue).toHaveBeenCalledWith(
      expect.objectContaining({ funding: 'card', saveCard: true }),
    );
  });
});

describe('create campaign — step 6 review', () => {
  it('summarises only what the earlier steps produced', async () => {
    await render(
      <CampaignStep6ReviewScreen
        onBack={noop}
        onLaunch={noop}
        objectiveId={copy.step1.objectives[4].id}
        objectiveTitle={copy.step1.objectives[4].title}
        assetNames={['Jollof Combo']}
        cohortNames={[copy.step3.cohorts[0].name]}
        branchNames={['Jabi']}
        totalLabel={'\u20a670,000'}
      />,
    );
    expect(screen.getByText(copy.step1.objectives[4].title)).toBeTruthy();
    expect(screen.getByText('1 Active Assets Attached')).toBeTruthy();
    expect(screen.getByText('1 Segments')).toBeTruthy();
    expect(screen.getByText(`${'\u20a670,000'} Total Allocation`)).toBeTruthy();
  });

  it('does not launch while the policy is unaccepted', async () => {
    const onLaunch = jest.fn();
    await render(
      <CampaignStep6ReviewScreen
        onBack={noop}
        onLaunch={onLaunch}
        totalLabel={'\u20a635,000'}
      />,
    );
    await fireEvent.press(
      screen.getByLabelText(
        `${copy.step6.termsPrefix} ${copy.step6.termsSuffix.replace('{amount}', '\u20a635,000')}`,
      ),
    );
    await fireEvent.press(
      screen.getByLabelText(copy.launchCta.replace('{amount}', '\u20a635,000')),
    );
    expect(onLaunch).not.toHaveBeenCalled();
  });

  it('launches with the agreed objective', async () => {
    const onLaunch = jest.fn();
    await render(
      <CampaignStep6ReviewScreen
        onBack={noop}
        onLaunch={onLaunch}
        totalLabel={'\u20a635,000'}
      />,
    );
    await fireEvent.press(
      screen.getByLabelText(copy.launchCta.replace('{amount}', '\u20a635,000')),
    );
    expect(onLaunch).toHaveBeenCalledWith(
      expect.objectContaining({ objectiveId: copy.step1.objectives[0].id, agreed: true }),
    );
  });
});

describe('segment actions sheet', () => {
  const summary = {
    meta: '120 customers',
    spend: '\u20a6540,000',
    body: 'Visited 3+ times in 30 days',
    pushReady: '96 Push/Feed ready',
    messageReady: '40 SMS ready',
  };

  it('uses the shared bottom sheet title tier and lists every action', async () => {
    await render(
      <SegmentActionsSheet
        visible
        onClose={noop}
        segmentName="Lunch regulars"
        businessName="Aurora Grill"
        summary={summary}
      />,
    );
    expect(
      screen.getByText(copy.segmentActions.liveTitle('Lunch regulars')),
    ).toBeTruthy();
    expect(screen.getByText('Aurora Grill')).toBeTruthy();
    expect(screen.getByText(summary.spend)).toBeTruthy();
    for (const action of copy.segmentActions.actions) {
      expect(screen.getByText(action.title)).toBeTruthy();
    }
    expect(screen.getByText(copy.segmentActions.rulesTitle)).toBeTruthy();
  });

  it('shows no figures until the insights load', async () => {
    await render(
      <SegmentActionsSheet visible onClose={noop} segmentName="Lunch regulars" />,
    );
    expect(screen.queryByText(/Returning Customers|Urban Grill|294/)).toBeNull();
    expect(screen.getAllByText('\u2026').length).toBeGreaterThan(0);
  });

  it('hands the campaign hand-off to step 3 and closes', async () => {
    const onCreateCampaign = jest.fn();
    const onClose = jest.fn();
    await render(
      <SegmentActionsSheet
        visible
        segmentId="seg-1"
        onClose={onClose}
        onCreateCampaign={onCreateCampaign}
      />,
    );
    await fireEvent.press(screen.getByLabelText(copy.segmentActions.actions[0].cta));
    expect(onCreateCampaign).toHaveBeenCalledWith('seg-1');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('create custom segment', () => {
  it('shows the live audience size, and waits for it rather than estimating', async () => {
    const view = await render(<CreateCustomSegmentScreen onClose={noop} />);
    expect(
      screen.getByLabelText(copy.customSegment.saveCta.replace('{count}', '\u2026')),
    ).toBeTruthy();
    await view.rerender(
      <CreateCustomSegmentScreen
        onClose={noop}
        sizing={{ total: 200, push: 150, dm: 100 }}
      />,
    );
    expect(screen.getByText('200')).toBeTruthy();
    expect(screen.getByText('150 (75%)')).toBeTruthy();
  });

  it('reveals the picker only for a checked criterion', async () => {
    await render(
      <CreateCustomSegmentScreen
        onClose={noop}
        initialSelection={{ criteria: [], pickers: {} }}
        pickerOptions={{ claimed: [{ id: 'deal-1', label: 'Jollof Combo' }] }}
      />,
    );
    expect(screen.queryByText('Jollof Combo')).toBeNull();
    await fireEvent.press(screen.getByLabelText(copy.customSegment.criteria[0].title));
    expect(screen.getByText('Jollof Combo')).toBeTruthy();
  });

  it('live: gives the district criterion real districts and truthful wording', async () => {
    const district = copy.customSegment.criteria.find(c => c.id === 'district')!;
    const live = strings.customerSegments.live.builder;
    const onSelectionChange = jest.fn();
    await render(
      <CreateCustomSegmentScreen
        onClose={noop}
        initialSelection={{ criteria: [], pickers: {} }}
        criterionIds={['district', 'points']}
        pickerOptions={{
          district: [
            { id: 'd-apo', label: 'Apo' },
            { id: 'd-wuse', label: 'Wuse 2' },
          ],
        }}
        criterionOverrides={{
          district: { body: live.districtBody, pickerLabel: live.districtLabel },
        }}
        onSelectionChange={onSelectionChange}
      />,
    );
    // The design's "verified delivery" claim is not made.
    expect(screen.getByText(live.districtBody)).toBeTruthy();
    expect(screen.queryByText(district.body)).toBeNull();
    expect(screen.queryByText('Wuse 2')).toBeNull();

    await fireEvent.press(screen.getByLabelText(district.title));
    expect(screen.getByText(live.districtLabel)).toBeTruthy();
    await fireEvent.press(screen.getByText('Wuse 2'));
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      criteria: ['district'],
      pickers: { district: 1 },
    });
  });

  it('clears every criterion from the clear-all action', async () => {
    const onSave = jest.fn();
    await render(<CreateCustomSegmentScreen onClose={noop} onSave={onSave} />);
    await fireEvent.press(screen.getByLabelText(copy.customSegment.clearAll));
    await fireEvent.press(
      screen.getByLabelText(copy.customSegment.saveCta.replace('{count}', '\u2026')),
    );
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ criteria: [] }));
  });
});

describe('segment audience details', () => {
  const details = segmentDetailsFixture;

  it('renders the live cohort hero, value panel and reachability channels', async () => {
    await render(<SegmentAudienceDetailsScreen onClose={noop} details={details} />);
    expect(screen.getByText(details.hero)).toBeTruthy();
    expect(screen.getByText(details.spend)).toBeTruthy();
    expect(screen.getByText(details.channels[0].label)).toBeTruthy();
    expect(screen.getByText(copy.segmentDetails.roiTitle)).toBeTruthy();
  });

  it('shows a loader until the segment loads', async () => {
    await render(<SegmentAudienceDetailsScreen onClose={noop} />);
    expect(screen.queryByText('294 Diners')).toBeNull();
    expect(screen.queryByText(copy.segmentDetails.roiTitle)).toBeNull();
  });

  it('opens the actions sheet hand-off from the footer CTA', async () => {
    const onUseSegment = jest.fn();
    await render(
      <SegmentAudienceDetailsScreen
        onClose={noop}
        details={details}
        onUseSegment={onUseSegment}
      />,
    );
    await fireEvent.press(screen.getByLabelText(copy.segmentDetails.cta));
    expect(onUseSegment).toHaveBeenCalledWith('seg-1');
  });

  it('lists the patron sample with drill-down rows', async () => {
    const onOpenCustomer = jest.fn();
    await render(
      <SegmentAudienceDetailsScreen
        onClose={noop}
        details={details}
        onOpenCustomer={onOpenCustomer}
      />,
    );
    await fireEvent.press(screen.getByLabelText(details.patrons[0].name));
    expect(onOpenCustomer).toHaveBeenCalledWith('cust-1');
  });
});
