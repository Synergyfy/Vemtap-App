import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { CampaignsHubScreen } from '@features/business/screens/CampaignsHubScreen';
import { CustomerSegmentsScreen } from '@features/business/screens/CustomerSegmentsScreen';
import { BoostEngineScreen } from '@features/business/screens/BoostEngineScreen';
import { BusinessQrScreen } from '@features/business/screens/BusinessQrScreen';
import { LocationQrScreen } from '@features/business/screens/LocationQrScreen';
import { BusinessDiscoveryFeedScreen } from '@features/business/screens/BusinessDiscoveryFeedScreen';
import { boostAudiences, boostRadii } from '@features/business/data/businessGrowthData';
import { toBusinessQrView, toLocationQrView } from '@features/business/utils/qrMappers';
import { toDiscoveryView } from '@features/business/utils/networkMappers';
import { qrSummaryFixture } from '../../../../../__tests__/helpers/qrFixtures';
import { discoveryFixture } from '../../../../../__tests__/helpers/networkFixtures';
import {
  boostEngineLiveFixture,
  boostTiersFixture,
  campaignCardsFixture,
  segmentCardsFixture,
} from '../../../../../__tests__/helpers/growthFixtures';

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
  const campaigns = campaignCardsFixture;
  const playbook = { subtitle: 'Win Back 12 Lapsed Customers', body: '12 lapsed.' };

  it('renders the header, every live campaign and the playbook', async () => {
    const view = await render(
      <CampaignsHubScreen campaigns={campaigns} playbook={playbook} />,
    );

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.headerSubtitle)).toBeTruthy();
    campaigns.forEach(campaign => {
      expect(view.getAllByText(campaign.name).length).toBeGreaterThan(0);
    });
    // The playbook subtitle heads both the panel and its CTA.
    expect(view.getAllByText(playbook.subtitle).length).toBeGreaterThan(0);
  });

  it('shows no figures or playbook until they load', async () => {
    const view = await render(<CampaignsHubScreen campaigns={[]} />);
    expect(view.getAllByText('\u2014').length).toBeGreaterThan(0);
    expect(view.queryByText(copy.playbookTitle)).toBeNull();
  });

  it('filters the campaign list and pauses a campaign', async () => {
    const onApplyFilter = jest.fn();
    const onPauseCampaign = jest.fn();
    const view = await render(
      <CampaignsHubScreen
        campaigns={campaigns}
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
        campaigns={campaigns}
        onCreateCampaign={onCreateCampaign}
        onEditSetup={onEditSetup}
        onPreviewPush={onPreviewPush}
        onExport={onExport}
      />,
    );

    await pressAndSettle(view, copy.createCta);
    expect(onCreateCampaign).toHaveBeenCalledTimes(1);

    // Only a draft can be set up further.
    await pressFirst(view, copy.live.continueCta);
    expect(onEditSetup).toHaveBeenCalledWith(campaigns[1].id);

    await pressFirst(view, copy.previewPushCta);
    expect(onPreviewPush).toHaveBeenCalledWith(campaigns[0].id);

    await pressAndSettle(view, copy.exportCta);
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});

describe('customer segments', () => {
  const copy = strings.customerSegments;
  const segments = segmentCardsFixture;

  it('renders the scope, live figures and every segment', async () => {
    const view = await render(
      <CustomerSegmentsScreen
        segments={segments}
        metrics={{ footfall: '320', reach: '210' }}
        scopeLabel="Jabi"
      />,
    );

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText('320')).toBeTruthy();
    expect(view.getByText('Jabi')).toBeTruthy();
    segments.forEach(segment => {
      expect(view.getAllByText(segment.name).length).toBeGreaterThan(0);
      expect(view.getAllByText(segment.detail).length).toBeGreaterThan(0);
    });
    expect(view.queryByText(/Wuse|Maitama|1,842/)).toBeNull();
  });

  it('runs a segment action and opens a segment', async () => {
    const onRunSegmentAction = jest.fn();
    const onOpenSegment = jest.fn();
    const onConfigureMatrix = jest.fn();
    const view = await render(
      <CustomerSegmentsScreen
        segments={segments}
        onRunSegmentAction={onRunSegmentAction}
        onOpenSegment={onOpenSegment}
        onConfigureMatrix={onConfigureMatrix}
      />,
    );

    await pressAndSettle(view, segments[0].cta);
    expect(onRunSegmentAction).toHaveBeenCalledWith(segments[0].id);

    await pressAndSettle(view, copy.customMatrixCta);
    expect(onConfigureMatrix).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, segments[0].name);
    expect(onOpenSegment).toHaveBeenCalledWith(segments[0].id);
  });
});

