import React, { useMemo, useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { strings } from '@constants/strings';
import { CustomerSegmentsScreen } from '@features/business/screens/CustomerSegmentsScreen';
import {
  CreateCustomSegmentScreen,
  type CustomSegmentCriteriaSelection,
} from '@features/business/screens/CreateCustomSegmentScreen';
import { SegmentAudienceDetailsScreen } from '@features/business/screens/SegmentAudienceDetailsScreen';
import { SegmentActionsSheet } from '@features/business/screens/SegmentActionsSheet';
import { CampaignsHubScreen } from '@features/business/screens/CampaignsHubScreen';
import { CampaignStep1ObjectiveScreen } from '@features/business/screens/CampaignStep1ObjectiveScreen';
import { CampaignStep2ContentScreen } from '@features/business/screens/CampaignStep2ContentScreen';
import { CampaignStep3AudienceScreen } from '@features/business/screens/CampaignStep3AudienceScreen';
import { CampaignStep4ScheduleScreen } from '@features/business/screens/CampaignStep4ScheduleScreen';
import {
  CAMPAIGN_BUDGET_TIERS,
  CampaignStep5BudgetScreen,
} from '@features/business/screens/CampaignStep5BudgetScreen';
import { CampaignStep6ReviewScreen } from '@features/business/screens/CampaignStep6ReviewScreen';
import { showToast } from '@components/shared/toast';
import { useBusinessBranches } from '@features/business/hooks/useCatalogueMutations';
import {
  loadDraftIntoWizard,
  useAdWallet,
  useEligibleAssets,
  useLaunchCampaign,
  usePromotionForecasts,
  usePromotionSummary,
  usePromotions,
  useSaveCampaignDraft,
  useTogglePromotion,
} from '@features/business/hooks/useCampaigns';
import {
  eligibleAssetToContentItem,
  estimateRange,
  formatNaira as formatCampaignNaira,
  objectiveTitle,
  promotionToCampaignCard,
} from '@features/business/utils/campaignMappers';
import { LoadingState } from '@components/shared/LoadingState';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';
import { useActiveBranch } from '@features/business/hooks/useActiveBranch';
import { useMyBusiness } from '@features/business/hooks/useBusinessDashboardData';
import {
  useSaveSegment,
  useSegment,
  useSegmentCriteriaOptions,
  useSegmentInsights,
  useSegmentPreview,
  useSegments,
} from '@features/business/hooks/useSegments';
import {
  LIVE_SEGMENT_CRITERIA,
  criteriaToSelection,
  describeCriteria,
  formatCount,
  formatNaira,
  insightToDetailsView,
  segmentPickerOptions,
  segmentToCard,
  selectionToCriteria,
} from '@features/business/utils/segmentMappers';
import { useCampaignDraftStore } from '@store/campaignDraftStore';
import { useBusinessNavigation } from './useBusinessNavigation';
import type { BusinessTabParamList } from './types';

/**
 * Live routes for the growth hub's Segments surfaces. The screens render the
 * design's sample data when a prop is absent; these routes always pass live
 * data, so the app never shows the samples.
 */

const segmentCopy = strings.customerSegments;
const builderCopy = strings.campaignWizard.customSegment;
const actionsCopy = strings.campaignWizard.segmentActions;

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function CustomerSegmentsRoute() {
  const navigation = useBusinessNavigation();
  const { branches, activeBranchId } = useActiveBranch();
  const segments = useSegments();
  // `{}` matches every customer the business has seen: the hub's footfall.
  const everyone = useSegmentPreview(EMPTY_CRITERIA);

  const cards = useMemo(() => (segments.data ?? []).map(segmentToCard), [segments.data]);
  const scopeLabel = branches.find(branch => branch.id === activeBranchId)?.name;

  return (
    <CustomerSegmentsScreen
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onNewSegment={() => navigation.navigate('CreateCustomSegment')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Boost') navigation.navigate('BoostEngine');
        if (tabKey === 'Campaigns') navigation.navigate('CampaignsHub');
        if (tabKey === 'Insights') navigation.navigate('BusinessPerformanceAnalytics');
      }}
      onOpenSegment={segmentId =>
        navigation.navigate('SegmentAudienceDetails', { segmentId })
      }
      onRunSegmentAction={segmentId =>
        navigation.navigate('SegmentActions', {
          segmentId,
          segmentName: segments.data?.find(segment => segment.id === segmentId)?.name,
        })
      }
      onConfigureMatrix={() => navigation.navigate('CreateCustomSegment')}
      segments={cards}
      metrics={
        everyone.data
          ? {
              footfall: formatCount(everyone.data.size),
              reach: formatCount(everyone.data.reachableByPush),
            }
          : undefined
      }
      scopeLabel={scopeLabel}
      showPrototypeFilters={false}
      isLoading={segments.isLoading}
      error={
        segments.isError ? messageOf(segments.error, segmentCopy.error.body) : undefined
      }
      onRetry={() => segments.refetch()}
    />
  );
}

