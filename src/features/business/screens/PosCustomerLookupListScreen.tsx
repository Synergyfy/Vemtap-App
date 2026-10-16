import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessInfoStrip,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';

const copy = strings.posCustomerLookupList;

export type CustomerSegmentFilter = 'all' | 'vip' | 'new' | 'lapsed';

const segmentIcon: Record<CustomerSegmentFilter, IconName> = {
  all: 'star',
  vip: 'star',
  new: 'personAdd',
  lapsed: 'schedule',
};

export interface PosCustomerCardView {
  id: string;
  name: string;
  initials: string;
  contact: string;
  tier: string;
  vip: boolean;
  isNew: boolean;
  points: string;
  visits: string;
  spend: string;
  lastVisit: string;
}

export interface PosCustomerLookupListView {
  branchName: string;
  /** A ticket is open on the till, so "Attach" links to it. */
  hasActiveSale: boolean;
  segments: { id: CustomerSegmentFilter; label: string; count: number }[];
  customers: PosCustomerCardView[];
  hasMore: boolean;
}

export interface PosCustomerLookupListScreenProps {
  view?: PosCustomerLookupListView;
  isLoading?: boolean;
  isError?: boolean;
  isFetchingMore?: boolean;
  onRetry?: () => void;
  search: string;
  segment: CustomerSegmentFilter;
  onBack?: () => void;
  onOpenCrmHub?: () => void;
  onSearchChange?: (text: string) => void;
  onSelectSegment?: (segment: CustomerSegmentFilter) => void;
  onAttach?: (customerId: string) => void;
  onOpenDossier?: (customerId: string) => void;
  onLoadMore?: () => void;
}

/** The till CRM list: segment chips, search, and an attach/dossier pair per patron. */
export function PosCustomerLookupListScreen({
  view,
  isLoading,
  isError,
  isFetchingMore,
  onRetry,
  search,
  segment,
  onBack,
  onOpenCrmHub,
  onSearchChange,
  onSelectSegment,
  onAttach,
  onOpenDossier,
  onLoadMore,
}: PosCustomerLookupListScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: view?.branchName || copy.headerTitle, onBack, showAvatar: false }}
      contentContainerClassName="pb-8"
    >
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText
              variant="headingSm"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.title}
            </VemtapText>
            {view.hasActiveSale ? (
              <BusinessStatusPill label={copy.linkBadge} tone="brand" icon="bolt" />
            ) : null}
          </View>

          <BusinessInfoStrip
            className="mt-3"
            icon="loyalty"
            title={copy.tipTitle}
            body={copy.tipMeta}
            tone="subtle"
          />
          <View className="mt-1 items-end">
            <BusinessInlineAction
              label={copy.tipCta}
              icon="arrowForward"
              onPress={onOpenCrmHub}
            />
          </View>

          <Input
            containerClassName="mt-3"
            placeholder={copy.searchPlaceholder}
            accessibilityLabel={copy.searchPlaceholder}
            value={search}
            onChangeText={onSearchChange}
            keyboardType="default"
            leadingIcon={<Icon name="search" size={18} color={colors.textTertiary} />}
          />

          <View className="mt-3">
            <BusinessChipScroller>
              {view.segments.map(item => (
                <BusinessCountChip
                  key={item.id}
                  label={item.label}
                  icon={segmentIcon[item.id]}
                  count={String(item.count)}
                  selected={segment === item.id}
                  onPress={() => onSelectSegment?.(item.id)}
                />
              ))}
            </BusinessChipScroller>
          </View>

          <View className="mt-3 gap-2.5">
            {view.customers.map(customer => (
              <View key={customer.id} className="rounded-card bg-surface p-3 shadow-sm">
                <View className="flex-row items-start gap-3">
                  <BusinessInitialsAvatar
                    initials={customer.initials}
                    size="md"
                    tone={customer.vip ? 'brand' : customer.isNew ? 'success' : 'neutral'}
                  />
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {customer.name}
                    </VemtapText>
                    <BusinessStatusPill
                      label={customer.tier}
                      tone={customer.vip ? 'brand' : 'neutral'}
                      className="mt-1 self-start"
                    />
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="mt-1"
                      numberOfLines={1}
                    >
                      {customer.contact}
                    </VemtapText>
                  </View>
                </View>

                <View className="mt-2 rounded-field bg-surface-tint px-2.5 py-2">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {customer.points}
                  </VemtapText>
                </View>

                <View className="mt-2 flex-row flex-wrap gap-2">
                  {[
                    { label: copy.visitsLabel, value: customer.visits },
                    { label: copy.spendLabel, value: customer.spend },
                    { label: copy.lastVisitLabel, value: customer.lastVisit },
                  ].map(stat => (
                    <View key={stat.label} className="min-w-[30%] flex-1">
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                        {stat.label}
                      </VemtapText>
                      <VemtapText
                        variant="caption"
                        className="font-sans-semibold"
                        numberOfLines={1}
                      >
                        {stat.value}
                      </VemtapText>
                    </View>
                  ))}
                </View>

                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${copy.attachCta} ${customer.name}`}
                    onPress={() => onAttach?.(customer.id)}
                    className="min-h-11 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-primary active:scale-[0.98]"
                  >
                    <Icon name="link" size={16} color={colors.surface} />
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-surface"
                      numberOfLines={1}
                    >
                      {view.hasActiveSale ? copy.attachActiveCta : copy.attachCta}
                    </VemtapText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${copy.dossierCta} ${customer.name}`}
                    onPress={() => onOpenDossier?.(customer.id)}
                    className="min-h-11 shrink-0 flex-row items-center justify-center gap-1 rounded-field bg-surface-container px-3 active:scale-[0.98]"
                  >
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {copy.dossierCta}
                    </VemtapText>
                    <Icon name="arrowForward" size={15} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          {view.customers.length === 0 ? (
            <EmptyState
              icon="person"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}

          {view.hasMore ? (
            <View className="mt-3">
              <Button
                label={strings.posLedger.loadMore}
                variant="secondary"
                loading={isFetchingMore}
                onPress={onLoadMore}
              />
            </View>
          ) : null}
        </>
      )}
    </BusinessScreenLayout>
  );
}
