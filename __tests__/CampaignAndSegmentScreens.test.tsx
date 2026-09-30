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
  it('filters the asset list and reports the selection count', async () => {
    await render(<CampaignStep2ContentScreen onBack={noop} onContinue={noop} />);
    expect(
      screen.getByText(copy.step2.selectedMany.replace('{count}', '2')),
    ).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(copy.step2.items[2].title));
    expect(
      screen.getByText(copy.step2.selectedMany.replace('{count}', '3')),
    ).toBeTruthy();
  });

  it('narrows to a single asset group', async () => {
    await render(<CampaignStep2ContentScreen onBack={noop} onContinue={noop} />);
    await fireEvent.press(screen.getByLabelText(copy.step2.filters[1].label));
    expect(screen.queryByText(copy.step2.items[2].title)).toBeNull();
    expect(screen.getByText(copy.step2.items[0].title)).toBeTruthy();
  });
});

describe('create campaign — step 3 audience', () => {
  it('reveals cohort rows only under the segment strategy', async () => {
    await render(<CampaignStep3AudienceScreen onBack={noop} onContinue={noop} />);
    expect(screen.getByText(copy.step3.cohorts[0].name)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(copy.step3.strategies[0].title));
    expect(screen.queryByText(copy.step3.cohorts[0].name)).toBeNull();
  });

  it('seeds cohorts from a handed-over segment', async () => {
    const onContinue = jest.fn();
    await render(
      <CampaignStep3AudienceScreen
        onBack={noop}
        onContinue={onContinue}
        presetSegmentId={copy.step3.cohorts[3].id}
      />,
    );
    await fireEvent.press(screen.getByLabelText(copy.step3.cta));
    expect(onContinue.mock.calls[0][0].cohorts).toEqual([copy.step3.cohorts[3].id]);
  });
});