describe('boost engine', () => {
  const copy = strings.boostEngine;

  it('renders live metrics, the boosted deal, radius, audience and budget', async () => {
    const view = await render(
      <BoostEngineScreen live={boostEngineLiveFixture} tiers={boostTiersFixture} />,
    );

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText('1,240')).toBeTruthy();
    boostRadii.forEach(radius => {
      expect(view.getByText(radius.title)).toBeTruthy();
    });
    boostTiersFixture.forEach(tier => {
      expect(view.getByText(tier.label)).toBeTruthy();
    });
    expect(view.getByText(copy.investmentTitle)).toBeTruthy();
  });

  it('uses the API tier as the whole budget, whatever the duration', async () => {
    const onLaunch = jest.fn();
    const view = await render(
      <BoostEngineScreen
        live={boostEngineLiveFixture}
        tiers={boostTiersFixture}
        onLaunch={onLaunch}
      />,
    );

    // The middle tier is suggested; its amount is the total for the run.
    expect(view.getAllByText('₦25,000').length).toBeGreaterThan(0);

    await pressAndSettle(view, `${copy.budgetTitle}: ${copy.durations[2]}`);
    await pressAndSettle(view, copy.launchCta.replace('{amount}', '₦25,000'));
    expect(onLaunch).toHaveBeenLastCalledWith(
      '₦25,000',
      expect.objectContaining({ days: 14, total: 25_000 }),
    );

    await pressAndSettle(view, `${copy.budgetTitle}: ${boostTiersFixture[2].label}`);
    await pressAndSettle(view, copy.launchCta.replace('{amount}', '₦50,000'));
    expect(onLaunch).toHaveBeenLastCalledWith(
      '₦50,000',
      expect.objectContaining({ total: 50_000 }),
    );
  });

  it('launches, changes the deal, previews and opens history', async () => {
    const onLaunch = jest.fn();
    const onChangeDeal = jest.fn();
    const onClaimDeal = jest.fn();
    const onViewHistory = jest.fn();
    const view = await render(
      <BoostEngineScreen
        live={boostEngineLiveFixture}
        onLaunch={onLaunch}
        onChangeDeal={onChangeDeal}
        onClaimDeal={onClaimDeal}
        onViewHistory={onViewHistory}
      />,
    );

    // Default tiers mirror the API's until `/boosts/options` answers.
    await pressAndSettle(view, copy.launchCta.replace('{amount}', '₦20,000'));
    expect(onLaunch).toHaveBeenCalledWith(
      '₦20,000',
      expect.objectContaining({ radiusKm: 3, days: 7, total: 20_000 }),
    );

    await pressAndSettle(view, copy.changeDealCta);
    expect(onChangeDeal).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.claimDealCta);
    expect(onClaimDeal).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.historyCta);
    expect(onViewHistory).toHaveBeenCalledTimes(1);
  });
});

