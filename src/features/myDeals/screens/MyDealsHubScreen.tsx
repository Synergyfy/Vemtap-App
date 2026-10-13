import React, { useMemo, useState } from 'react';
import { Clipboard, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HubHeader,
  HubSearchField,
  StatusPillTabs,
} from '@features/accountHub/components/HubPrimitives';
import { ClaimedDealCard } from '@features/accountHub/components/ClaimedDealCard';
import { GiftedDealCard } from '@features/myDeals/components/GiftedDealCard';
import {
  MyDealsFilterSheet,
  sortMyDeals,
  type MyDealsSort,
} from '@features/myDeals/components/MyDealsFilterSheet';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { showToast } from '@components/shared/toast';
import { formatCurrency } from '@utils/formatters';
import { useDebounce } from '@hooks/useDebounce';
import {
  useMyClaims,
  useMyDealsSavingsTotal,
  useMyGifts,
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

/**
 * Tab index → the status it lists.
 *
 * Every tab now has a real source: the first three are `status` values on
 * `GET /me/claims`, and the fourth is `GET /me/gifts`. Nothing here is a
 * placeholder — the Gifted tab used to be hardcoded, which is why this list
 * exists as an explicit map rather than an offset.
 */
const TAB_STATUSES: readonly (MyClaimStatus | null)[] = [
  'ACTIVE',
  'REDEEMED',
  'EXPIRED',
  null,
];

/** The Gifted tab reads from `/me/gifts` instead of the claims list. */
const GIFTED_TAB = 3;

export interface MyDealsHubScreenProps {
  onBack?: () => void;
  onAccount?: () => void;
  /** Opens the claimed-pass detail for a claim id from `GET /me/claims`. */
  onOpenClaim?: (claimId: string) => void;
  onViewGuidelines?: () => void;
}

export function MyDealsHubScreen({
  onBack,
  onAccount,
  onOpenClaim,
  onViewGuidelines,
}: MyDealsHubScreenProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(0);
  const [sort, setSort] = useState<MyDealsSort>('newest');
  const [sheetOpen, setSheetOpen] = useState(false);

  // The search is server-side, so it is debounced before it reaches the API —
  // otherwise one request per keystroke. The input itself stays synchronous.
  const debouncedQuery = useDebounce(query, 300);
  const search = debouncedQuery.trim();

  // All three statuses are needed regardless of the open tab: the counts on
  // the tab row come from their totals.
  const active = useMyClaims('ACTIVE', search);
  const redeemed = useMyClaims('REDEEMED', search);
  const expired = useMyClaims('EXPIRED', search);
  const gifts = useMyGifts(search);
  const savingsQuery = useMyDealsSavingsTotal();

  const lists: Record<MyClaimStatus, MyClaimsQueryResult> = {
    ACTIVE: active,
    REDEEMED: redeemed,
    EXPIRED: expired,
  };

  const selectedStatus = TAB_STATUSES[tab];
  const selected = selectedStatus ? lists[selectedStatus] : undefined;
  const isGiftedTab = tab === GIFTED_TAB;

  // Split by source so each row list keeps its own type — the sorter runs the
  // same way over both, but a claim row and a gift row render differently.
  const claimRows = useMemo(
    () => sortMyDeals(selected?.data?.data ?? [], sort, priceOfClaim, expiryOfClaim),
    [selected?.data, sort],
  );
  const giftRows = useMemo(
    () => sortMyDeals(gifts.data?.data ?? [], sort, priceOfGift, expiryOfGift),
    [gifts.data, sort],
  );

  const claimedTotal =
    active.isSuccess && redeemed.isSuccess && expired.isSuccess
      ? (active.data?.total ?? 0) +
        (redeemed.data?.total ?? 0) +
        (expired.data?.total ?? 0)
      : undefined;

  // `undefined` until the ledger settles — the schema guarantees a number after.
  const savings = savingsQuery.data?.totalSavedAmount ?? null;

  const counts = [
    active.data?.total.toString() ?? '',
    redeemed.data?.total.toString() ?? '',
    expired.data?.total.toString() ?? '',
    gifts.data?.total.toString() ?? '',
  ];

  const copyCode = (claim: MyClaim) => {
    Clipboard.setString(claim.claimCode);
    showToast(copy.codeCopied, 'success');
  };

  const renderList = () => {
    if (isGiftedTab) {
      if (gifts.isLoading) return <LoadingState label={strings.common.loading} />;
      if (gifts.isError) return <ErrorState onRetry={() => gifts.refetch()} />;
      if (giftRows.length === 0) return renderEmpty();
      return (
        <View className="gap-4 px-4">
          {giftRows.map(gift => (
            <GiftedDealCard key={gift.id} gift={gift} />
          ))}
        </View>
      );
    }

    if (!selected) return null;
    if (selected.isLoading) return <LoadingState label={strings.common.loading} />;
    if (selected.isError) return <ErrorState onRetry={() => selected.refetch()} />;
    if (claimRows.length === 0) return renderEmpty();
    return (
      <View className="gap-4 px-4">
        {claimRows.map(claim => (
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

  const renderEmpty = () => {
    if (search) {
      return (
        <EmptyState
          icon="search"
          title={copy.noSearchMatch(search)}
          description={copy.noSearchMatchHint}
        />
      );
    }
    const label = copy.tabLabels[tab];
    return (
      <EmptyState
        icon="inventory"
        title={label}
        description={isGiftedTab ? copy.giftedCard.emptyBody : copy.emptyFor(label)}
      />
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <HubHeader
        title={copy.title}
        onBack={onBack}
        actionNames={['tune']}
        actionLabels={[copy.filterAction]}
        onActions={[() => setSheetOpen(true)]}
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
                {savings === null
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
        {renderList()}
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
      <MyDealsFilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        sort={sort}
        onApply={setSort}
      />
    </SafeAreaView>
  );
}

const priceOfClaim = (claim: MyClaim) => claim.offer.calculatedPrice;
const priceOfGift = (gift: { offer: { calculatedPrice: number } }) =>
  gift.offer.calculatedPrice;
const expiryOfClaim = (claim: MyClaim) => claim.expiresAt;
const expiryOfGift = () => '';
