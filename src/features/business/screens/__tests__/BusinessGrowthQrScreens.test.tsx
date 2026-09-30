import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { CampaignsHubScreen } from '@features/business/screens/CampaignsHubScreen';
import { CustomerSegmentsScreen } from '@features/business/screens/CustomerSegmentsScreen';
import { BoostEngineScreen } from '@features/business/screens/BoostEngineScreen';
import { BusinessQrScreen } from '@features/business/screens/BusinessQrScreen';
import { LocationQrScreen } from '@features/business/screens/LocationQrScreen';
import { BusinessDiscoveryFeedScreen } from '@features/business/screens/BusinessDiscoveryFeedScreen';
import {
  boostAudiences,
  boostBudgetTiers,
  boostRadii,
  businessQrIdentity,
  businessQrRouting,
  campaigns,
  campaignRetention,
  customerSegments,
  discoveryControls,
  discoveryFeedCard,
  locationQrRules,
  scanPoints,
} from '@features/business/data/businessGrowthData';

afterEach(cleanup);

/**
 * Press a control and let its resulting render settle before the next
 * interaction. Two back-to-back presses with no flush in between leave React's
 * act queue unbalanced, which poisons every later test in the run — so
 * consecutive interactions go through here.
 */
/** Press the first match, for labels that repeat across sibling cards. */
async function pressFirst(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getAllByLabelText(label)[0]);
  await waitFor(() => expect(view.getAllByLabelText(label).length).toBeGreaterThan(0));
}

async function pressAndSettle(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getByLabelText(label));
  await waitFor(() => expect(view.getByLabelText(label)).toBeTruthy());
}

describe('campaigns hub', () => {
  const copy = strings.campaignsHub;

  it('renders the header, live figures, every campaign and the playbook', async () => {
    const view = await render(<CampaignsHubScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.headerSubtitle)).toBeTruthy();
    expect(view.getByText(copy.reachValue)).toBeTruthy();
    expect(view.getByText(copy.gmvValue)).toBeTruthy();
    campaigns.forEach(campaign => {
      expect(view.getAllByText(campaign.name).length).toBeGreaterThan(0);
      expect(view.getAllByText(campaign.offer).length).toBeGreaterThan(0);
    });
    // The playbook subtitle heads both the panel and its CTA.
    expect(view.getAllByText(campaignRetention.subtitle).length).toBeGreaterThan(0);
    expect(view.getByText(campaignRetention.offer)).toBeTruthy();
  });

  it('filters the campaign list and pauses a campaign', async () => {
    const onApplyFilter = jest.fn();
    const onPauseCampaign = jest.fn();
    const view = await render(
      <CampaignsHubScreen
        onApplyFilter={onApplyFilter}
        onPauseCampaign={onPauseCampaign}
      />,
    );

    await pressAndSettle(view, copy.tabs[1]);
    expect(onApplyFilter).toHaveBeenCalledWith(1);

    // Every live card carries the same pause CTA; target the first.
    await pressFirst(view, copy.pauseCta);
    expect(onPauseCampaign).toHaveBeenCalledWith(campaigns[0].id);
  });

  it('creates, edits, previews and exports', async () => {
    const onCreateCampaign = jest.fn();
    const onEditSetup = jest.fn();
    const onPreviewPush = jest.fn();
    const onExport = jest.fn();
    const view = await render(
      <CampaignsHubScreen
        onCreateCampaign={onCreateCampaign}
        onEditSetup={onEditSetup}
        onPreviewPush={onPreviewPush}
        onExport={onExport}
      />,
    );

    await pressAndSettle(view, copy.createCta);
    expect(onCreateCampaign).toHaveBeenCalledTimes(1);

    await pressFirst(view, copy.editSetupCta);
    expect(onEditSetup).toHaveBeenCalledWith(campaigns[0].id);

    await pressFirst(view, copy.previewPushCta);
    expect(onPreviewPush).toHaveBeenCalledWith(campaigns[0].id);

    await pressAndSettle(view, copy.exportCta);
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});

describe('customer segments', () => {
  const copy = strings.customerSegments;

  it('renders the scope, footfall figures and every smart segment', async () => {
    const view = await render(<CustomerSegmentsScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.footfallValue)).toBeTruthy();
    expect(view.getByText(copy.scopeLabel)).toBeTruthy();
    customerSegments.forEach(segment => {
      expect(view.getAllByText(segment.name).length).toBeGreaterThan(0);
      expect(view.getAllByText(segment.detail).length).toBeGreaterThan(0);
    });
    copy.customFilters.forEach(filter => {
      expect(view.getByText(filter.label)).toBeTruthy();
    });
  });

  it('changes the target district, saves a cohort and runs a segment action', async () => {
    const onSaveCohort = jest.fn();
    const onRunSegmentAction = jest.fn();
    const view = await render(
      <CustomerSegmentsScreen
        onSaveCohort={onSaveCohort}
        onRunSegmentAction={onRunSegmentAction}
      />,
    );

    await pressAndSettle(view, `${copy.targetDistrictLabel}: ${copy.targetDistricts[1]}`);
    expect(view.getByText(copy.saveCohortCta)).toBeTruthy();

    await pressAndSettle(view, copy.saveCohortCta);
    expect(onSaveCohort).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, customerSegments[0].cta);
    expect(onRunSegmentAction).toHaveBeenCalledWith(customerSegments[0].id);
  });

  it('opens a segment and the custom filter matrix', async () => {
    const onOpenSegment = jest.fn();
    const onConfigureMatrix = jest.fn();
    const view = await render(
      <CustomerSegmentsScreen
        onOpenSegment={onOpenSegment}
        onConfigureMatrix={onConfigureMatrix}
      />,
    );

    await pressAndSettle(view, copy.customMatrixCta);
    expect(onConfigureMatrix).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, customerSegments[0].name);
    expect(onOpenSegment).toHaveBeenCalledWith(customerSegments[0].id);
  });
});