const EMPTY_CRITERIA = {};

export function CreateCustomSegmentRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'CreateCustomSegment'>>();
  const segmentId = route.params?.segmentId;
  const existing = useSegment(segmentId);
  const options = useSegmentCriteriaOptions();
  const business = useMyBusiness();
  const save = useSaveSegment();

  const pickerOptions = useMemo(() => segmentPickerOptions(options.data), [options.data]);
  const [selection, setSelection] = useState<CustomSegmentCriteriaSelection>({
    criteria: [],
    pickers: {},
  });
  const criteria = useMemo(
    () => selectionToCriteria(selection, pickerOptions),
    [selection, pickerOptions],
  );
  const preview = useSegmentPreview(criteria);

  // Editing waits for the saved segment and the picker options, so the
  // builder opens on what is stored instead of resetting to empty.
  // `isLoading`, not `isPending`: a disabled query (no live branch yet) is
  // pending forever and would leave the builder on a spinner.
  const waiting = (segmentId && existing.isLoading) || options.isLoading;
  if (waiting) {
    return (
      <BusinessScreenLayout
        header={{ title: builderCopy.title, onBack: navigation.goBack, showAvatar: true }}
      >
        <LoadingState />
      </BusinessScreenLayout>
    );
  }

  const initialSelection = existing.data
    ? criteriaToSelection(existing.data.criteria, pickerOptions)
    : { criteria: [], pickers: {} };

  return (
    <CreateCustomSegmentScreen
      onClose={navigation.goBack}
      onCancel={navigation.goBack}
      initialName={existing.data?.name ?? ''}
      initialMemo={existing.data?.description ?? ''}
      initialSelection={{
        criteria: [...initialSelection.criteria],
        pickers: { ...initialSelection.pickers },
      }}
      criterionIds={LIVE_SEGMENT_CRITERIA}
      pickerOptions={pickerOptions}
      sizing={
        preview.data
          ? {
              total: preview.data.size,
              push: preview.data.reachableByPush,
              dm: preview.data.reachableBySms,
            }
          : undefined
      }
      sizingPending={preview.isFetching}
      sizingNote={segmentCopy.live.builder.sizingNote}
      businessName={business.data?.name}
      onSelectionChange={setSelection}
      isSaving={save.isPending}
      error={
        save.isError
          ? messageOf(save.error, segmentCopy.live.builder.saveFailed)
          : undefined
      }
      onSave={segment =>
        save.mutate(
          {
            segmentId,
            input: {
              name: segment.name,
              description: segment.memo || undefined,
              criteria: selectionToCriteria(segment, pickerOptions),
            },
          },
          {
            onSuccess: saved =>
              navigation.replace('SegmentAudienceDetails', { segmentId: saved.id }),
          },
        )
      }
    />
  );
}

export function SegmentAudienceDetailsRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'SegmentAudienceDetails'>>();
  const segmentId = route.params?.segmentId;
  const segment = useSegment(segmentId);
  const insights = useSegmentInsights(segmentId);

  const details = useMemo(
    () => (insights.data ? insightToDetailsView(insights.data, segment.data) : undefined),
    [insights.data, segment.data],
  );

  return (
    <SegmentAudienceDetailsScreen
      onClose={navigation.goBack}
      onUseSegment={id =>
        navigation.navigate('SegmentActions', {
          segmentId: id,
          segmentName: insights.data?.name,
        })
      }
      // Only a rule-based segment has rules to edit.
      onEditRules={
        segment.data?.type === 'dynamic' && segmentId
          ? () => navigation.navigate('CreateCustomSegment', { segmentId })
          : undefined
      }
      onOpenCustomer={() => navigation.navigate('CustomerProfileDossier')}
      onOpenCrm={() => navigation.navigate('CustomerCrmDirectory')}
      details={details}
      isLoading={insights.isLoading}
      error={
        insights.isError
          ? messageOf(insights.error, segmentCopy.live.details.loadFailed)
          : undefined
      }
      onRetry={() => insights.refetch()}
    />
  );
}

export function SegmentActionsRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'SegmentActions'>>();
  const { segmentId, segmentName } = route.params ?? {};
  const segment = useSegment(segmentId);
  const insights = useSegmentInsights(segmentId);
  const { data } = insights;

  return (
    <SegmentActionsSheet
      visible
      segmentId={segmentId}
      segmentName={data?.name ?? segmentName}
      summary={
        data
          ? {
              meta: actionsCopy.liveMeta(formatCount(data.size)),
              spend: formatNaira(data.totalSpend),
              body:
                segment.data?.description?.trim() ||
                (data.type === 'dynamic'
                  ? describeCriteria(segment.data?.criteria)
                  : segmentCopy.live.staticInsight),
              pushReady: actionsCopy.livePushReady(formatCount(data.reachableByPush)),
              messageReady: actionsCopy.liveMessageReady(
                formatCount(data.reachableBySms),
              ),
            }
          : undefined
      }
      onClose={navigation.goBack}
      onCreateCampaign={id => {
        // The wizard starts aimed at this segment (Step 3 shows it pre-ticked).
        useCampaignDraftStore.getState().start({ segmentId: id });
        navigation.navigate('CampaignCreateObjective');
      }}
      onComposeMessage={() => navigation.navigate('BusinessMessagesHome')}
      onPromoteDeal={() => navigation.navigate('CentralDealsManagement')}
      onOpenCrm={() => navigation.navigate('CustomerCrmDirectory')}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Campaigns (`/promotions`)                                                  */
/* -------------------------------------------------------------------------- */

const hubCopy = strings.campaignsHub;
const wizardCopy = strings.campaignWizard;

/** "Not seen for 60+ days": the retention playbook's audience. */
const LAPSED_CRITERIA = { recency: { notVisitedForDays: 60 } };

export function CampaignsHubRoute() {
  const navigation = useBusinessNavigation();
  const promotions = usePromotions();
  const summary = usePromotionSummary();
  const lapsed = useSegmentPreview(LAPSED_CRITERIA);
  const toggle = useTogglePromotion();
  const startDraft = useCampaignDraftStore(state => state.start);
  const updateDraft = useCampaignDraftStore(state => state.update);

  const cards = useMemo(
    () =>
      (promotions.data?.data ?? []).map(promotion => promotionToCampaignCard(promotion)),
    [promotions.data],
  );
  const count = (statuses: string[]) =>
    cards.filter(card => statuses.includes(card.status)).length;
  const totals = summary.data;
  const lapsedCount = lapsed.data?.size ?? 0;

  return (
    <CampaignsHubScreen
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onCreateCampaign={() => {
        startDraft();
        navigation.navigate('CampaignCreateObjective');
      }}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Boost') navigation.navigate('BoostEngine');
        if (tabKey === 'Segments') navigation.navigate('CustomerSegments');
        if (tabKey === 'Insights') navigation.navigate('BusinessPerformanceAnalytics');
      }}
      onPauseCampaign={id => {
        const card = cards.find(candidate => candidate.id === id);
        if (!card) return;
        toggle.mutate(
          { id, pause: card.status === 'live' },
          {
            onError: error =>
              showToast(messageOf(error, hubCopy.live.actionFailed), 'error'),
          },
        );
      }}
      onEditSetup={id => {
        loadDraftIntoWizard(id)
          .then(() => navigation.navigate('CampaignCreateObjective'))
          .catch(error => showToast(messageOf(error, hubCopy.live.loadFailed), 'error'));
      }}
      onOpenRetentionPlaybook={() => {
        // Aim a new campaign at the lapsed cohort the playbook counted.
        startDraft();
        updateDraft({ strategy: 'segments', cohorts: ['dormant'] });
        navigation.navigate('CampaignCreateObjective');
      }}
      campaigns={cards}
      metrics={
        totals
          ? {
              liveBadge: hubCopy.live.liveNowBadge(totals.live),
              reach: totals.audienceReached.toLocaleString('en-NG'),
              reachNote: hubCopy.live.reachNote,
              conversions: totals.claims.toLocaleString('en-NG'),
              conversionsNote: hubCopy.live.conversionsNote(totals.redemptions),
              gmv: formatCampaignNaira(totals.revenue),
              gmvNote: hubCopy.live.gmvNote(formatCampaignNaira(totals.totalSpent)),
            }
          : undefined
      }
      tabs={hubCopy.live.tabs({
        all: cards.length,
        live: count(['live', 'paused']),
        scheduled: count(['scheduled']),
        ended: count(['completed']),
      })}
      upcomingBadge={hubCopy.live.upcomingBadge(count(['scheduled']))}
      playbook={
        lapsedCount > 0
          ? {
              subtitle: hubCopy.live.playbookSubtitle(lapsedCount),
              body: hubCopy.live.playbookBody(lapsedCount),
            }
          : null
      }
      busyIds={toggle.isPending && toggle.variables ? [toggle.variables.id] : []}
      isLoading={promotions.isPending}
      error={
        promotions.isError
          ? messageOf(promotions.error, hubCopy.live.loadFailed)
          : undefined
      }
      onRetry={() => promotions.refetch()}
    />
  );
}

