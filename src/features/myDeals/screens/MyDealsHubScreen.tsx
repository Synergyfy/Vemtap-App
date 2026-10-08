import React, { useMemo, useState } from 'react';
import { Clipboard, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HubHeader,
  HubSearchField,
  SectionLink,
  StatusPillTabs,
} from '@features/accountHub/components/HubPrimitives';
import { ClaimedDealCard } from '@features/accountHub/components/ClaimedDealCard';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { useUiStore } from '@store/uiStore';
import { formatCurrency } from '@utils/formatters';
import {
  useMyClaims,
  type MyClaimsQueryResult,
} from '@features/myDeals/hooks/useMyClaims';
import type { MyClaim, MyClaimStatus } from '@api/claimApi';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.myDealsHub;

/** Tab index → the status it lists; the last tab (Gifted) has no API. */
const TAB_STATUSES: readonly (MyClaimStatus | null)[] = [
  'ACTIVE',
  'REDEEMED',
  'EXPIRED',
  null,
];

const GIFTED_TAB = 3;

export interface MyDealsHubScreenProps {
  onBack?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
  onAccount?: () => void;
  /** Opens the claimed-pass detail for a claim id from `GET /me/claims`. */
  onOpenClaim?: (claimId: string) => void;
  onViewGuidelines?: () => void;
}

function savingsOf(claims: MyClaim[]): number {
  return claims.reduce(
    (total, claim) =>
      total + Math.max(claim.offer.originalPrice - claim.offer.calculatedPrice, 0),
    0,
  );
}

export function MyDealsHubScreen({
  onBack,
  onSearch,
  onFilter,
  onAccount,
  onOpenClaim,
  onViewGuidelines,
}: MyDealsHubScreenProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(0);
  const showToast = useUiStore(state => state.showToast);

  // All three statuses are already needed: the two they are not viewing feed
  // the tab counts and the savings summary.
  const active = useMyClaims('ACTIVE');
  const redeemed = useMyClaims('REDEEMED');
  const expired = useMyClaims('EXPIRED');

  const lists: Record<MyClaimStatus, MyClaimsQueryResult> = {
    ACTIVE: active,
    REDEEMED: redeemed,
    EXPIRED: expired,
  };

  const selectedStatus = TAB_STATUSES[tab];
  const selected = selectedStatus ? lists[selectedStatus] : undefined;

  const normalizedQuery = query.trim().toLowerCase();
  const visible = useMemo(() => {
    const data = selected?.data?.data ?? [];
    if (!normalizedQuery) return data;
    return data.filter(claim =>
      `${claim.offer.name} ${claim.offer.businessName}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [selected?.data, normalizedQuery]);

  const claimedTotal =
    active.isSuccess && redeemed.isSuccess && expired.isSuccess
      ? (active.data?.total ?? 0) +
        (redeemed.data?.total ?? 0) +
        (expired.data?.total ?? 0)
      : undefined;
  const savings =
    redeemed.isSuccess && redeemed.data ? savingsOf(redeemed.data.data) : undefined;

  const counts = [
    active.data?.total.toString() ?? '',
    redeemed.data?.total.toString() ?? '',
    expired.data?.total.toString() ?? '',
    '',
  ];

  const copyCode = (claim: MyClaim) => {
    Clipboard.setString(claim.claimCode);
    showToast(copy.codeCopied, 'success');
  };

  const renderList = () => {
    if (!selectedStatus || !selected) return null;
    if (selected.isLoading) {
      return <LoadingState label={strings.common.loading} />;
    }
    if (selected.isError) {
      return <ErrorState onRetry={() => selected.refetch()} />;
    }
    if (visible.length === 0) {
      return (
        <EmptyState
          icon="inventory"
          title={copy.tabLabels[tab]}
          description={copy.emptyFor(copy.tabLabels[tab])}
        />
      );
    }
    return (
      <View className="gap-4 px-4">
        {visible.map(claim => (
          <ClaimedDealCard
            key={claim.id}
            claim={claim}
            onOpen={() => onOpenClaim?.(claim.id)}
            onCopyCode={() => copyCode(claim)}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <HubHeader
        title={copy.title}
        onBack={onBack}
        actionNames={['search', 'tune']}
        actionLabels={[copy.searchAction, copy.filterAction]}
        onActions={[onSearch, onFilter]}
        accountAction={onAccount}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 mt-1 flex-row items-center justify-between rounded-card bg-surface-container-low p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-badge-discount-bg">
              <Icon name="loyalty" size={18} color={colors.badgeDiscountText} />
            </View>
            <View>
              <VemtapText variant="caption" tone="secondary">
                {copy.savings}
              </VemtapText>
              <VemtapText variant="headingSm">
                {savings === undefined
                  ? strings.customerDashboard.metricUnavailable
                  : formatCurrency(savings)}
              </VemtapText>
            </View>
          </View>
          <View className="h-7 w-px bg-outline" />
          <View className="items-end">
            <VemtapText variant="caption" tone="secondary">
              {copy.claimed}
            </VemtapText>
            <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
              {claimedTotal === undefined
                ? strings.customerDashboard.metricUnavailable
                : copy.claimedValueFor(claimedTotal)}
            </VemtapText>
          </View>
        </View>
        <View className="my-3 px-4">
          <HubSearchField
            value={query}
            onChangeText={setQuery}
            placeholder={copy.search}
            filterLabel={copy.filterAction}
            onFilter={onFilter}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4 pb-4"
        >
          <StatusPillTabs
            labels={copy.tabLabels}
            counts={counts}
            selected={tab}
            onSelect={setTab}
          />
        </ScrollView>
        {tab === GIFTED_TAB ? (
          <View className="px-4">
            <View className="items-center rounded-card bg-surface p-8 shadow-sm">
              <Icon name="inventory" size={36} color={colors.textTertiary} />
              <VemtapText variant="headingSm" className="mt-3">
                {copy.tabLabels[tab]}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="mt-1">
                {copy.emptyFor(copy.tabLabels[tab])}
              </VemtapText>
            </View>
          </View>
        ) : (
          renderList()
        )}
        <View className="mt-7 gap-3 px-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Icon name="badge" size={20} color={colors.primary} />
              <VemtapText variant="headingSm">{copy.gifted}</VemtapText>
              <View className="rounded-full bg-surface-container-high px-2 py-0.5">
                <VemtapText variant="caption">1</VemtapText>
              </View>
            </View>
            <SectionLink label={copy.viewAll} />
          </View>
          <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="min-w-0 flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary-fixed">
                  <VemtapText variant="labelMd">SA</VemtapText>
                </View>
                <View className="min-w-0">
                  <VemtapText variant="labelMd" className="font-sans-semibold">
                    Samuel Adeleke
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    samuel.adeleke@example.com
                  </VemtapText>
                </View>
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
                <Icon name="doneAll" size={12} color={colors.badgeDiscountText} />
                <VemtapText variant="micro" className="text-badge-discount-text">
                  {copy.claimedBadge}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-center justify-between rounded-lg bg-surface-subtle p-2">
              <View className="min-w-0">
                <VemtapText variant="labelSm" className="font-sans-medium">
                  Urban Grill 20% Off Combo
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  Sent on Oct 14, 2024
                </VemtapText>
              </View>
              <SectionLink label={copy.receipt} />
            </View>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onViewGuidelines}
          className="mx-4 mt-6 flex-row items-start gap-3 rounded-card bg-surface-tint-blue p-4"
        >
          <Icon name="help" size={22} color={colors.primary} />
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.helpTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-1 leading-relaxed"
            >
              {copy.helpBody}
            </VemtapText>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
