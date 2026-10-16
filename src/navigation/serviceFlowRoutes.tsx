import React from 'react';
import { showError } from '@components/shared';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { AddServiceBasicsMediaScreen } from '@features/business/screens/AddServiceBasicsMediaScreen';
import { AddServiceDurationPricingScreen } from '@features/business/screens/AddServiceDurationPricingScreen';
import { AddServiceAvailabilityRulesScreen } from '@features/business/screens/AddServiceAvailabilityRulesScreen';
import { ReviewServiceSummaryScreen } from '@features/business/screens/ReviewServiceSummaryScreen';
import { useActiveBranch } from '@features/business/hooks/useActiveBranch';
import { useMyBusiness } from '@features/business/hooks/useBusinessDashboardData';
import {
  useBusinessBranches,
  usePublishCatalogueItem,
} from '@features/business/hooks/useCatalogueMutations';
import { useCatalogueDraftStore, type ServiceDraft } from '@store/catalogueDraftStore';

/**
 * The Add Service wizard's four steps, shared by the Business Hub and the
 * business-setup wizard (they differ only in where the steps lead). Every step
 * reads and writes the one service draft, and all of them use the business's
 * real branches, name and category: the sample outlets' ids are not ones the
 * API accepts, which is why services created from the hub never saved.
 */

export interface ServiceFlowNavigation {
  goBack: () => void;
  next: (step: 'pricing' | 'availability' | 'review') => void;
  /** After publishing or saving as draft. */
  done: (status: 'active' | 'inactive') => void;
}

const copy = strings.serviceFlow;

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Save the draft as an inactive item. Before the branch step, the service is
 * offered at every branch (the owner narrows it later).
 */
function useSaveServiceDraft(nav: ServiceFlowNavigation) {
  const publish = usePublishCatalogueItem();
  const branches = useBusinessBranches();
  const setService = useCatalogueDraftStore(state => state.setService);
  return (patch: Partial<ServiceDraft>) => {
    setService(patch);
    const { service } = useCatalogueDraftStore.getState();
    if (!service.branchIds.length) {
      const all = (branches.data ?? []).map(branch => branch.id);
      if (!all.length) {
        showError(copy.noBranches);
        return;
      }
      setService({ branchIds: all });
    }
    publish.mutate(
      { kind: 'service', status: 'inactive' },
      {
        onSuccess: () => nav.done('inactive'),
        onError: error => showError(messageOf(error, 'Could not save the draft.')),
      },
    );
  };
}

function useProvider() {
  const business = useMyBusiness();
  const { branches, activeBranchId } = useActiveBranch();
  const { data } = business;
  return {
    provider: data?.name ?? '',
    providerLocation: branches.find(branch => branch.id === activeBranchId)?.name ?? '',
    primaryCategory: data?.category?.name ?? '',
    subCategory: data?.subcategory?.name ?? '',
  };
}

export function ServiceBasicsStep({ nav }: { nav: ServiceFlowNavigation }) {
  const draft = useCatalogueDraftStore(state => state.service);
  const setService = useCatalogueDraftStore(state => state.setService);
  const saveDraft = useSaveServiceDraft(nav);
  const provider = useProvider();
  const toDraft = (
    value: Parameters<
      NonNullable<React.ComponentProps<typeof AddServiceBasicsMediaScreen>['onNext']>
    >[0],
  ): Partial<ServiceDraft> => ({
    name: value.title,
    description: value.description,
    deliveryMode: value.delivery,
    highlights: value.highlights,
    audience: value.audience,
    mainImage: value.mainImage,
    galleryImages: value.galleryImages ?? [],
  });
  return (
    <AddServiceBasicsMediaScreen
      onBack={nav.goBack}
      live={provider}
      initialValue={{
        title: draft.name,
        description: draft.description,
        delivery: draft.deliveryMode || undefined,
        highlights: draft.highlights,
        audience: draft.audience || undefined,
        mainImage: draft.mainImage,
        galleryImages: draft.galleryImages,
      }}
      onNext={value => {
        setService(toDraft(value));
        nav.next('pricing');
      }}
      onSaveDraft={value => saveDraft(toDraft(value))}
    />
  );
}