describe('boost engine live audiences', () => {
  const copy = strings.boostEngine;
  const live = { ...boostEngineLiveFixture, metrics: [] };
  const audienceLabel = (title: string) => `${copy.audienceTitle}: ${title}`;
  const [regulars, competitors, walkins] = boostAudiences;

  it('offers past customers and walk-ins, never competitor claimers', async () => {
    const view = await render(<BoostEngineScreen live={live} />);
    expect(view.getByText(regulars.title)).toBeTruthy();
    expect(view.getByText(walkins.title)).toBeTruthy();
    expect(view.queryByText(competitors.title)).toBeNull();
  });

  it('starts with everyone nearby, and a second tap clears the audience', async () => {
    const onLaunch = jest.fn();
    const view = await render(<BoostEngineScreen live={live} onLaunch={onLaunch} />);
    const launch = () =>
      pressAndSettle(view, copy.launchCta.replace('{amount}', '₦20,000'));

    await launch();
    expect(onLaunch.mock.calls[0][1].audience).toBe('');

    await pressAndSettle(view, audienceLabel(walkins.title));
    await launch();
    expect(onLaunch.mock.calls[1][1].audience).toBe('walkins');

    await pressAndSettle(view, audienceLabel(walkins.title));
    await launch();
    expect(onLaunch.mock.calls[2][1].audience).toBe('');
  });
});

describe('business master QR', () => {
  const copy = strings.businessQr;
  const qrView = toBusinessQrView(qrSummaryFixture);

  it('renders the real QR, business link, master code and scan stats', async () => {
    const view = await render(<BusinessQrScreen view={qrView} />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.statusSub('Wuse Flagship', 'Urban Grill'))).toBeTruthy();
    expect(view.getAllByText('vemtap.com/b/BIZ8820').length).toBeGreaterThan(0);
    expect(view.getByText('BIZ8820')).toBeTruthy();
    expect(view.getByText('120')).toBeTruthy();
    expect(view.getByText('25%')).toBeTruthy();
    expect(view.getByText(strings.businessIntelligence.newThisPeriod)).toBeTruthy();
    expect(view.queryByText('Scan Destination Routing')).toBeNull();
  });

  it('shows loading and error states before the codes arrive', async () => {
    const view = await render(<BusinessQrScreen isError onRetry={jest.fn()} />);
    expect(view.getByText(copy.error.title)).toBeTruthy();
  });

  it('copies the link and the master code', async () => {
    const onCopyCode = jest.fn();
    const view = await render(<BusinessQrScreen view={qrView} onCopyCode={onCopyCode} />);

    await pressAndSettle(view, copy.shortcodeLabel);
    await pressAndSettle(view, copy.codeLabel);
    expect(onCopyCode).toHaveBeenNthCalledWith(1, 'https://vemtap.com/b/BIZ8820');
    expect(onCopyCode).toHaveBeenNthCalledWith(2, 'BIZ8820');
  });

  it('shares, downloads the kit, requests a standee and shows the result', async () => {
    const onShare = jest.fn();
    const onDownloadKit = jest.fn();
    const onOrderStandee = jest.fn();
    const view = await render(
      <BusinessQrScreen
        view={qrView}
        onShare={onShare}
        onDownloadKit={onDownloadKit}
        onOrderStandee={onOrderStandee}
        notice={{ tone: 'success', text: copy.downloadKitReady(5) }}
      />,
    );

    await pressAndSettle(view, copy.shareCta);
    await pressAndSettle(view, copy.downloadKitCta);
    await pressAndSettle(view, copy.standeeCta);
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onDownloadKit).toHaveBeenCalledTimes(1);
    expect(onOrderStandee).toHaveBeenCalledTimes(1);
    expect(view.getByText(copy.downloadKitReady(5))).toBeTruthy();
  });
});

