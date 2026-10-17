import React from 'react';
import { EmptyState, ErrorState, LoadingState } from '@components/shared';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessDateRange,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessRatingStars } from '@features/business/components/BusinessPosPrimitives';
import type {
  BranchComparisonView,
  BranchStatus,
} from '@features/business/utils/analyticsMappers';

const copy = strings.locationsBranchComparison;

const statusTone: Record<BranchStatus, 'success' | 'brand' | 'warning'> = {
  best: 'success',
  steady: 'brand',
  watch: 'warning',
};

export interface LocationsBranchComparisonScreenProps {
  view?: BranchComparisonView;
  isError?: boolean;
  onRetry?: () => void;
  range?: string;
  onRangeChange?: (value: string) => void;
  /** Label of the branch filter pill (`All branches` or one branch). */
  branchFilterLabel?: string;
  onBack?: () => void;
  onChangeBranchFilter?: () => void;
  onOpenBranch?: (branchId: string) => void;
  onExport?: () => void;
}

/**
 * Side-by-side branch comparison: per-branch revenue, orders, AOV and rating
 * with bars normalised to the best-performing branch, plus a top/needs-attention
 * summary pair.
 */
export function LocationsBranchComparisonScreen({
  view,
  isError,
  onRetry,
  range = copy.dateRanges[1],
  onRangeChange,
  branchFilterLabel = copy.branchFilter,
  onBack,
  onChangeBranchFilter,
  onOpenBranch,
  onExport,
}: LocationsBranchComparisonScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.exportCta}
            labelVariant="labelMd"
            onPress={onExport}
            leftIcon={<Icon name="download" size={18} color={colors.surface} />}
          />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.footerNote}
          </VemtapText>
        </BusinessActionDock>
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={branchFilterLabel}
        onPress={onChangeBranchFilter}
        className="min-h-11 flex-row items-center justify-between gap-2 rounded-field bg-surface px-3 shadow-sm active:bg-surface-subtle"
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Icon name="storefront" size={18} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {branchFilterLabel}
          </VemtapText>
        </View>
        <Icon name="expandMore" size={20} color={colors.textTertiary} />
      </Pressable>

      <BusinessDateRange
        value={range}
        options={copy.dateRanges}
        onChange={value => onRangeChange?.(value)}
        className="mt-3"
      />

      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={strings.businessIntelligence.loading} />
        )
      ) : view.branches.length === 0 ? (
        <EmptyState
          className="mt-3"
          icon="storefront"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : (
        <>
          <BusinessMetricGrid
            cells={[
              {
                label: copy.branchCountLabel,
                value: view.count,
                icon: 'store',
              },
              {
                label: copy.bestLabel,
                value: view.best?.name ?? '\u2014',
                note: view.best?.revenue,
                noteIcon: 'trendingUp',
                noteTone: 'success',
                icon: 'trophy',
              },
              {
                label: copy.worstLabel,
                value: view.watch?.name ?? '\u2014',
                note: view.watch?.revenue,
                noteTone: 'default',
                icon: 'alertOutline',
              },
            ]}
            columns={3}
            className="mt-3"
          />

          <BusinessPanel
            className="mt-3"
            title={copy.compareTitle}
            icon="insights"
            badge={String(view.branches.length)}
            badgeTone="neutral"
          >
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {copy.compareSubtitle}
            </VemtapText>
            <View className="gap-2.5">
              {view.branches.map(branch => (
                <Pressable
                  key={branch.id}
                  accessibilityRole="button"
                  accessibilityLabel={branch.name}
                  onPress={() => onOpenBranch?.(branch.id)}
                  className="gap-2 rounded-field bg-surface-subtle p-3 active:bg-surface-container"
                >
                  <View className="flex-row items-center gap-2">
                    <View className="min-w-0 flex-1">
                      <VemtapText
                        variant="labelMd"
                        className="font-sans-semibold"
                        numberOfLines={1}
                      >
                        {branch.name}
                      </VemtapText>
                      <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                        {branch.code}
                      </VemtapText>
                    </View>
                    <BusinessStatusPill
                      label={copy.status[branch.status]}
                      tone={statusTone[branch.status]}
                    />
                    <VemtapText
                      variant="labelMd"
                      className="shrink-0 font-sans-bold"
                      numberOfLines={1}
                    >
                      {branch.revenue}
                    </VemtapText>
                  </View>

                  <View className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <View
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${branch.percentOfBest}%` }}
                    />
                  </View>

                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-row items-center gap-1.5">
                      <Icon name="receipt" size={14} color={colors.textTertiary} />
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {branch.orders}
                      </VemtapText>
                      <Icon name="payments" size={14} color={colors.textTertiary} />
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {branch.aov}
                      </VemtapText>
                    </View>
                    {branch.rating > 0 ? (
                      <BusinessRatingStars
                        rating={branch.rating}
                        size={13}
                        accessibilityLabel={`${branch.name} rating`}
                      />
                    ) : null}
                  </View>

                  <VemtapText variant="caption" tone="tertiary" numberOfLines={2}>
                    {branch.note}
                  </VemtapText>
                </Pressable>
              ))}
            </View>
          </BusinessPanel>
        </>
      )}
    </BusinessScreenLayout>
  );
}