/** "Save as draft" from any wizard step: persist, then back to the hub. */
function useSaveDraftAndExit() {
  const navigation = useBusinessNavigation();
  const save = useSaveCampaignDraft();
  return () =>
    save.mutate(undefined, {
      onSuccess: () => {
        showToast(wizardCopy.liveDraftSaved, 'success');
        navigation.navigate('CampaignsHub');
      },
      onError: error => showToast(messageOf(error, wizardCopy.liveDraftFailed), 'error'),
    });
}

export function CampaignCreateObjectiveRoute() {
  const navigation = useBusinessNavigation();
  const objectiveId = useCampaignDraftStore(state => state.draft.objectiveId);
  const update = useCampaignDraftStore(state => state.update);
  const saveDraft = useSaveDraftAndExit();
  return (
    <CampaignStep1ObjectiveScreen
      onBack={navigation.goBack}
      initialObjectiveId={objectiveId}
      onContinue={id => {
        update({ objectiveId: id });
        navigation.navigate('CampaignCreateContent');
      }}
      onSaveDraft={saveDraft}
    />
  );
}

export function CampaignCreateContentRoute() {
  const navigation = useBusinessNavigation();
  const assets = useEligibleAssets();
  const chosen = useCampaignDraftStore(state => state.draft.assets);
  const update = useCampaignDraftStore(state => state.update);
  const saveDraft = useSaveDraftAndExit();
  const items = useMemo(
    () => (assets.data ?? []).map(eligibleAssetToContentItem),
    [assets.data],
  );

  if (assets.isPending) {
    return (
      <CampaignStep2ContentScreen
        key="loading"
        onBack={navigation.goBack}
        onContinue={() => undefined}
        items={[]}
        initialAssetIds={[]}
        isLoading
      />
    );
  }

  return (
    <CampaignStep2ContentScreen
      key="ready"
      onBack={navigation.goBack}
      items={items}
      initialAssetIds={chosen.map(asset => asset.id)}
      error={
        assets.isError ? messageOf(assets.error, wizardCopy.liveLoadFailed) : undefined
      }
      onRetry={() => assets.refetch()}
      onContinue={ids => {
        update({
          assets: items
            .filter(item => ids.includes(item.id))
            .map(item => ({ type: item.type, id: item.id, title: item.title })),
        });
        navigation.navigate('CampaignCreateAudience');
      }}
      onSaveDraft={saveDraft}
    />
  );
}

