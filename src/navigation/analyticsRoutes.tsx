import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { strings } from '@constants/strings';
import { useAuthStore } from '@store/authStore';
import {
  useAnalyticsFilterStore,
  type AnalyticsPreset,
} from '@store/analyticsFilterStore';
import { ApiError } from '@api/ApiError';
import type { AnalyticsExportModule } from '@api/businessAnalyticsApi';
import {
  useMyBusiness,
  toBranchList,
} from '@features/business/hooks/useBusinessDashboardData';
import {
  useAnalyticsCustomers,
  useAnalyticsDeals,
  useAnalyticsLocations,
  useAnalyticsOverview,
  useAnalyticsPos,
  useAnalyticsQuery,
  useExportAnalytics,
} from '@features/business/hooks/useBusinessAnalytics';
import { useActiveBoost } from '@features/business/hooks/useBoosts';
import {
  labelForPreset,
  presetForLabel,
  rangeDays,
  rangeLabel,
  count,
  toBranchComparisonView,
  toBusinessOverviewView,
  toCustomerIntelligenceView,
  toCustomersAnalyticsView,
  toDealsAnalyticsView,
  toLocationsAnalyticsView,
  toPerformanceView,
  toPosAnalyticsView,
} from '@features/business/utils/analyticsMappers';
import { shareBase64File } from '@utils/csvExport';
import { AnalyticsFilterSettingsSheet } from '@features/business/screens/AnalyticsFilterSettingsSheet';
import { BusinessAnalyticsPerformanceScreen } from '@features/business/screens/BusinessAnalyticsPerformanceScreen';
import { BusinessAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/BusinessAnalyticsVemtapIntelligenceScreen';
import { CustomerIntelligenceAnalyticsScreen } from '@features/business/screens/CustomerIntelligenceAnalyticsScreen';
import { CustomersAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/CustomersAnalyticsVemtapIntelligenceScreen';
import { DealsAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/DealsAnalyticsVemtapIntelligenceScreen';
import {
  ExportAnalyticsReportScreen,
  type ExportAnalyticsReportPayload,
} from '@features/business/screens/ExportAnalyticsReportScreen';
import { LocationsAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/LocationsAnalyticsVemtapIntelligenceScreen';
import { LocationsBranchComparisonScreen } from '@features/business/screens/LocationsBranchComparisonScreen';
import { PosAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/PosAnalyticsVemtapIntelligenceScreen';
import { useBusinessNavigation } from './useBusinessNavigation';

/**
 * Analytics routes. Every surface reads the same window from
 * `analyticsFilterStore`, so the period and branch follow the owner from the
 * Business view to Customers, Deals, Locations and POS.
 */

const surfaceRoute: Record<string, string> = {
  business: 'BusinessAnalytics',
  customers: 'CustomersAnalytics',
  deals: 'DealsAnalytics',
  locations: 'LocationsAnalytics',
  pos: 'PosAnalytics',
};

/** The shared window, the range chip handlers and the filter sheet. */
function useAnalyticsWindow(options: readonly string[]) {
  const preset = useAnalyticsFilterStore(state => state.preset);
  const customFrom = useAnalyticsFilterStore(state => state.customFrom);
  const customTo = useAnalyticsFilterStore(state => state.customTo);
  const branchId = useAnalyticsFilterStore(state => state.branchId);
  const apply = useAnalyticsFilterStore(state => state.apply);
  const setPreset = useAnalyticsFilterStore(state => state.setPreset);
  const query = useAnalyticsQuery();
  const [filterOpen, setFilterOpen] = useState(false);
  const myBusiness = useMyBusiness();
  const branches = useMemo(() => toBranchList(myBusiness.data), [myBusiness.data]);

  const value = useMemo(
    () => ({ preset, customFrom, customTo, branchId }),
    [preset, customFrom, customTo, branchId],
  );

  return {
    query,
    branchId,
    branches,
    range: labelForPreset(preset, options),
    onRangeChange: (label: string) => {
      const next = presetForLabel(label);
      if (next === 'custom') setFilterOpen(true);
      else if (next) setPreset(next as AnalyticsPreset);
    },
    selectBranch: (id: string | null) => apply({ preset, branchId: id }),
    openFilters: () => setFilterOpen(true),
    sheet: (
      <AnalyticsFilterSettingsSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={value}
        branches={branches}
        onApply={selection => apply(selection)}
      />
    ),
  };
}

function useSurfaceNavigation() {
  const navigation = useBusinessNavigation();
  return {
    navigation,
    onTabChange: (key: string) => {
      const route = surfaceRoute[key];
      if (route) navigation.navigate(route as never);
    },
    onExport: () => navigation.navigate('AnalyticsExportReport'),
  };
}

export function BusinessAnalyticsRoute() {
  const { navigation, onTabChange, onExport } = useSurfaceNavigation();
  const window = useAnalyticsWindow(strings.businessIntelligence.dateRanges);
  const overview = useAnalyticsOverview(window.query);
  const view = useMemo(
    () => (overview.data ? toBusinessOverviewView(overview.data) : undefined),
    [overview.data],
  );
  return (
    <View className="flex-1">
      <BusinessAnalyticsVemtapIntelligenceScreen
        view={view}
        isError={overview.isError}
        onRetry={() => void overview.refetch()}
        range={window.range}
        onRangeChange={window.onRangeChange}
        onBack={navigation.goBack}
        onOpenFilters={window.openFilters}
        onExport={onExport}
        onTabChange={onTabChange}
        onOpenHub={() => navigation.navigate('BusinessMoreHubOperations')}
      />
      {window.sheet}
    </View>
  );
}

export function CustomersAnalyticsRoute() {
  const { navigation, onTabChange, onExport } = useSurfaceNavigation();
  const window = useAnalyticsWindow(strings.businessIntelligence.dateRanges);
  const customers = useAnalyticsCustomers(window.query);
  const view = useMemo(
    () => (customers.data ? toCustomersAnalyticsView(customers.data) : undefined),
    [customers.data],
  );
  return (
    <View className="flex-1">
      <CustomersAnalyticsVemtapIntelligenceScreen
        view={view}
        isError={customers.isError}
        onRetry={() => void customers.refetch()}
        range={window.range}
        onRangeChange={window.onRangeChange}
        onBack={navigation.goBack}
        onOpenFilters={window.openFilters}
        onExport={onExport}
        onTabChange={onTabChange}
        onReengage={() => navigation.navigate('CustomerSegments')}
        onOpenSegment={() => navigation.navigate('CustomerSegments')}
      />
      {window.sheet}
    </View>
  );
}

export function DealsAnalyticsRoute() {
  const { navigation, onTabChange, onExport } = useSurfaceNavigation();
  const window = useAnalyticsWindow(strings.businessIntelligence.dateRanges);
  const deals = useAnalyticsDeals(window.query);
  const boost = useActiveBoost();
  const view = useMemo(
    () => (deals.data ? toDealsAnalyticsView(deals.data, boost.data) : undefined),
    [deals.data, boost.data],
  );
  return (
    <View className="flex-1">
      <DealsAnalyticsVemtapIntelligenceScreen
        view={view}
        isError={deals.isError}
        onRetry={() => void deals.refetch()}
        range={window.range}
        onRangeChange={window.onRangeChange}
        onBack={navigation.goBack}
        onOpenFilters={window.openFilters}
        onExport={onExport}
        onTabChange={onTabChange}
        onOpenDeal={dealGroupId =>
          navigation.navigate('DealDetailsPerformance', { dealGroupId })
        }
        onOpenBoost={() => navigation.navigate('BoostEngine')}
      />
      {window.sheet}
    </View>
  );
}

export function LocationsAnalyticsRoute() {
  const { navigation, onTabChange, onExport } = useSurfaceNavigation();
  const window = useAnalyticsWindow(strings.businessIntelligence.dateRanges);
  // The scope chips list every branch, so the comparison itself is unscoped;
  // a chosen branch narrows the figures through the shared window.
  const locations = useAnalyticsLocations(window.query);
  const view = useMemo(
    () => (locations.data ? toLocationsAnalyticsView(locations.data) : undefined),
    [locations.data],
  );
  const scopes = useMemo(
    () =>
      view && window.branches.length > 1
        ? [
            view.scopes[0],
            ...window.branches.map(branch => ({ id: branch.id, label: branch.name })),
          ]
        : (view?.scopes ?? []),
    [view, window.branches],
  );
  return (
    <View className="flex-1">
      <LocationsAnalyticsVemtapIntelligenceScreen
        view={view ? { ...view, scopes } : undefined}
        isError={locations.isError}
        onRetry={() => void locations.refetch()}
        range={window.range}
        branchId={window.branchId}
        onSelectBranch={window.selectBranch}
        onRangeChange={window.onRangeChange}
        onBack={navigation.goBack}
        onOpenFilters={window.openFilters}
        onExport={onExport}
        onTabChange={onTabChange}
        onOpenBranch={branchId => navigation.navigate('WuseBranchDetails', { branchId })}
        onManageLocations={() => navigation.navigate('LocationsBranches')}
        onBoostBranch={() => navigation.navigate('BoostEngine')}
      />
      {window.sheet}
    </View>
  );
}

export function PosAnalyticsRoute() {
  const { navigation, onTabChange, onExport } = useSurfaceNavigation();
  const window = useAnalyticsWindow(strings.businessIntelligence.dateRanges);
  const pos = useAnalyticsPos(window.query);
  const view = useMemo(
    () => (pos.data ? toPosAnalyticsView(pos.data) : undefined),
    [pos.data],
  );
  return (
    <View className="flex-1">
      <PosAnalyticsVemtapIntelligenceScreen
        view={view}
        isError={pos.isError}
        onRetry={() => void pos.refetch()}
        range={window.range}
        onRangeChange={window.onRangeChange}
        onBack={navigation.goBack}
        onOpenFilters={window.openFilters}
        onExport={onExport}
        onTabChange={onTabChange}
        onOpenTillLedger={() => navigation.navigate('PosTransactionsLedgerShift')}
        onOpenItem={() => navigation.navigate('PosProductsInventory')}
      />
      {window.sheet}
    </View>
  );
}

export function BusinessPerformanceAnalyticsRoute() {
  const navigation = useBusinessNavigation();
  const window = useAnalyticsWindow(strings.businessAnalyticsPerformance.dateRanges);
  const overview = useAnalyticsOverview(window.query);
  const view = useMemo(
    () => (overview.data ? toPerformanceView(overview.data) : undefined),
    [overview.data],
  );
  return (
    <View className="flex-1">
      <BusinessAnalyticsPerformanceScreen
        view={view}
        isError={overview.isError}
        onRetry={() => void overview.refetch()}
        range={window.range}
        onRangeChange={window.onRangeChange}
        onBack={navigation.goBack}
        onMoreOptions={window.openFilters}
        onOpenTab={tabKey => {
          if (tabKey === 'customers') navigation.navigate('BusinessCustomerIntelligence');
          else if (tabKey === 'locations') navigation.navigate('BranchComparison');
          else if (tabKey === 'deals') navigation.navigate('DealsAnalytics');
          else if (tabKey === 'pos') navigation.navigate('PosAnalytics');
        }}
        onSwitchReport={() => navigation.navigate('BusinessAnalytics')}
        onOpenItem={() => navigation.navigate('CentralCatalogue')}
        onOpenStaff={() => navigation.navigate('StaffDirectory')}
      />
      {window.sheet}
    </View>
  );
}

export function BusinessCustomerIntelligenceRoute() {
  const navigation = useBusinessNavigation();
  const window = useAnalyticsWindow(strings.customerIntelligenceAnalytics.dateRanges);
  const firstName = useAuthStore(state => state.user?.firstName ?? '');
  const customers = useAnalyticsCustomers(window.query);
  const view = useMemo(
    () => (customers.data ? toCustomerIntelligenceView(customers.data) : undefined),
    [customers.data],
  );
  return (
    <View className="flex-1">
      <CustomerIntelligenceAnalyticsScreen
        view={view}
        isError={customers.isError}
        onRetry={() => void customers.refetch()}
        ownerName={firstName}
        range={window.range}
        onRangeChange={window.onRangeChange}
        onBack={navigation.goBack}
        onMoreOptions={window.openFilters}
        onOpenSegment={() => navigation.navigate('CustomerSegments')}
        onOpenCustomer={() => navigation.navigate('CustomerCrmDirectory')}
        onViewAllCustomers={() => navigation.navigate('CustomerCrmDirectory')}
        onOpenLoyalty={() => navigation.navigate('LoyaltyProgramme')}
        onCreateDeal={() => navigation.navigate('CreateDealLocationAssignment')}
        onExport={() => navigation.navigate('AnalyticsExportReport')}
        onOpenLoyaltyProgramme={() => navigation.navigate('LoyaltyProgramme')}
        onOpenDeals={() => navigation.navigate('CentralDealsManagement')}
        onOpenFeedback={() => navigation.navigate('BusinessReviewsReputation')}
      />
      {window.sheet}
    </View>
  );
}

export function BranchComparisonRoute() {
  const navigation = useBusinessNavigation();
  const window = useAnalyticsWindow(strings.locationsBranchComparison.dateRanges);
  // A comparison is across branches, so it ignores the branch filter.
  const query = useMemo(
    () => ({ from: window.query.from, to: window.query.to }),
    [window.query.from, window.query.to],
  );
  const locations = useAnalyticsLocations(query);
  const view = useMemo(
    () => (locations.data ? toBranchComparisonView(locations.data) : undefined),
    [locations.data],
  );
  return (
    <View className="flex-1">
      <LocationsBranchComparisonScreen
        view={view}
        isError={locations.isError}
        onRetry={() => void locations.refetch()}
        range={window.range}
        onRangeChange={window.onRangeChange}
        onBack={navigation.goBack}
        onChangeBranchFilter={() => navigation.navigate('LocationsBranches')}
        onOpenBranch={branchId => navigation.navigate('WuseBranchDetails', { branchId })}
        onExport={() => navigation.navigate('AnalyticsExportReport')}
      />
      {window.sheet}
    </View>
  );
}

export function AnalyticsExportReportRoute() {
  const navigation = useBusinessNavigation();
  const copy = strings.businessIntelligence.exportReport;
  const query = useAnalyticsQuery();
  const branchId = useAnalyticsFilterStore(state => state.branchId);
  const myBusiness = useMyBusiness();
  const exporter = useExportAnalytics();
  const [message, setMessage] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const branchName =
    (branchId &&
      toBranchList(myBusiness.data).find(branch => branch.id === branchId)?.name) ||
    strings.businessIntelligence.allLocations;

  async function exportReport(payload: ExportAnalyticsReportPayload) {
    setMessage(null);
    try {
      const file = await exporter.mutateAsync({
        ...query,
        format: payload.format,
        modules: payload.modules as AnalyticsExportModule[],
      });
      const shared = await shareBase64File(
        file.filename,
        file.contentBase64,
        file.mimeType,
        copy.title,
      );
      setMessage(
        shared
          ? { tone: 'success', text: copy.generated(count(file.records)) }
          : { tone: 'error', text: copy.shareUnavailable },
      );
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof ApiError ? error.message : copy.error,
      });
    }
  }

  return (
    <ExportAnalyticsReportScreen
      scope={{
        timeframe: rangeLabel(query.from, query.to),
        timeframeMeta: copy.timeframeMeta(rangeDays(query.from, query.to)),
        branch: branchName,
      }}
      isExporting={exporter.isPending}
      message={message}
      onClose={navigation.goBack}
      onExport={payload => void exportReport(payload)}
    />
  );
}
