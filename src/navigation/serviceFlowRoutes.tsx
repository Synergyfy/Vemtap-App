import React, { useEffect, useState } from 'react';
import { showError, showSuccess } from '@components/shared';
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
  useItemBranchPricing,
  usePublishCatalogueItem,
  useUpdateServiceBookingRules,
} from '@features/business/hooks/useCatalogueMutations';
import type { BookingRules } from '@api/catalogueApi';
import { ServiceBookingRulesSheet } from '@features/business/components/ServiceBookingRulesSheet';
import { ServiceBlockoutsSheet } from '@features/business/components/ServiceBlockoutsSheet';
import {
  LocationScheduleSheet,
  type WeeklyHours,
} from '@features/business/components/LocationScheduleSheet';
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

/** The pricing step's defaults: Monday–Saturday, 09:00–18:00. */
const DEFAULT_SERVICE_DAYS = [1, 2, 3, 4, 5, 6];
const DEFAULT_SERVICE_HOURS = { from: '09:00', to: '18:00' };

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
    pricingMode: value.pricingMode,
    branchPrices: value.branchPrices,
    // Kept apart from `rules` so an empty list clears earlier overrides.
    bookingRules: {
      ...useCatalogueDraftStore.getState().service.bookingRules,
      ...value.rules,
      branchSchedules: value.branchSchedules.length ? value.branchSchedules : undefined,
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
      initialPricingMode={draft.pricingMode}
      initialBranchPrices={draft.branchPrices}
      serviceSchedule={{
        days: draft.bookingRules?.days ?? DEFAULT_SERVICE_DAYS,
        from: draft.bookingRules?.from ?? DEFAULT_SERVICE_HOURS.from,
        to: draft.bookingRules?.to ?? DEFAULT_SERVICE_HOURS.to,
      }}
      initialBranchSchedules={draft.bookingRules?.branchSchedules?.map(entry => ({
        branchId: entry.branchId,
        days: entry.days ?? draft.bookingRules?.days ?? DEFAULT_SERVICE_DAYS,
        from: entry.from ?? draft.bookingRules?.from ?? DEFAULT_SERVICE_HOURS.from,
        to: entry.to ?? draft.bookingRules?.to ?? DEFAULT_SERVICE_HOURS.to,
      }))}
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

type RulesView = 'menu' | 'weekly' | 'blockouts' | { id: string; name: string } | null;

export interface ServiceBookingRulesFlowProps {
  /** The service whose rules are edited; `null` = closed. */
  service: { id: string; name: string; bookingRules?: BookingRules | null } | null;
  onClose: () => void;
}

/**
 * Booking Rules for an existing service, from Services & Categories: a menu
 * sheet, then one editor at a time (weekly schedule, blocked dates, a
 * branch's schedule). Each save PATCHes the merged rules and returns to the
 * menu.
 */
export function ServiceBookingRulesFlow({
  service,
  onClose,
}: ServiceBookingRulesFlowProps) {
  const [view, setView] = useState<RulesView>(null);
  const [rules, setRules] = useState<BookingRules>({});
  const branches = useItemBranchPricing(service?.id);
  const save = useUpdateServiceBookingRules();

  useEffect(() => {
    setView(service ? 'menu' : null);
    setRules(service?.bookingRules ?? {});
  }, [service]);

  if (!service) return null;
  const sheetCopy = copy.bookingRulesSheet;
  const weekly: WeeklyHours = {
    days: rules.days ?? DEFAULT_SERVICE_DAYS,
    from: rules.from ?? DEFAULT_SERVICE_HOURS.from,
    to: rules.to ?? DEFAULT_SERVICE_HOURS.to,
  };
  const close = () => {
    setView(null);
    onClose();
  };
  const persist = (next: BookingRules) => {
    setRules(next);
    save.mutate(
      { itemId: service.id, rules: next },
      {
        onSuccess: () => {
          showSuccess(sheetCopy.saved);
          setView('menu');
        },
        onError: error => {
          showError(messageOf(error, sheetCopy.failed));
          setView('menu');
        },
      },
    );
  };
  const branch = typeof view === 'object' ? view : null;
  const ownSchedule = branch
    ? rules.branchSchedules?.find(entry => entry.branchId === branch.id)
    : undefined;

  return (
    <>
      <ServiceBookingRulesSheet
        visible={view === 'menu'}
        onClose={close}
        serviceName={service.name}
        rules={rules}
        branches={branches.data?.branches
          .filter(row => row.isAvailable)
          .map(row => ({ id: row.branchId, name: row.branchName }))}
        onEditWeekly={() => setView('weekly')}
        onEditBlockouts={() => setView('blockouts')}
        onEditBranch={next => setView(next)}
      />
      <LocationScheduleSheet
        visible={view === 'weekly'}
        onClose={() => setView('menu')}
        branchName={service.name}
        title={sheetCopy.weeklyTitle}
        alwaysCustom
        serviceSchedule={weekly}
        value={weekly}
        onSave={next => next && persist({ ...rules, ...next })}
      />
      <ServiceBlockoutsSheet
        visible={view === 'blockouts'}
        onClose={() => setView('menu')}
        value={rules.blockouts ?? []}
        onSave={next => persist({ ...rules, blockouts: next })}
      />
      <LocationScheduleSheet
        visible={branch !== null}
        onClose={() => setView('menu')}
        branchName={branch?.name ?? ''}
        serviceSchedule={weekly}
        value={
          ownSchedule
            ? {
                days: ownSchedule.days ?? weekly.days,
                from: ownSchedule.from ?? weekly.from,
                to: ownSchedule.to ?? weekly.to,
              }
            : undefined
        }
        onSave={next => {
          if (!branch) return;
          const others = (rules.branchSchedules ?? []).filter(
            entry => entry.branchId !== branch.id,
          );
          const branchSchedules = next
            ? [...others, { branchId: branch.id, ...next }]
            : others;
          persist({
            ...rules,
            branchSchedules: branchSchedules.length ? branchSchedules : undefined,
          });
        }}
      />
    </>
  );
}