describe('boost engine', () => {
  const copy = strings.boostEngine;

  it('renders metrics, the boosted deal, radius, audience and budget', async () => {
    const view = await render(<BoostEngineScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.activeBanner)).toBeTruthy();
    expect(view.getByText('4.6x')).toBeTruthy();
    boostRadii.forEach(radius => {
      expect(view.getByText(radius.title)).toBeTruthy();
    });
    boostAudiences.forEach(audience => {
      expect(view.getByText(audience.title)).toBeTruthy();
    });
    boostBudgetTiers.forEach(tier => {
      expect(view.getByText(tier.name)).toBeTruthy();
    });
    expect(view.getByText(copy.investmentTitle)).toBeTruthy();
  });

  it('recalculates the investment when the tier or duration changes', async () => {
    const view = await render(<BoostEngineScreen />);

    // 5,000/day x 7 days.
    expect(view.getByText('₦35,000')).toBeTruthy();

    await pressAndSettle(view, `${copy.budgetTitle}: ${copy.durations[2]}`);
    expect(view.getByText('₦70,000')).toBeTruthy();

    await pressAndSettle(view, `${copy.budgetTitle}: ${boostBudgetTiers[2].name}`);
    expect(view.getByText('₦140,000')).toBeTruthy();
  });

  it('launches, changes the deal, previews and opens history', async () => {
    const onLaunch = jest.fn();
    const onChangeDeal = jest.fn();
    const onClaimDeal = jest.fn();
    const onViewHistory = jest.fn();
    const view = await render(
      <BoostEngineScreen
        onLaunch={onLaunch}
        onChangeDeal={onChangeDeal}
        onClaimDeal={onClaimDeal}
        onViewHistory={onViewHistory}
      />,
    );

    await pressAndSettle(view, copy.launchCta.replace('{amount}', '₦35,000'));
    expect(onLaunch).toHaveBeenCalledWith('₦35,000');

    await pressAndSettle(view, copy.changeDealCta);
    expect(onChangeDeal).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.claimDealCta);
    expect(onClaimDeal).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.historyCta);
    expect(onViewHistory).toHaveBeenCalledTimes(1);
  });
});

describe('business master QR', () => {
  const copy = strings.businessQr;

  it('renders the QR frame, shortcode, scan stats and routing options', async () => {
    const view = await render(<BusinessQrScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getAllByText(businessQrIdentity.brand).length).toBeGreaterThan(0);
    // The shortcode captions the QR frame and heads its own row.
    expect(view.getAllByText(businessQrIdentity.shortcode).length).toBeGreaterThan(0);
    expect(view.getByText(businessQrIdentity.code)).toBeTruthy();
    businessQrRouting.forEach(option => {
      expect(view.getAllByText(option.title).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.acrylicTitle)).toBeTruthy();
  });

  it('selects a scan destination and copies the shortcode', async () => {
    const onSelectRouting = jest.fn();
    const onCopyCode = jest.fn();
    const view = await render(
      <BusinessQrScreen onSelectRouting={onSelectRouting} onCopyCode={onCopyCode} />,
    );

    await pressAndSettle(view, businessQrRouting[1].title);
    expect(onSelectRouting).toHaveBeenCalledWith(businessQrRouting[1].id);

    await pressAndSettle(view, copy.shortcodeLabel);
    expect(onCopyCode).toHaveBeenCalledWith(businessQrIdentity.shortcode);
  });

  it('shares, downloads, orders a standee and customises it', async () => {
    const onShare = jest.fn();
    const onDownloadKit = jest.fn();
    const onOrderStandee = jest.fn();
    const onCustomizeStandee = jest.fn();
    const view = await render(
      <BusinessQrScreen
        onShare={onShare}
        onDownloadKit={onDownloadKit}
        onOrderStandee={onOrderStandee}
        onCustomizeStandee={onCustomizeStandee}
      />,
    );

    await pressAndSettle(view, copy.shareCta);
    expect(onShare).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.downloadKitCta);
    expect(onDownloadKit).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.standeeCta);
    expect(onOrderStandee).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.customizeCta);
    expect(onCustomizeStandee).toHaveBeenCalledTimes(1);
  });
});