describe('create campaign — step 4 schedule', () => {
  it('renders the flight horizon and the high-intent windows', async () => {
    await render(<CampaignStep4ScheduleScreen onBack={noop} onContinue={noop} />);
    expect(screen.getByText(copy.step4.horizonTitle)).toBeTruthy();
    expect(screen.getByText(copy.step4.windows[0].name)).toBeTruthy();
    expect(screen.getByText(copy.step4.tipFrom)).toBeTruthy();
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
  it('lists the investment tiers with their projections', async () => {
    await render(<CampaignStep5BudgetScreen onBack={noop} onContinue={noop} />);
    for (const tier of copy.step5.tiers) {
      expect(screen.getByText(tier.name)).toBeTruthy();
      expect(screen.getAllByText(tier.amount).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText(copy.step5.guardTitle).length).toBeGreaterThan(0);
  });

  it('asks for a top-up when the wallet cannot cover the campaign', async () => {
    await render(<CampaignStep5BudgetScreen onBack={noop} onContinue={noop} />);
    await fireEvent.press(screen.getByLabelText(copy.step5.tiers[2].name));
    expect(screen.getByText(copy.step5.topUpTitle)).toBeTruthy();
  });

  it('confirms full wallet coverage for the starter tier', async () => {
    await render(<CampaignStep5BudgetScreen onBack={noop} onContinue={noop} />);
    await fireEvent.press(screen.getByLabelText(copy.step5.tiers[0].name));
    expect(screen.getByText(copy.step5.fullyFunded)).toBeTruthy();
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
        assetNames={[copy.step2.items[0].title]}
        cohortNames={[copy.step3.cohorts[0].name]}
        branchNames={[copy.step3.branches[0].name]}
        totalLabel={'\u20a670,000'}
      />,
    );
    expect(screen.getByText(copy.step1.objectives[4].title)).toBeTruthy();
    expect(screen.getByText('1 Active Assets Attached')).toBeTruthy();
    expect(screen.getByText('1 Segments \u2022 436 Known Diners')).toBeTruthy();
    expect(screen.getByText(`${'\u20a670,000'} Total Allocation`)).toBeTruthy();
  });

  it('does not launch while the policy is unaccepted', async () => {
    const onLaunch = jest.fn();
    await render(<CampaignStep6ReviewScreen onBack={noop} onLaunch={onLaunch} />);
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
    await render(<CampaignStep6ReviewScreen onBack={noop} onLaunch={onLaunch} />);
    await fireEvent.press(
      screen.getByLabelText(copy.launchCta.replace('{amount}', '\u20a635,000')),
    );
    expect(onLaunch).toHaveBeenCalledWith(
      expect.objectContaining({ objectiveId: copy.step1.objectives[0].id, agreed: true }),
    );
  });
});

describe('segment actions sheet', () => {
  it('uses the shared bottom sheet title tier and lists every action', async () => {
    await render(<SegmentActionsSheet visible onClose={noop} />);
    expect(screen.getByText(copy.segmentActions.title)).toBeTruthy();
    for (const action of copy.segmentActions.actions) {
      expect(screen.getByText(action.title)).toBeTruthy();
    }
    expect(screen.getByText(copy.segmentActions.rulesTitle)).toBeTruthy();
  });

  it('hands the campaign hand-off to step 3 and closes', async () => {
    const onCreateCampaign = jest.fn();
    const onClose = jest.fn();
    await render(
      <SegmentActionsSheet
        visible
        onClose={onClose}
        onCreateCampaign={onCreateCampaign}
      />,
    );
    await fireEvent.press(screen.getByLabelText(copy.segmentActions.actions[0].cta));
    expect(onCreateCampaign).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

describe('create custom segment', () => {
  it('sizes the cohort from the active criteria', async () => {
    await render(<CreateCustomSegmentScreen onClose={noop} />);
    // Four active criteria size the pool above the base 184 figure.
    expect(
      screen.getByLabelText(copy.customSegment.saveCta.replace('{count}', '353')),
    ).toBeTruthy();
    expect(screen.getByText('353')).toBeTruthy();
    await fireEvent.press(
      screen.getByLabelText(`${copy.customSegment.criteria[0].title}`),
    );
    // Dropping a criterion narrows the pool, so the live figure must change.
    expect(screen.queryByText('353')).toBeNull();
    expect(
      screen.getByLabelText(copy.customSegment.saveCta.replace('{count}', '311')),
    ).toBeTruthy();
  });

  it('reveals the picker only for a checked criterion', async () => {
    await render(<CreateCustomSegmentScreen onClose={noop} />);
    await fireEvent.press(screen.getByLabelText(copy.customSegment.criteria[1].title));
    expect(screen.getByText(copy.customSegment.criteria[0].picker[0])).toBeTruthy();
  });

  it('clears every criterion from the clear-all action', async () => {
    const onSave = jest.fn();
    await render(<CreateCustomSegmentScreen onClose={noop} onSave={onSave} />);
    await fireEvent.press(screen.getByLabelText(copy.customSegment.clearAll));
    await fireEvent.press(
      screen.getByLabelText(copy.customSegment.saveCta.replace('{count}', '184')),
    );
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ criteria: [] }));
  });
});

describe('segment audience details', () => {
  it('renders the cohort hero, value panel and reachability channels', async () => {
    await render(<SegmentAudienceDetailsScreen onClose={noop} />);
    expect(screen.getByText('294 Diners')).toBeTruthy();
    expect(screen.getByText(copy.segmentDetails.spendValue)).toBeTruthy();
    for (const channel of copy.segmentDetails.channels) {
      expect(screen.getByText(channel.label)).toBeTruthy();
    }
    expect(screen.getByText(copy.segmentDetails.roiTitle)).toBeTruthy();
  });

  it('opens the actions sheet hand-off from the footer CTA', async () => {
    const onUseSegment = jest.fn();
    await render(
      <SegmentAudienceDetailsScreen onClose={noop} onUseSegment={onUseSegment} />,
    );
    await fireEvent.press(screen.getByLabelText(copy.segmentDetails.cta));
    expect(onUseSegment).toHaveBeenCalled();
  });

  it('lists the patron sample with drill-down rows', async () => {
    const onOpenCustomer = jest.fn();
    await render(
      <SegmentAudienceDetailsScreen onClose={noop} onOpenCustomer={onOpenCustomer} />,
    );
    await fireEvent.press(screen.getByLabelText(copy.segmentDetails.patrons[0].name));
    expect(onOpenCustomer).toHaveBeenCalledWith(copy.segmentDetails.patrons[0].id);
  });
});
