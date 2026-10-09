import { useQuery } from '@tanstack/react-query';
import {
  businessDashboardApi,
  type BusinessDashboard,
  type CustomersSummary,
  type MyBusiness,
  type ReviewsSummary,
} from '@api/businessDashboardApi';
import { catalogueApi, type BusinessOfferAdmin } from '@api/catalogueApi';
import { loyaltyApi, type LoyaltyBusinessStats } from '@api/loyaltyApi';
import { useBusinessCatalogue } from '@features/business/hooks/useBusinessCatalogue';
import {
  useBusinessDashboard,
  useMyBusiness,
} from '@features/business/hooks/useBusinessDashboardData';

export const businessHubKeys = {
  reviewsSummary: () => ['business', 'hub', 'reviews-summary'] as const,
  customersSummary: () => ['business', 'hub', 'customers-summary'] as const,
  offers: (branchId: string | null) =>
    ['business', 'hub', 'offers', branchId ?? 'all'] as const,
  loyalty: (branchId: string | null) =>
    ['business', 'hub', 'loyalty', branchId ?? 'all'] as const,
};

/** Average/total of approved reviews for the rating tile. */
export function useBusinessReviewsSummary() {
  return useQuery<ReviewsSummary>({
    queryKey: businessHubKeys.reviewsSummary(),
    queryFn: () => businessDashboardApi.getReviewsSummary(),
    staleTime: 300_000,
  });
}

/** Distinct customer totals for the CRM module card. */
export function useBusinessCustomersSummary() {
  return useQuery<CustomersSummary>({
    queryKey: businessHubKeys.customersSummary(),
    queryFn: () => businessDashboardApi.getCustomersSummary(),
    staleTime: 300_000,
  });
}

/** All offers for the business; counts drive the Deals module card. */
export function useBusinessOffers(branchId: string | null) {
  return useQuery<BusinessOfferAdmin[]>({
    queryKey: businessHubKeys.offers(branchId),
    queryFn: () => catalogueApi.listBusinessOffers(branchId),
    staleTime: 60_000,
  });
}