describe('location QR', () => {
  const copy = strings.locationQr;
  const locationView = toLocationQrView(qrSummaryFixture);

  it('renders the network status, branch codes and tap points', async () => {
    const view = await render(<LocationQrScreen view={locationView} />);

    expect(view.getByText(copy.manageSubtitle(2))).toBeTruthy();
    expect(view.getByText(copy.network.live)).toBeTruthy();
    expect(view.getAllByText('Wuse Flagship').length).toBeGreaterThan(0);
    expect(view.getByText('Till 01')).toBeTruthy();
    expect(view.getByText(copy.weeklyScans('18'))).toBeTruthy();
    expect(view.getByText(copy.statusLive)).toBeTruthy();
    expect(view.getByText(copy.statusInactive)).toBeTruthy();
  });

  it('filters by branch and opens a scan tag', async () => {
    const onFilterBranch = jest.fn();
    const view = await render(
      <LocationQrScreen view={locationView} onFilterBranch={onFilterBranch} />,
    );

    await pressFirst(view, 'Garki Express');
    expect(onFilterBranch).toHaveBeenCalledWith('b-garki');
    expect(view.queryByText('Till 01')).toBeNull();
    expect(view.getByText('Front Door')).toBeTruthy();

    await pressAndSettle(view, `${copy.viewTagCta} Front Door`);
    expect(view.getByText(copy.tagTitle)).toBeTruthy();
  });

  it('shares a code, prints a branch sheet, exports everything and requests devices', async () => {
    const onShare = jest.fn();
    const onPrintSheet = jest.fn();
    const onRequestDevices = jest.fn();
    const view = await render(
      <LocationQrScreen
        view={locationView}
        onShare={onShare}
        onPrintSheet={onPrintSheet}
        onRequestDevices={onRequestDevices}
      />,
    );

    await pressAndSettle(view, `${copy.shareCta} Till 01`);
    expect(onShare).toHaveBeenCalledWith(expect.objectContaining({ id: 'd-till' }));
    await pressAndSettle(view, `${copy.printStickerCta} Till 01`);
    expect(onPrintSheet).toHaveBeenCalledWith('b-wuse');
    await pressAndSettle(view, copy.exportCta);
    expect(onPrintSheet).toHaveBeenLastCalledWith(null);
    await pressAndSettle(view, copy.acrylicCta);
    expect(onRequestDevices).toHaveBeenCalledTimes(1);
  });
});

describe('business discovery feed', () => {
  const copy = strings.businessDiscoveryFeed;
  const discovery = toDiscoveryView(discoveryFixture);

  it('renders the health index, feed card, index, zones and controls', async () => {
    const view = await render(<BusinessDiscoveryFeedScreen view={discovery} />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText('80')).toBeTruthy();
    expect(view.getByText(copy.healthMissing('cover photo, opening hours'))).toBeTruthy();
    expect(view.getAllByText('Urban Grill').length).toBeGreaterThan(0);
    expect(
      view.getByText(strings.businessIntelligence.deals.percentOff('20')),
    ).toBeTruthy();
    expect(view.getByText(copy.indexRows.missing)).toBeTruthy();
    expect(view.getByText(copy.zonesBadge(1))).toBeTruthy();
    expect(
      view.getAllByText(copy.controls.joinDiscoveryNetwork.title).length,
    ).toBeGreaterThan(0);
  });

  it('shows an error state when discovery cannot load', async () => {
    const view = await render(
      <BusinessDiscoveryFeedScreen isError onRetry={jest.fn()} />,
    );
    expect(view.getByText(copy.error.title)).toBeTruthy();
  });

  it('toggles a discovery setting', async () => {
    const onToggleControl = jest.fn();
    const view = await render(
      <BusinessDiscoveryFeedScreen view={discovery} onToggleControl={onToggleControl} />,
    );

    await pressFirst(view, copy.controls.allowPromotions.title);
    expect(onToggleControl).toHaveBeenCalledWith('allowPromotions', true);
  });

  it('keeps the settings read-only for non-owners', async () => {
    const view = await render(
      <BusinessDiscoveryFeedScreen view={discovery} canEditControls={false} />,
    );
    expect(view.getByText(copy.controlsOwnerOnly)).toBeTruthy();
  });

  it('edits the card and boosts', async () => {
    const onEditFeedCard = jest.fn();
    const onBoostFeed = jest.fn();
    const view = await render(
      <BusinessDiscoveryFeedScreen
        view={discovery}
        onEditFeedCard={onEditFeedCard}
        onBoostFeed={onBoostFeed}
      />,
    );

    await pressFirst(view, copy.editCardCta);
    expect(onEditFeedCard).toHaveBeenCalledTimes(1);
    await pressFirst(view, copy.boostCta);
    expect(onBoostFeed).toHaveBeenCalledTimes(1);
  });
});
