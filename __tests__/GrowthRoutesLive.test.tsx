import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { strings } from '@constants/strings';
import { segmentsApi } from '@api/segmentsApi';
import { promotionsApi, type Promotion } from '@api/promotionsApi';
import { adWalletApi } from '@api/adWalletApi';
import {
  CampaignReviewLaunchRoute,
  CampaignsHubRoute,
  CreateCustomSegmentRoute,
  CustomerSegmentsRoute,
} from '@navigation/growthRoutes';
import { useCampaignDraftStore } from '@store/campaignDraftStore';
import { draftToSaveInput } from '@features/business/utils/campaignMappers';

const BRANCH_ID = '6f1c2b8e-4d3a-4b5c-9e7f-1a2b3c4d5e6f';

jest.mock('@features/business/hooks/useActiveBranch', () => ({
  useActiveBranch: () => ({
    branches: [
      { id: '6f1c2b8e-4d3a-4b5c-9e7f-1a2b3c4d5e6f', name: 'Wuse II', address: '' },
    ],
    activeBranchId: '6f1c2b8e-4d3a-4b5c-9e7f-1a2b3c4d5e6f',
    setActiveBranch: jest.fn(),
    isLive: true,
  }),
}));

jest.mock('@features/business/hooks/useCatalogueMutations', () => ({
  useBusinessBranches: () => ({
    isPending: false,
    data: [{ id: '6f1c2b8e-4d3a-4b5c-9e7f-1a2b3c4d5e6f', name: 'Wuse II', address: '' }],
  }),
}));

jest.mock('@components/shared/toast', () => ({ showToast: jest.fn() }));

/** Let debounced queries and mutation callbacks run. */
function settle(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

const Root = createNativeStackNavigator();
const Tabs = createNativeStackNavigator();
const More = createNativeStackNavigator();

function Blank() {
  return <View />;
}

/**
 * Mirrors the app's nesting (root → `BusinessTabs` → `BusinessMore` stack):
 * `useBusinessNavigation` reads the active business tab from it to decide
 * whether a route can be replaced in place.
 */
function moreStack(initialRouteName: string) {
  const MoreStack = () => (
    <More.Navigator initialRouteName={initialRouteName}>
      <More.Screen name="CustomerSegments" component={CustomerSegmentsRoute} />
      <More.Screen name="CreateCustomSegment" component={CreateCustomSegmentRoute} />
      <More.Screen name="SegmentAudienceDetails" component={Blank} />
      <More.Screen name="CampaignsHub" component={CampaignsHubRoute} />
      <More.Screen name="CampaignReviewLaunch" component={CampaignReviewLaunchRoute} />
      <More.Screen name="CampaignCreateObjective" component={Blank} />
    </More.Navigator>
  );
  return MoreStack;
}

async function renderRoutes(initialRouteName: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const ref = createNavigationContainerRef();
  const MoreStack = moreStack(initialRouteName);
  function BusinessTabs() {
    return (
      <Tabs.Navigator>
        <Tabs.Screen name="BusinessMore" component={MoreStack} />
      </Tabs.Navigator>
    );
  }
  const view = await render(
    <QueryClientProvider client={client}>
      <NavigationContainer ref={ref}>
        <Root.Navigator>
          <Root.Screen name="BusinessTabs" component={BusinessTabs} />
        </Root.Navigator>
      </NavigationContainer>
    </QueryClientProvider>,
  );
  await act(async () => {
    await settle(400);
  });
  return { ref, view };
}

const reach = {
  size: 1840,
  reachableByPush: 1600,
  reachableBySms: 900,
  reachableByEmail: 0,
};

beforeEach(() => {
  jest.spyOn(segmentsApi, 'previewSegment').mockResolvedValue(reach);
  jest.spyOn(segmentsApi, 'listSegments').mockResolvedValue([
    {
      id: 'seg-1',
      name: 'Lapsed regulars',
      type: 'dynamic',
      size: 42,
      criteria: { recency: { notVisitedForDays: 60 } },
    },
  ]);
  jest.spyOn(segmentsApi, 'getSegmentCriteriaOptions').mockResolvedValue({
    deals: [
      { id: 'deal-1', name: 'Lunch Combo' },
      { id: 'deal-2', name: 'Weekend Feast' },
    ],
    menuItems: [],
    branches: [],
  });
  jest
    .spyOn(adWalletApi, 'getWallet')
    .mockResolvedValue({ balance: 50_000, spendable: 50_000 });
  jest.spyOn(promotionsApi, 'forecastPromotion').mockResolvedValue({
    budget: 35_000,
    durationDays: 7,
    dailyPace: 5_000,
    radiusKm: 3,
    reachMin: 14_700,
    reachMax: 23_100,
    claimsMin: 110,
    claimsMax: 212,
    audienceCapped: false,
  });
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  useCampaignDraftStore.getState().reset();
});

describe('customer segments (live)', () => {
  it('lists saved segments and the footfall instead of the sample cohorts', async () => {
    await renderRoutes('CustomerSegments');
    expect(screen.getByText('Lapsed regulars')).toBeTruthy();
    expect(screen.getByText('1,840')).toBeTruthy();
    expect(screen.queryByText('VIP Patrons (Top 5%)')).toBeNull();
    // The prototype's district matrix has no live source.
    expect(screen.queryByText(strings.customerSegments.customTitle)).toBeNull();
    expect(segmentsApi.listSegments).toHaveBeenCalledWith({ branchId: BRANCH_ID });
  });
});

describe('create custom segment (live)', () => {
  it('saves the picked deal as a dynamic rule set on the active branch', async () => {
    const create = jest
      .spyOn(segmentsApi, 'createSegment')
      .mockResolvedValue({ id: 'seg-9', name: 'Feast fans', type: 'dynamic' });
    const { ref } = await renderRoutes('CreateCustomSegment');
    const builder = strings.campaignWizard.customSegment;

    // Live builder starts empty and offers only criteria the API can evaluate.
    expect(screen.queryByText('Saved deal to wallet but did not redeem')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText(builder.nameLabel), 'Feast fans');
    await fireEvent.press(screen.getByText('Claimed a specific promotional deal'));
    await fireEvent.press(screen.getByText('Weekend Feast'));
    await act(async () => {
      await settle(400);
    });
    expect(screen.getAllByText('1840').length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(builder.saveCta.replace('{count}', '1840')));
      await settle(50);
    });

    expect(create).toHaveBeenCalledWith({
      name: 'Feast fans',
      description: undefined,
      criteria: { deals: { offerIds: ['deal-2'] } },
      branchId: BRANCH_ID,
      type: 'dynamic',
    });
    expect(ref.getCurrentRoute()?.name).toBe('SegmentAudienceDetails');
    expect(ref.getCurrentRoute()?.params).toEqual({ segmentId: 'seg-9' });
  });
});