/** Business loyalty stats for the Loyalty module card. */
export function useLoyaltyBusinessStats(branchId: string | null) {
  return useQuery<LoyaltyBusinessStats>({
    queryKey: businessHubKeys.loyalty(branchId),
    queryFn: () => loyaltyApi.getBusinessStats(branchId),
    staleTime: 300_000,
  });
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

export type BusinessHubModuleId =
  'locations' | 'products' | 'deals' | 'crm' | 'loyalty' | 'staff';

export interface BusinessHubView {
  name?: string;
  categoryLine?: string;
  uniqueCode?: string;
  logoUrl?: string;
  coverUrl?: string;
  isVerified: boolean;
  phone: string;
  website: string;
  branchCount: number;
  branchNames: string;
  reviews: { average: number | null; total: number };
  amenities: string[];
  /** Live replacement for each module card's count line. */
  moduleBodies: Partial<Record<BusinessHubModuleId, string>>;
  readerStatus?: string;
}

export interface BusinessHubInput {
  business?: MyBusiness;
  catalogueTotal?: number;
  offers?: BusinessOfferAdmin[];
  customers?: CustomersSummary;
  loyalty?: LoyaltyBusinessStats;
  reviews?: ReviewsSummary;
  dashboard?: BusinessDashboard;
}

function plural(count: number, singular: string, pluralWord = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralWord}`;
}

/** Builds everything the Business hub renders from the API payloads. */
export function presentBusinessHub({
  business,
  catalogueTotal,
  offers,
  customers,
  loyalty,
  reviews,
  dashboard,
}: BusinessHubInput): BusinessHubView {
  const branchList = business?.branches ?? [];
  const branchNames = branchList
    .map(branch => branch.name?.trim())
    .filter((name): name is string => Boolean(name));

  const categoryParts = [
    business?.category?.name?.trim(),
    business?.subcategory?.name?.trim(),
  ].filter((part): part is string => Boolean(part));

  const moduleBodies: BusinessHubView['moduleBodies'] = {};

  if (business) {
    moduleBodies.locations = [
      `${plural(branchList.length, 'Active Location')}`,
      branchNames.slice(0, 2).join(' & '),
    ]
      .filter(Boolean)
      .join(' \u00b7 ');
  }

  if (catalogueTotal !== undefined) {
    moduleBodies.products = `${plural(catalogueTotal, 'Item')} in catalogue`;
  }

  if (offers) {
    const active = offers.filter(
      offer => offer.status?.toLowerCase() === 'active',
    ).length;
    const scheduled = offers.filter(
      offer => offer.status?.toLowerCase() === 'scheduled',
    ).length;
    const parts = [
      active > 0 ? `${active} Active` : null,
      scheduled > 0 ? `${scheduled} Scheduled` : null,
    ].filter(Boolean);
    moduleBodies.deals = parts.length > 0 ? parts.join(' \u00b7 ') : 'No live offers';
  }

  if (customers) {
    moduleBodies.crm = `${customers.totalCustomers} Total Customers \u00b7 ${customers.newThisWeek} New this week`;
  }

  if (loyalty) {
    const findStat = (label: string) =>
      loyalty.stats.find(stat => stat.label?.toLowerCase() === label.toLowerCase())
        ?.value;
    const programmes = findStat('Active Programs') ?? '0';
    const points = findStat('Points Issued') ?? '0';
    moduleBodies.loyalty = `${programmes} Active Programmes \u00b7 ${points} points issued`;
  }

  const staffCount = dashboard?.staffMembers?.length;
  if (staffCount !== undefined) {
    moduleBodies.staff = plural(staffCount, 'Team Member');
  }

  const devices = dashboard?.devices ?? [];
  const online = devices.filter(
    device => String(device.status ?? '').toLowerCase() === 'active',
  ).length;
  const readerStatus =
    devices.length > 0 ? `${online} of ${devices.length} terminals online` : undefined;

  return {
    name: business?.name?.trim() || undefined,
    categoryLine: categoryParts.length > 0 ? categoryParts.join(' \u00b7 ') : undefined,
    uniqueCode: business?.uniqueCode?.trim() || undefined,
    logoUrl: business?.logoUrl || undefined,
    coverUrl: business?.coverImage || undefined,
    isVerified: business?.isVerified === true,
    phone: business?.phone?.trim() || business?.whatsappNumber?.trim() || '',
    website: business?.website?.trim() || '',
    branchCount: branchList.length,
    branchNames: branchNames.join(' & '),
    reviews: {
      average: reviews?.averageRating ?? null,
      total: reviews?.totalReviews ?? 0,
    },
    amenities: (business?.amenities ?? []).filter(Boolean),
    moduleBodies,
    readerStatus,
  };
}

/** Composes every Business-hub query into one view model. */
export function useBusinessHubData(branchId: string | null) {
  const myBusiness = useMyBusiness();
  const catalogue = useBusinessCatalogue();
  const offers = useBusinessOffers(branchId);
  const customers = useBusinessCustomersSummary();
  const reviews = useBusinessReviewsSummary();
  const loyalty = useLoyaltyBusinessStats(branchId);
  const dashboard = useBusinessDashboard(branchId, Boolean(branchId));

  const view = presentBusinessHub({
    business: myBusiness.data,
    catalogueTotal: catalogue.data?.total,
    offers: offers.isSuccess ? offers.data : undefined,
    customers: customers.data,
    loyalty: loyalty.data,
    reviews: reviews.data,
    dashboard: dashboard.data,
  });

  return {
    view,
    isLoading:
      myBusiness.isLoading ||
      catalogue.isLoading ||
      offers.isLoading ||
      customers.isLoading ||
      reviews.isLoading ||
      loyalty.isLoading,
  };
}