export function ServicePricingStep({ nav }: { nav: ServiceFlowNavigation }) {
  const draft = useCatalogueDraftStore(state => state.service);
  const setService = useCatalogueDraftStore(state => state.setService);
  const saveDraft = useSaveServiceDraft(nav);
  const toDraft = (
    value: Parameters<
      NonNullable<React.ComponentProps<typeof AddServiceDurationPricingScreen>['onNext']>
    >[0],
  ): Partial<ServiceDraft> => ({
    basePrice: value.basePrice,
    compareAtPrice: value.compareAtPrice,
    duration: value.duration,
    bookingEnabled: value.bookingEnabled,
    tiers: value.tiers,
    bookingRules: {
      ...useCatalogueDraftStore.getState().service.bookingRules,
      ...value.schedule,
    },
  });
  return (
    <AddServiceDurationPricingScreen
      onBack={nav.goBack}
      live
      initialValue={{
        basePrice: draft.basePrice,
        compareAtPrice: draft.compareAtPrice,
        duration: draft.duration,
        bookingEnabled: draft.bookingEnabled,
        tiers: draft.tiers,
        schedule: draft.bookingRules,
      }}
      onNext={value => {
        setService(toDraft(value));
        nav.next('availability');
      }}
      onSaveDraft={value => saveDraft(toDraft(value))}
    />
  );
}

export function ServiceAvailabilityStep({ nav }: { nav: ServiceFlowNavigation }) {
  const draft = useCatalogueDraftStore(state => state.service);
  const setService = useCatalogueDraftStore(state => state.setService);
  const saveDraft = useSaveServiceDraft(nav);
  const branches = useBusinessBranches();
  const toDraft = (
    value: Parameters<
      NonNullable<
        React.ComponentProps<typeof AddServiceAvailabilityRulesScreen>['onNext']
      >
    >[0],
  ): Partial<ServiceDraft> => ({
    branchIds: value.branchIds,
    serviceMode: value.serviceMode,
    isBookable: value.isBookable,
    bookingRules: {
      ...useCatalogueDraftStore.getState().service.bookingRules,
      ...value.rules,
    },
  });

  // Wait for the real branches: the screen picks its initial selection once.
  if (branches.isPending) return <LoadingState />;
  const live = (branches.data ?? []).map(branch => ({
    id: branch.id,
    name: branch.name,
    address: branch.address,
  }));
  const chosen = draft.branchIds.filter(id => live.some(branch => branch.id === id));

  return (
    <AddServiceAvailabilityRulesScreen
      onBack={nav.goBack}
      branches={live}
      initialBranchIds={chosen.length ? chosen : undefined}
      basePrice={draft.basePrice ? `₦${draft.basePrice}` : undefined}
      initialRules={draft.bookingRules}
      onNext={value => {
        setService(toDraft(value));
        nav.next('review');
      }}
      onSaveDraft={value => saveDraft(toDraft(value))}
    />
  );
}

export function ServiceReviewStep({ nav }: { nav: ServiceFlowNavigation }) {
  const draft = useCatalogueDraftStore(state => state.service);
  const publish = usePublishCatalogueItem();
  const provider = useProvider();
  const submit = (status: 'active' | 'inactive') =>
    publish.mutate(
      { kind: 'service', status },
      {
        onSuccess: () => nav.done(status),
        onError: error => showError(messageOf(error, 'Could not publish the service')),
      },
    );
  return (
    <ReviewServiceSummaryScreen
      draft={draft}
      provider={{
        name: provider.provider,
        category: [provider.primaryCategory, provider.subCategory]
          .filter(Boolean)
          .join(' > '),
      }}
      publishing={publish.isPending}
      onBack={nav.goBack}
      onPublish={() => submit('active')}
      onSaveDraft={() => submit('inactive')}
    />
  );
}
