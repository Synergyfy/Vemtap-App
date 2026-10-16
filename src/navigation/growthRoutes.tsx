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
  useSponsoredAction,
  useSponsoredCampaign,
  useSponsoredCampaigns,
  useSponsoredStats,
  useSponsoredOptions,
  useAddSponsoredBudget,
  useTogglePromotion,
  useExportCampaignLedger,
} from '@features/business/hooks/useCampaigns';
import { CampaignPushPreviewSheet } from '@features/business/components/CampaignPushPreviewSheet';
import { statsToPerformanceView } from '@features/business/utils/campaignPerformanceMappers';
import { BoostPerformanceScreen } from '@features/business/screens/BoostPerformanceScreen';
import {
  BOOST_ENGINE_RADIUS_KM,
  BOOST_ENGINE_TIER_DAILY,
  BoostEngineScreen,
  type BoostEngineLive,
  type BoostEngineSelection,
} from '@features/business/screens/BoostEngineScreen';
import { BoostGoalAudienceScreen } from '@features/business/screens/BoostGoalAudienceScreen';
import { BoostBudgetScheduleScreen } from '@features/business/screens/BoostBudgetScheduleScreen';
import { BoostPreviewPaymentScreen } from '@features/business/screens/BoostPreviewPaymentScreen';
import { BoostWalletScreen } from '@features/business/screens/BoostWalletScreen';
import { BoostAssetPickerSheet } from '@features/business/components/BoostAssetPickerSheet';
import {
  useActiveBoost,
  useAdWalletPrepacks,
  useAdWalletTransactions,
  useBoostEligibleAssets,
  useBoostForecasts,
  useBoostSummary,
  useLaunchBoost,
  useSaveBoostDraft,
  useExportWalletStatement,
  useWalletTopUp,
  useSavedCardTopUp,
  useRemoveSavedCard,
  useSetAutoReload,
  useAdWalletInvoices,
  useExportInvoices,
  shareInvoice,
} from '@features/business/hooks/useBoosts';
import { WalletInvoicesSheet } from '@features/business/components/WalletInvoicesSheet';
import { PromptDialog } from '@features/business/components/PromptDialog';
import { WalletActivityFilterSheet } from '@features/business/components/WalletActivityFilterSheet';
import type { AdWalletTransactionType } from '@api/adWalletApi';
import {
  BOOST_AUDIENCE_SCOPE_IDS,
  boostForecastTargeting,
  boostAssetBadge,
  boostDraftToPreviewView,
  eligibleAssetToBoostAsset,
  formatNaira as formatBoostNaira,
  invoiceToRow,
  prepackToCard,
  savedCardExpiry,
  savedCardLabel,
  transactionToRow,
} from '@features/business/utils/boostMappers';
import { useBoostDraftStore } from '@store/boostDraftStore';
import {
  campaignForecastTargeting,
  eligibleAssetToContentItem,
  estimateRange,
  formatNaira as formatCampaignNaira,
  objectiveTitle,
  promotionPushPreview,
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
      criterionOverrides={{
        district: {
          body: segmentCopy.live.builder.districtBody,
          pickerLabel: segmentCopy.live.builder.districtLabel,
        },
      }}
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
  const exportLedger = useExportCampaignLedger();
  const eligible = useEligibleAssets();
  const business = useMyBusiness();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewed = promotions.data?.data.find(promotion => promotion.id === previewId);
  const push = previewed
    ? promotionPushPreview(
        previewed,
        eligible.data?.find(asset => asset.id === previewed.assets[0]?.id),
        business.data?.name ?? '',
      )
    : undefined;

  return (
    <>
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
            .catch(error =>
              showToast(messageOf(error, hubCopy.live.loadFailed), 'error'),
            );
        }}
        onOpenRetentionPlaybook={() => {
          // Aim a new campaign at the lapsed cohort the playbook counted.
          startDraft();
          updateDraft({ strategy: 'segments', cohorts: ['dormant'] });
          navigation.navigate('CampaignCreateObjective');
        }}
        onViewCampaign={id =>
          navigation.navigate('BoostPerformance', { kind: 'promotion', id })
        }
        onPreviewPush={setPreviewId}
        exporting={exportLedger.isPending}
        onExport={() =>
          exportLedger.mutate(undefined, {
            onSuccess: result => {
              if (result.count === 0) showToast(hubCopy.live.ledger.empty, 'error');
            },
            onError: error =>
              showToast(messageOf(error, hubCopy.live.ledger.failed), 'error'),
          })
        }
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
      <CampaignPushPreviewSheet
        visible={previewId !== null}
        onClose={() => setPreviewId(null)}
        push={push}
      />
    </>
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
  const options = useSponsoredOptions('promotion');
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
      districtOptions={options.data?.districts ?? []}
      initialSelection={{
        strategy: draft.strategy,
        cohorts: draft.cohorts,
        segmentIds: draft.segmentIds,
        clusters: draft.districtIds,
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
          districtIds: selection.clusters,
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
      ...campaignForecastTargeting(draft),
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
        saveCard: draft.saveCard,
      }}
      walletSpendable={wallet.data?.spendable ?? wallet.data?.balance}
      savedCard={wallet.data?.card ? savedCardLabel(wallet.data.card, true) : undefined}
      tierForecasts={tierForecasts}
      onContinue={budget => {
        update({
          budgetMode: budget.mode === 'daily' ? 'daily' : 'total',
          total: budget.total,
          funding: budget.funding === 'card' ? 'card' : 'wallet',
          saveCard: Boolean(budget.saveCard),
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
    {
      budget: draft.total,
      durationDays: draft.durationDays,
      radiusKm: draft.radiusKm,
      ...campaignForecastTargeting(draft),
    },
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
      cardLabel={
        wallet.data?.card
          ? savedCardLabel(wallet.data.card, true)
          : wizardCopy.step6.liveCardLabel
      }
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
        launch.mutate(
          { useSavedCard: Boolean(wallet.data?.card) },
          {
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
          },
        )
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Boost / campaign performance                                               */
/* -------------------------------------------------------------------------- */

const perfCopy = strings.boostWizard.performance.live;

export function BoostPerformanceRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'BoostPerformance'>>();
  const kind = route.params?.kind ?? 'boost';
  // No id (e.g. "View history"): show the most recent one of this kind.
  const latest = useSponsoredCampaigns(kind);
  const id = route.params?.id ?? latest.data?.data[0]?.id;
  const record = useSponsoredCampaign(kind, id);
  const stats = useSponsoredStats(kind, id);
  const action = useSponsoredAction(kind);
  const addBudget = useAddSponsoredBudget(kind);
  const wallet = useAdWallet();

  const performance = useMemo(
    () =>
      record.data && stats.data
        ? statsToPerformanceView(kind, record.data, stats.data)
        : undefined,
    [kind, record.data, stats.data],
  );
  const run = (next: 'pause' | 'resume' | 'end') => {
    if (!id) return;
    action.mutate(
      { id, action: next },
      {
        onSuccess: () => {
          if (next !== 'end') return;
          showToast(perfCopy.ended, 'success');
          navigation.navigate('BoostWallet');
        },
        onError: error => showToast(messageOf(error, perfCopy.actionFailed), 'error'),
      },
    );
  };

  const topUp = () => {
    const amount = performance?.addBudgetAmount;
    if (!id || !amount) return;
    addBudget.mutate(
      // A shortfall goes on the saved card when there is one; else the API
      // says how much to top up.
      { id, amount, useSavedCard: Boolean(wallet.data?.card) },
      {
        onSuccess: () =>
          showToast(
            perfCopy.budgetAdded(`\u20a6${amount.toLocaleString('en-NG')}`),
            'success',
          ),
        onError: error => showToast(messageOf(error, perfCopy.actionFailed), 'error'),
      },
    );
  };

  const noneYet = !route.params?.id && latest.isSuccess && !id;
  const loading =
    (!route.params?.id && latest.isLoading) || record.isLoading || stats.isLoading;
  const failed = latest.isError || record.isError || stats.isError;

  return (
    <BoostPerformanceScreen
      onBack={navigation.goBack}
      onShare={() => navigation.navigate('AnalyticsExportReport')}
      onPause={() => run('pause')}
      onResume={() => run('resume')}
      onEndCampaign={() => run('end')}
      onAddBudget={topUp}
      onOpenWallet={() => navigation.navigate('BoostWallet')}
      performance={performance}
      busy={action.isPending || addBudget.isPending}
      isLoading={loading}
      error={
        noneYet
          ? hubCopy.empty.body
          : failed
            ? messageOf(latest.error ?? record.error ?? stats.error, perfCopy.loadFailed)
            : undefined
      }
      onRetry={() => {
        latest.refetch();
        record.refetch();
        stats.refetch();
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Boost wizard (`/boosts`) and the ad wallet                                 */
/* -------------------------------------------------------------------------- */

const engineCopy = strings.boostEngine.live;
const boostCopy = strings.boostWizard.live;
const walletCopy = strings.boostWizard.wallet.live;
const goalCopy = strings.boostWizard.goalStep;

/** Engine radius options in km, for the per-radius reach estimates. */
const ENGINE_RADII = Object.entries(BOOST_ENGINE_RADIUS_KM);
/** Budget-step tiers (₦ total) by id. */
const BUDGET_TIERS = strings.boostWizard.budgetStep.tiers.map(tier => ({
  id: tier.id,
  amount: Number(tier.id) * 1000,
}));

function range(data?: {
  reachMin: number;
  reachMax: number;
  claimsMin: number;
  claimsMax: number;
}) {
  return data
    ? {
        reach: estimateRange(data.reachMin, data.reachMax),
        claims: estimateRange(data.claimsMin, data.claimsMax),
      }
    : undefined;
}

/**
 * The listing a boost features: the one chosen, else the first eligible deal
 * (else the first eligible listing). Also returns the picker's cards.
 */
function useBoostAsset() {
  const assets = useBoostEligibleAssets();
  const chosen = useBoostDraftStore(state => state.draft.asset);
  const update = useBoostDraftStore(state => state.update);
  const items = useMemo(
    () => (assets.data ?? []).map(eligibleAssetToContentItem),
    [assets.data],
  );
  const fallback =
    assets.data?.find(asset => asset.type === 'deal') ?? assets.data?.[0] ?? undefined;
  const asset = chosen ?? (fallback ? eligibleAssetToBoostAsset(fallback) : undefined);
  const pick = (id: string) => {
    const match = assets.data?.find(candidate => candidate.id === id);
    if (match) update({ asset: eligibleAssetToBoostAsset(match) });
  };
  return { assets, items, asset, pick };
}

function useBoostContext() {
  const { branches, activeBranchId, isLive } = useActiveBranch();
  const business = useMyBusiness();
  const branch = branches.find(candidate => candidate.id === activeBranchId);
  return {
    branchId: isLive ? (activeBranchId ?? undefined) : undefined,
    branchName: branch?.name ?? '',
    businessName: business.data?.name ?? '',
  };
}

export function BoostEngineRoute() {
  const navigation = useBusinessNavigation();
  const summary = useBoostSummary();
  const active = useActiveBoost();
  const { assets, items, asset, pick } = useBoostAsset();
  const context = useBoostContext();
  const draft = useBoostDraftStore(state => state.draft);
  const update = useBoostDraftStore(state => state.update);
  const [picking, setPicking] = useState(false);
  const [selection, setSelection] = useState<BoostEngineSelection | null>(null);

  const days = selection?.days ?? 7;
  const total = selection?.total ?? 35_000;
  const radiusKm = selection?.radiusKm ?? 3;
  // The chosen audience narrows every estimate on the engine.
  const audience = selection?.audience ? { audienceType: selection.audience } : {};
  const radiusForecasts = useBoostForecasts(
    ENGINE_RADII.map(([, km]) => ({
      budget: total,
      durationDays: days,
      radiusKm: km,
      ...audience,
    })),
  );
  const tierForecasts = useBoostForecasts(
    Object.entries(BOOST_ENGINE_TIER_DAILY).map(([, daily]) => ({
      budget: daily * days,
      durationDays: days,
      radiusKm,
      ...audience,
    })),
  );
  const [current] = useBoostForecasts([
    { budget: total, durationDays: days, radiusKm, ...audience },
  ]);

  const totals = summary.data;
  const running = active.data;
  const live: BoostEngineLive = {
    activeBanner: running
      ? engineCopy.activeBanner(running.name, running.impressions ?? 0)
      : undefined,
    metrics: [
      {
        label: engineCopy.roiLabel,
        value:
          totals && totals.totalSpent > 0
            ? `${(totals.revenue / totals.totalSpent).toFixed(1)}x`
            : engineCopy.roiNone,
        icon: 'insights',
      },
      {
        label: engineCopy.reachLabel,
        value: (totals?.audienceReached ?? 0).toLocaleString('en-NG'),
        note: engineCopy.reachNote,
        icon: 'group',
      },
      {
        label: engineCopy.claimsLabel,
        value: (totals?.claims ?? 0).toLocaleString('en-NG'),
        note: engineCopy.claimsNote(totals?.redemptions ?? 0),
        icon: 'redeem',
      },
      {
        label: engineCopy.revenueLabel,
        value: formatBoostNaira(totals?.revenue),
        note: engineCopy.revenueNote(formatBoostNaira(totals?.totalSpent)),
        icon: 'payments',
      },
    ],
    asset: asset
      ? {
          name: asset.title,
          now: asset.price ? formatBoostNaira(asset.price) : undefined,
          was:
            asset.wasPrice && asset.price && asset.wasPrice > asset.price
              ? formatBoostNaira(asset.wasPrice)
              : undefined,
          badge: boostAssetBadge(asset),
          note: asset.priorClaims ? engineCopy.priorClaims(asset.priorClaims) : undefined,
        }
      : assets.isPending
        ? { name: '…', badge: '' }
        : null,
    radiusReach: Object.fromEntries(
      ENGINE_RADII.flatMap(([id], index) => {
        const data = range(radiusForecasts[index]?.data);
        return data ? [[id, engineCopy.radiusReach(data.reach)]] : [];
      }),
    ),
    tierClaims: Object.fromEntries(
      Object.keys(BOOST_ENGINE_TIER_DAILY).flatMap((id, index) => {
        const data = range(tierForecasts[index]?.data);
        return data ? [[id, engineCopy.tierClaims(data.claims)]] : [];
      }),
    ),
    estimate: range(current?.data)
      ? engineCopy.estimate(range(current?.data)!.reach)
      : undefined,
    preview: {
      name: asset?.title ?? '',
      branch: [context.businessName, context.branchName].filter(Boolean).join(' • '),
      distance: engineCopy.previewDistance(radiusKm),
    },
  };

  return (
    <>
      <BoostEngineScreen
        onBack={navigation.goBack}
        onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
        onOpenSubTab={tabKey => {
          if (tabKey === 'Campaigns') navigation.navigate('CampaignsHub');
          if (tabKey === 'Segments') navigation.navigate('CustomerSegments');
          if (tabKey === 'Insights') navigation.navigate('BusinessPerformanceAnalytics');
        }}
        onChangeDeal={() => setPicking(true)}
        onSelectionChange={setSelection}
        onLaunch={(_total, chosen) => {
          if (!asset) return;
          update({
            boostId: undefined,
            asset,
            audienceType: chosen.audience || undefined,
            radiusKm: chosen.radiusKm,
            durationDays: chosen.days,
            budget: chosen.total,
          });
          navigation.navigate('BoostGoalAudience');
        }}
        onViewHistory={() => navigation.navigate('BoostPerformance', { kind: 'boost' })}
        live={live}
        initialSelection={{
          radius:
            ENGINE_RADII.find(([, km]) => km === draft.radiusKm)?.[0] ??
            ENGINE_RADII[0][0],
        }}
      />
      <BoostAssetPickerSheet
        visible={picking}
        onClose={() => setPicking(false)}
        items={items}
        selectedId={asset?.id}
        onPick={pick}
        isLoading={assets.isPending}
      />
    </>
  );
}

export function BoostGoalAudienceRoute() {
  const navigation = useBusinessNavigation();
  const { assets, items, asset, pick } = useBoostAsset();
  const context = useBoostContext();
  const draft = useBoostDraftStore(state => state.draft);
  const update = useBoostDraftStore(state => state.update);
  const [picking, setPicking] = useState(false);
  const [radiusKm, setRadiusKm] = useState(draft.radiusKm);
  const options = useSponsoredOptions('boost');
  const districts = options.data?.districts ?? [];
  const clusters = options.data?.clusters ?? [];
  const [pickedAreas, setPickedAreas] = useState(draft.areas);
  const [forecast] = useBoostForecasts([
    {
      budget: draft.budget,
      durationDays: draft.durationDays,
      radiusKm,
      ...(pickedAreas.length ? { clusterIds: pickedAreas.map(area => area.id) } : {}),
      ...(draft.audienceType ? { audienceType: draft.audienceType } : {}),
    },
  ]);
  const reach = range(forecast?.data);
  const scopeIndex = Math.max(
    0,
    BOOST_AUDIENCE_SCOPE_IDS.indexOf(
      draft.audienceScope as (typeof BOOST_AUDIENCE_SCOPE_IDS)[number],
    ),
  );

  return (
    <>
      <BoostGoalAudienceScreen
        onBack={navigation.goBack}
        onHelp={() => navigation.navigate('BusinessSupportHelp')}
        onChangeAsset={() => setPicking(true)}
        initialSelection={{
          goalId: draft.goalId,
          audienceScope: goalCopy.audienceScopes[scopeIndex],
          radiusKm: String(draft.radiusKm),
          placements: draft.placements,
          clusterIds: draft.areas.map(area => area.id),
        }}
        onSelectionChange={selection => {
          setRadiusKm(Number(selection.radiusKm) || 3);
          setPickedAreas(
            [...districts, ...clusters].filter(area =>
              selection.clusterIds.includes(area.id),
            ),
          );
        }}
        live={{
          asset: asset
            ? {
                badge: boostAssetBadge(asset),
                business: context.businessName,
                name: asset.title,
                claims: asset.priorClaims
                  ? boostCopy.assetClaims(asset.priorClaims)
                  : boostCopy.noClaimsYet,
              }
            : null,
          geofencePlace: pickedAreas.length
            ? boostCopy.areasValue(pickedAreas.map(area => area.name))
            : boostCopy.geofencePlace(context.branchName, radiusKm),
          areas: { districts, clusters },
          reach: forecast?.data
            ? {
                value: reach!.reach,
                // Share of the people within the radius the budget can reach.
                percent: forecast.data.audiencePopulation
                  ? Math.min(
                      100,
                      Math.round(
                        (forecast.data.reachMax / forecast.data.audiencePopulation) * 100,
                      ),
                    )
                  : forecast.data.audienceCapped
                    ? 100
                    : 0,
              }
            : undefined,
        }}
        onContinue={selection => {
          if (!asset) {
            showToast(boostCopy.pickAssetFirst, 'error');
            return;
          }
          const index = goalCopy.audienceScopes.indexOf(
            selection.audienceScope as (typeof goalCopy.audienceScopes)[number],
          );
          const audienceScope = BOOST_AUDIENCE_SCOPE_IDS[Math.max(0, index)];
          update({
            asset,
            goalId: selection.goalId,
            audienceScope,
            areas:
              audienceScope === 'nearby'
                ? []
                : [...districts, ...clusters]
                    .filter(area => selection.clusterIds.includes(area.id))
                    .map(area => ({ id: area.id, name: area.name })),
            radiusKm: Number(selection.radiusKm) || 3,
            placements: selection.placements,
          });
          navigation.navigate('BoostBudgetSchedule');
        }}
      />
      <BoostAssetPickerSheet
        visible={picking}
        onClose={() => setPicking(false)}
        items={items}
        selectedId={asset?.id}
        onPick={pick}
        isLoading={assets.isPending}
      />
    </>
  );
}

export function BoostBudgetScheduleRoute() {
  const navigation = useBusinessNavigation();
  const draft = useBoostDraftStore(state => state.draft);
  const update = useBoostDraftStore(state => state.update);
  const [selection, setSelection] = useState({
    budget: draft.budget,
    days: draft.durationDays,
  });
  const tierForecasts = useBoostForecasts(
    BUDGET_TIERS.map(tier => ({
      budget: tier.amount,
      durationDays: selection.days,
      radiusKm: draft.radiusKm,
      ...boostForecastTargeting(draft),
    })),
  );
  const [current] = useBoostForecasts([
    {
      budget: selection.budget,
      durationDays: selection.days,
      radiusKm: draft.radiusKm,
      ...boostForecastTargeting(draft),
    },
  ]);
  const estimate = current?.data;
  const price = draft.asset?.price ?? undefined;
  const goalTitle =
    goalCopy.goals.find(goal => goal.id === draft.goalId)?.title ?? draft.goalId;

  return (
    <BoostBudgetScheduleScreen
      onBack={navigation.goBack}
      initialSelection={{
        budget: draft.budget,
        days: draft.durationDays,
        dayparting: draft.dayparting,
      }}
      onSelectionChange={next => setSelection({ budget: next.budget, days: next.days })}
      live={{
        assetName: draft.asset?.title ?? boostCopy.untitled,
        assetGoal: boostCopy.assetGoal(goalTitle),
        tierForecasts: Object.fromEntries(
          BUDGET_TIERS.flatMap((tier, index) => {
            const data = range(tierForecasts[index]?.data);
            return data ? [[tier.id, data]] : [];
          }),
        ),
        forecast: estimate
          ? {
              reach: estimateRange(estimate.reachMin, estimate.reachMax),
              claims: estimateRange(estimate.claimsMin, estimate.claimsMax),
              // Attributable sales only make sense for a priced listing.
              revenue: price
                ? `${formatBoostNaira(estimate.claimsMin * price)} – ${formatBoostNaira(estimate.claimsMax * price)}`
                : undefined,
              revenueMeta: price
                ? boostCopy.revenueMeta(formatBoostNaira(price))
                : undefined,
            }
          : undefined,
      }}
      onContinue={next => {
        update({
          budget: next.budget,
          durationDays: next.days,
          dayparting: next.dayparting,
        });
        navigation.navigate('BoostPreviewPayment');
      }}
    />
  );
}

export function BoostPreviewPaymentRoute() {
  const navigation = useBusinessNavigation();
  const draft = useBoostDraftStore(state => state.draft);
  const update = useBoostDraftStore(state => state.update);
  const reset = useBoostDraftStore(state => state.reset);
  const context = useBoostContext();
  const wallet = useAdWallet();
  const launch = useLaunchBoost(context.branchId);
  const save = useSaveBoostDraft(context.branchId);

  const preview = useMemo(
    () =>
      boostDraftToPreviewView(draft, {
        businessName: context.businessName,
        branchName: context.branchName,
        walletSpendable: wallet.data?.spendable,
        savedCard: wallet.data?.card ? savedCardLabel(wallet.data.card, true) : undefined,
      }),
    [
      draft,
      context.businessName,
      context.branchName,
      wallet.data?.spendable,
      wallet.data?.card,
    ],
  );

  return (
    <BoostPreviewPaymentScreen
      onBack={navigation.goBack}
      onEditParameters={() => navigation.navigate('BoostGoalAudience')}
      onOpenWallet={() => navigation.navigate('BoostWallet')}
      preview={preview}
      initialMethod={draft.funding}
      launching={launch.isPending}
      error={launch.isError ? messageOf(launch.error, boostCopy.launchFailed) : undefined}
      onSaveDraft={() =>
        save.mutate(undefined, {
          onSuccess: () => {
            showToast(boostCopy.draftSaved, 'success');
            navigation.navigate('BoostEngine');
          },
          onError: error => showToast(messageOf(error, boostCopy.draftFailed), 'error'),
        })
      }
      onLaunch={method => {
        update({ funding: method === 'card' ? 'card' : 'wallet' });
        launch.mutate(
          { useSavedCard: Boolean(wallet.data?.card) },
          {
            onSuccess: ({ promotion, outcome }) => {
              const message = {
                live: boostCopy.launched,
                scheduled: boostCopy.scheduled,
                'awaiting-payment': boostCopy.awaitingPayment,
                cancelled: boostCopy.paymentCancelled,
              }[outcome];
              showToast(message, outcome === 'cancelled' ? 'error' : 'success');
              reset();
              navigation.replace('BoostPerformance', { kind: 'boost', id: promotion.id });
            },
          },
        );
      }}
    />
  );
}

const WALLET_PAGE = 20;

export function BoostWalletRoute() {
  const navigation = useBusinessNavigation();
  const wallet = useAdWallet();
  const prepacks = useAdWalletPrepacks();
  const [limit, setLimit] = useState(WALLET_PAGE);
  const [filter, setFilter] = useState<AdWalletTransactionType | undefined>();
  const [filtering, setFiltering] = useState(false);
  const [removingCard, setRemovingCard] = useState(false);
  const [editingReload, setEditingReload] = useState(false);
  const [reloadError, setReloadError] = useState<string | null>(null);
  const [invoicesOpen, setInvoicesOpen] = useState(false);
  const [invoiceLimit, setInvoiceLimit] = useState(WALLET_PAGE);
  const transactions = useAdWalletTransactions(limit, filter);
  const topUp = useWalletTopUp();
  const savedCardTopUp = useSavedCardTopUp();
  const removeCard = useRemoveSavedCard();
  const setAutoReload = useSetAutoReload();
  const invoices = useAdWalletInvoices(invoiceLimit, invoicesOpen);
  const exportInvoices = useExportInvoices();
  const statement = useExportWalletStatement();
  const { data } = wallet;
  const filterLabel = walletCopy.filter.options.find(
    option => option.id === filter,
  )?.label;
  // `undefined` = a server without saved cards: those sections stay hidden.
  const card = data?.card === undefined ? undefined : (data.card ?? null);
  const reload = data?.autoReload;
  const reloadAmount = reload?.amount || walletCopy.autoReload.defaultAmount;
  const reloadThreshold = reload?.threshold ?? walletCopy.autoReload.defaultThreshold;

  const saveReload = (
    next: { enabled: boolean; threshold: number; amount: number },
    onDone?: () => void,
  ) =>
    setAutoReload.mutate(next, {
      onSuccess: () => {
        onDone?.();
        showToast(walletCopy.autoReload.saved, 'success');
      },
      onError: error => {
        const message = messageOf(error, walletCopy.autoReload.failed);
        if (onDone) setReloadError(message);
        else showToast(message, 'error');
      },
    });

  const checkoutTopUp = (
    input: { prepackId?: string; amount?: number },
    saveCard: boolean,
  ) =>
    topUp.mutate(
      { ...input, ...(saveCard && { saveCard: true }) },
      {
        onSuccess: ({ outcome }) =>
          showToast(
            {
              completed: walletCopy.topUpDone,
              pending: walletCopy.topUpPending,
              cancelled: walletCopy.topUpCancelled,
            }[outcome],
            outcome === 'cancelled' ? 'error' : 'success',
          ),
        onError: error => showToast(messageOf(error, walletCopy.topUpFailed), 'error'),
      },
    );

  return (
    <>
      <BoostWalletScreen
        onBack={navigation.goBack}
        onViewLedger={() => setLimit(current => Math.min(100, current + WALLET_PAGE))}
        onFilterHistory={() => setFiltering(true)}
        activeFilterLabel={filterLabel}
        statementPending={statement.isPending}
        onStatement={() =>
          statement.mutate(undefined, {
            onSuccess: result => {
              if (result.count === 0) showToast(walletCopy.statement.empty, 'error');
            },
            onError: error =>
              showToast(messageOf(error, walletCopy.statement.failed), 'error'),
          })
        }
        onTopUp={(prepackId, amount, options) => {
          const input = amount !== undefined ? { amount } : { prepackId };
          if (card && !options?.newCard) {
            savedCardTopUp.mutate(input, {
              onSuccess: result =>
                result.status === 'completed'
                  ? showToast(walletCopy.topUpDone, 'success')
                  : showToast(walletCopy.card.declined, 'error'),
              onError: error =>
                showToast(messageOf(error, walletCopy.topUpFailed), 'error'),
            });
            return;
          }
          checkoutTopUp(input, Boolean(options?.saveCard));
        }}
        onRemoveCard={() => setRemovingCard(true)}
        onToggleAutoReload={enabled =>
          saveReload({ enabled, threshold: reloadThreshold, amount: reloadAmount })
        }
        onEditAutoReload={() => {
          setReloadError(null);
          setEditingReload(true);
        }}
        onTaxInvoices={() => setInvoicesOpen(true)}
        live={
          data
            ? {
                walletRef: data.walletRef,
                balance: formatBoostNaira(data.balance),
                reserved: formatBoostNaira(data.reserved),
                spendable: formatBoostNaira(data.spendable),
                prepacks: (prepacks.data ?? []).map(prepackToCard),
                transactions: (transactions.data?.data ?? []).map(transactionToRow),
                hasMore: Boolean(transactions.data?.hasNextPage) && limit < 100,
                minTopUp: 2000,
                card:
                  card === undefined
                    ? undefined
                    : card && {
                        label: savedCardLabel(card),
                        expiry: savedCardExpiry(card),
                      },
                autoReload:
                  card === undefined
                    ? undefined
                    : {
                        enabled: Boolean(card && reload?.enabled),
                        body: walletCopy.autoReload.body(
                          formatBoostNaira(reloadAmount),
                          formatBoostNaira(reloadThreshold),
                        ),
                        error: reload?.lastError ?? undefined,
                      },
              }
            : undefined
        }
        topUpPending={topUp.isPending || savedCardTopUp.isPending}
        isLoading={wallet.isLoading}
        error={
          wallet.isError ? messageOf(wallet.error, walletCopy.loadFailed) : undefined
        }
        onRetry={() => wallet.refetch()}
      />
      <WalletActivityFilterSheet
        visible={filtering}
        onClose={() => setFiltering(false)}
        value={filter}
        onChange={next => {
          setFilter(next);
          setLimit(WALLET_PAGE);
        }}
      />
      <PromptDialog
        visible={removingCard}
        title={walletCopy.card.removeTitle}
        fields={[]}
        confirmLabel={walletCopy.card.removeConfirm}
        confirmVariant="destructive"
        onCancel={() => setRemovingCard(false)}
        onConfirm={() => {
          setRemovingCard(false);
          removeCard.mutate(undefined, {
            onSuccess: () => showToast(walletCopy.card.removed, 'success'),
            onError: error =>
              showToast(messageOf(error, walletCopy.card.removeFailed), 'error'),
          });
        }}
      />
      <PromptDialog
        visible={editingReload}
        title={walletCopy.autoReload.dialogTitle}
        fields={[
          {
            key: 'amount',
            label: walletCopy.autoReload.amountLabel,
            value: String(reloadAmount),
            keyboardType: 'numeric',
          },
          {
            key: 'threshold',
            label: walletCopy.autoReload.thresholdLabel,
            value: String(reloadThreshold),
            keyboardType: 'numeric',
          },
        ]}
        confirmLabel={walletCopy.autoReload.save}
        error={reloadError}
        onChangeField={() => setReloadError(null)}
        onCancel={() => setEditingReload(false)}
        onConfirm={values => {
          const amount = Number(values.amount.replace(/[^0-9.]/g, ''));
          const threshold = Number(values.threshold.replace(/[^0-9.]/g, ''));
          if (
            !values.amount.trim() ||
            !values.threshold.trim() ||
            !(amount >= 2000) ||
            !(threshold >= 0)
          ) {
            setReloadError(walletCopy.autoReload.invalid);
            return;
          }
          saveReload({ enabled: true, threshold, amount }, () => setEditingReload(false));
        }}
      />
      <WalletInvoicesSheet
        visible={invoicesOpen}
        onClose={() => setInvoicesOpen(false)}
        invoices={(invoices.data?.data ?? []).map(invoiceToRow)}
        isLoading={invoices.isLoading}
        error={
          invoices.isError
            ? messageOf(invoices.error, walletCopy.invoices.loadFailed)
            : undefined
        }
        onRetry={() => invoices.refetch()}
        hasMore={Boolean(invoices.data?.hasNextPage) && invoiceLimit < 100}
        onLoadMore={() =>
          setInvoiceLimit(current => Math.min(100, current + WALLET_PAGE))
        }
        onShare={id => {
          const invoice = invoices.data?.data.find(entry => entry.id === id);
          if (!invoice) return;
          shareInvoice(invoice).catch(() =>
            showToast(walletCopy.invoices.shareFailed, 'error'),
          );
        }}
        exportPending={exportInvoices.isPending}
        onExport={() =>
          exportInvoices.mutate(undefined, {
            onError: error =>
              showToast(messageOf(error, walletCopy.invoices.exportFailed), 'error'),
          })
        }
      />
    </>
  );
}