const savedPromotion: Promotion = {
  id: '0b9a4f1e-1c2d-4e5f-8a9b-0c1d2e3f4a5b',
  name: 'Promote a Deal: Lunch Combo',
  status: 'Draft',
  objective: 'deal',
  assets: [{ type: 'deal', id: 'd1' }],
  budget: 35_000,
  spent: 0,
  remaining: 35_000,
};

describe('campaign review (live)', () => {
  it('saves the whole draft, launches it from the wallet and returns to the hub', async () => {
    jest.spyOn(promotionsApi, 'listPromotions').mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 50,
      hasNextPage: false,
    });
    const create = jest
      .spyOn(promotionsApi, 'createPromotion')
      .mockResolvedValue(savedPromotion);
    const launch = jest
      .spyOn(promotionsApi, 'launchPromotion')
      .mockResolvedValue({ ...savedPromotion, status: 'Active' });
    useCampaignDraftStore.getState().update({
      objectiveId: 'deal',
      assets: [{ type: 'deal', id: 'd1', title: 'Lunch Combo' }],
      branchIds: [BRANCH_ID],
    });
    const { ref } = await renderRoutes('CampaignReviewLaunch');

    // The forecast replaces the design's fixed reach/ROAS figures.
    expect(screen.getByText('15k – 23k')).toBeTruthy();
    expect(screen.queryByText('~₦1.4M')).toBeNull();

    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(
          strings.campaignWizard.launchCta.replace('{amount}', '₦35,000'),
        ),
      );
      await settle(50);
    });

    expect(create).toHaveBeenCalledWith(
      draftToSaveInput({
        ...useCampaignDraftStore.getInitialState().draft,
        objectiveId: 'deal',
        assets: [{ type: 'deal', id: 'd1', title: 'Lunch Combo' }],
        branchIds: [BRANCH_ID],
      }),
    );
    expect(launch).toHaveBeenCalledWith(savedPromotion.id, {
      fundingSource: 'wallet',
      callbackUrl: 'vemtap://payments/return',
    });
    expect(ref.getCurrentRoute()?.name).toBe('CampaignsHub');
  });
});

describe('campaigns hub (live)', () => {
  it('lists live campaigns and pauses one through the API', async () => {
    jest.spyOn(promotionsApi, 'listPromotions').mockResolvedValue({
      data: [
        {
          ...savedPromotion,
          status: 'Active',
          launchedAt: '2026-10-14T10:00:00Z',
          impressions: 1200,
          clicks: 80,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      hasNextPage: false,
    });
    jest.spyOn(promotionsApi, 'getPromotionSummary').mockResolvedValue({
      live: 1,
      scheduled: 0,
      paused: 0,
      drafts: 0,
      ended: 0,
      totalBudget: 35_000,
      totalSpent: 5_000,
      audienceReached: 1200,
      claims: 9,
      redemptions: 4,
      revenue: 42_000,
    });
    const pause = jest
      .spyOn(promotionsApi, 'pausePromotion')
      .mockResolvedValue({ ...savedPromotion, status: 'Paused' });
    await renderRoutes('CampaignsHub');

    expect(screen.getByText(savedPromotion.name)).toBeTruthy();
    expect(screen.queryByText('Friday Happy Hour Flash Rush')).toBeNull();
    expect(screen.getByText('₦42,000')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.campaignsHub.pauseCta));
    });
    expect(pause).toHaveBeenCalledWith(savedPromotion.id);
  });
});