export function CampaignCreateAudienceRoute() {
  const navigation = useBusinessNavigation();
  const branches = useBusinessBranches();
  const segments = useSegments();
  const draft = useCampaignDraftStore(state => state.draft);
  const update = useCampaignDraftStore(state => state.update);
  const saveDraft = useSaveDraftAndExit();

  if (branches.isPending) {
    return (
      <BusinessScreenLayout
        header={{ title: wizardCopy.step3.title, onBack: navigation.goBack }}
      >
        <LoadingState />
      </BusinessScreenLayout>
    );
  }

  const outlets = (branches.data ?? []).map(branch => ({
    id: branch.id,
    name: branch.name,
    address: branch.address ?? '',
  }));

  return (
    <CampaignStep3AudienceScreen
      onBack={navigation.goBack}
      live
      branchOptions={outlets}
      segmentOptions={(segments.data ?? []).map(segment => ({
        id: segment.id,
        name: segment.name,
        size: segment.size ?? 0,
      }))}
      initialSelection={{
        strategy: draft.strategy,
        cohorts: draft.cohorts,
        segmentIds: draft.segmentIds,
        branches: draft.branchIds.length
          ? draft.branchIds
          : outlets.map(outlet => outlet.id),
        radius: String(draft.radiusKm),
      }}
      onContinue={selection => {
        update({
          strategy: selection.strategy === 'segments' ? 'segments' : 'nearby',
          cohorts: selection.cohorts,
          segmentIds: selection.segmentIds,
          branchIds: selection.branches,
          radiusKm: Number(selection.radius) || 3,
        });
        navigation.navigate('CampaignCreateSchedule');
      }}
      onSaveDraft={saveDraft}
    />
  );
}

export function CampaignCreateScheduleRoute() {
  const navigation = useBusinessNavigation();
  const draft = useCampaignDraftStore(state => state.draft);
  const update = useCampaignDraftStore(state => state.update);
  const saveDraft = useSaveDraftAndExit();
  return (
    <CampaignStep4ScheduleScreen
      onBack={navigation.goBack}
      live
      initialSelection={{
        durationDays: draft.durationDays,
        instantLaunch: draft.instantLaunch,
        dayparting: draft.dayparting,
        windows: draft.windows,
        weekdays: draft.weekdays,
        autoRenew: draft.autoRenew,
      }}
      onContinue={schedule => {
        update(schedule);
        navigation.navigate('CampaignCreateBudget');
      }}
      onSaveDraft={saveDraft}
    />
  );
}

const TIER_IDS = Object.keys(
  CAMPAIGN_BUDGET_TIERS,
) as (keyof typeof CAMPAIGN_BUDGET_TIERS)[];

export function CampaignCreateBudgetRoute() {
  const navigation = useBusinessNavigation();
  const draft = useCampaignDraftStore(state => state.draft);
  const update = useCampaignDraftStore(state => state.update);
  const saveDraft = useSaveDraftAndExit();
  const wallet = useAdWallet();
  const forecasts = usePromotionForecasts(
    TIER_IDS.map(id => ({
      budget: CAMPAIGN_BUDGET_TIERS[id],
      durationDays: draft.durationDays,
      radiusKm: draft.radiusKm,
    })),
  );

  const tierForecasts = Object.fromEntries(
    TIER_IDS.flatMap((id, index) => {
      const data = forecasts[index]?.data;
      return data
        ? [
            [
              id,
              {
                reach: estimateRange(data.reachMin, data.reachMax),
                claims: estimateRange(data.claimsMin, data.claimsMax),
              },
            ],
          ]
        : [];
    }),
  );

  return (
    <CampaignStep5BudgetScreen
      onBack={navigation.goBack}
      live
      initialDays={draft.durationDays}
      initialSelection={{
        mode: draft.budgetMode,
        total: draft.total,
        funding: draft.funding,
      }}
      walletSpendable={wallet.data?.spendable ?? wallet.data?.balance}
      tierForecasts={tierForecasts}
      onContinue={budget => {
        update({
          budgetMode: budget.mode === 'daily' ? 'daily' : 'total',
          total: budget.total,
          funding: budget.funding === 'card' ? 'card' : 'wallet',
        });
        navigation.navigate('CampaignReviewLaunch');
      }}
      onSaveDraft={saveDraft}
    />
  );
}