describe('location QR', () => {
  const copy = strings.locationQr;

  it('renders the network status, every scan point and the branch rules', async () => {
    const view = await render(<LocationQrScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.networkTitle)).toBeTruthy();
    scanPoints.forEach(point => {
      expect(view.getAllByText(point.name).length).toBeGreaterThan(0);
    });
    locationQrRules.forEach(rule => {
      expect(view.getByText(rule.title)).toBeTruthy();
    });
  });

  it('filters by branch and runs a per-point action', async () => {
    const onFilterBranch = jest.fn();
    const onViewTag = jest.fn();
    const view = await render(
      <LocationQrScreen onFilterBranch={onFilterBranch} onViewTag={onViewTag} />,
    );

    await pressAndSettle(view, copy.branchGroups[1].label);
    expect(onFilterBranch).toHaveBeenCalledWith(copy.branchGroups[1].id);

    await pressAndSettle(view, `${copy.viewTagCta}: ${scanPoints[1].name}`);
    expect(onViewTag).toHaveBeenCalledWith(scanPoints[1].id);
  });

  it('creates a point, exports the set and orders acrylics', async () => {
    const onNewPoint = jest.fn();
    const onExportAll = jest.fn();
    const onOrderAcrylics = jest.fn();
    const view = await render(
      <LocationQrScreen
        onNewPoint={onNewPoint}
        onExportAll={onExportAll}
        onOrderAcrylics={onOrderAcrylics}
      />,
    );

    await pressAndSettle(view, copy.newPointCta);
    expect(onNewPoint).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.exportCta);
    expect(onExportAll).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.acrylicCta);
    expect(onOrderAcrylics).toHaveBeenCalledTimes(1);
  });
});

describe('business discovery feed', () => {
  const copy = strings.businessDiscoveryFeed;

  it('renders the health score, reach figures, feed card and controls', async () => {
    const view = await render(<BusinessDiscoveryFeedScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.healthValue)).toBeTruthy();
    // The business name heads the feed header and the simulated feed card.
    expect(view.getAllByText(discoveryFeedCard.name).length).toBeGreaterThan(0);
    expect(view.getByText(copy.indexTitle)).toBeTruthy();
    expect(view.getByText(copy.zonesTitle)).toBeTruthy();
    discoveryControls.forEach(control => {
      expect(view.getAllByText(control.title).length).toBeGreaterThan(0);
    });
  });

  it('toggles a discovery automation control', async () => {
    const onToggleControl = jest.fn();
    const view = await render(
      <BusinessDiscoveryFeedScreen onToggleControl={onToggleControl} />,
    );

    await pressAndSettle(view, discoveryControls[0].title);
    expect(onToggleControl).toHaveBeenCalledWith(discoveryControls[0].id, false);
  });

  it('previews the consumer feed, edits the card and boosts', async () => {
    const onPreviewConsumerFeed = jest.fn();
    const onEditFeedCard = jest.fn();
    const onBoostFeed = jest.fn();
    const view = await render(
      <BusinessDiscoveryFeedScreen
        onPreviewConsumerFeed={onPreviewConsumerFeed}
        onEditFeedCard={onEditFeedCard}
        onBoostFeed={onBoostFeed}
      />,
    );

    await pressAndSettle(view, copy.previewCta);
    expect(onPreviewConsumerFeed).toHaveBeenCalledTimes(1);

    // "Edit Feed Card" labels both the footer CTA and the card's own action.
    fireEvent.press(view.getAllByLabelText(copy.editCardCta)[0]);
    await waitFor(() =>
      expect(view.getAllByLabelText(copy.editCardCta).length).toBeGreaterThan(0),
    );
    expect(onEditFeedCard).toHaveBeenCalledTimes(1);

    // "Supercharge Discovery Feed" labels the footer CTA and the booster row.
    await pressFirst(view, copy.boostCta);
    expect(onBoostFeed).toHaveBeenCalledTimes(1);
  });
});