export function CampaignReviewLaunchRoute() {
  const navigation = useBusinessNavigation();
  const draft = useCampaignDraftStore(state => state.draft);
  const reset = useCampaignDraftStore(state => state.reset);
  const saveDraft = useSaveDraftAndExit();
  const branches = useBusinessBranches();
  const segments = useSegments();
  const wallet = useAdWallet();
  const launch = useLaunchCampaign();
  const [forecast] = usePromotionForecasts([
    { budget: draft.total, durationDays: draft.durationDays, radiusKm: draft.radiusKm },
  ]);

  const { step3 } = wizardCopy;
  const cohortNames = [
    ...draft.cohorts.map(
      id => step3.cohorts.find(cohort => cohort.id === id)?.name ?? id,
    ),
    ...draft.segmentIds.map(
      id => segments.data?.find(segment => segment.id === id)?.name ?? '',
    ),
  ].filter(Boolean);
  const branchNames = draft.branchIds
    .map(id => branches.data?.find(branch => branch.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const spendable = wallet.data?.spendable ?? wallet.data?.balance ?? 0;
  const fromWallet = Math.min(spendable, draft.total);
  const byCard = draft.funding === 'card' ? Math.max(0, draft.total - spendable) : 0;
  const windowNames = draft.windows
    .map(id => wizardCopy.step4.windows.find(window => window.id === id)?.name)
    .filter(Boolean)
    .join(' & ');

  return (
    <CampaignStep6ReviewScreen
      onBack={navigation.goBack}
      onSaveDraft={saveDraft}
      live
      objectiveId={draft.objectiveId}
      objectiveTitle={objectiveTitle(draft.objectiveId)}
      assetNames={draft.assets.map(asset => asset.title)}
      cohortNames={cohortNames}
      branchNames={branchNames}
      clusterNames={[]}
      audienceSummary={
        draft.strategy === 'segments'
          ? wizardCopy.step6.liveAudience(cohortNames.length, branchNames.length)
          : wizardCopy.step6.liveAudienceNearby
      }
      radiusLabel={wizardCopy.liveRadius(draft.radiusKm)}
      scheduleLabel={wizardCopy.liveSchedule(draft.durationDays, draft.instantLaunch)}
      daypartingLabel={
        draft.dayparting && windowNames ? windowNames : wizardCopy.liveAllDay
      }
      durationDays={draft.durationDays}
      totalLabel={formatCampaignNaira(draft.total)}
      dailyLabel={wizardCopy.liveDaily(
        formatCampaignNaira(Math.round(draft.total / Math.max(1, draft.durationDays))),
      )}
      walletLabel={formatCampaignNaira(fromWallet)}
      cardLabel={wizardCopy.step6.liveCardLabel}
      cardAmountLabel={byCard > 0 ? formatCampaignNaira(byCard) : ''}
      forecast={
        forecast?.data
          ? {
              reach: estimateRange(forecast.data.reachMin, forecast.data.reachMax),
              claims: estimateRange(forecast.data.claimsMin, forecast.data.claimsMax),
            }
          : undefined
      }
      launching={launch.isPending}
      error={
        launch.isError
          ? messageOf(launch.error, wizardCopy.step6.liveLaunchFailed)
          : undefined
      }
      onLaunch={() =>
        launch.mutate(undefined, {
          onSuccess: ({ outcome }) => {
            const message = {
              live: wizardCopy.liveLaunched,
              scheduled: wizardCopy.liveScheduled,
              'awaiting-payment': wizardCopy.liveAwaitingPayment,
              cancelled: wizardCopy.livePaymentCancelled,
            }[outcome];
            showToast(message, outcome === 'cancelled' ? 'error' : 'success');
            reset();
            navigation.replace('CampaignsHub');
          },
        })
      }
    />
  );
}
