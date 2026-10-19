import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { EmptyState, ErrorState, LoadingState } from '@components/shared';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { CustomerSegmentFilter, CustomerSort } from '@api/businessCustomersApi';
import {
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessStatusPill,
  type BusinessPillTone,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessLinkRow,
  BusinessPanel,
  BusinessScopePicker,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import { SetupCallout } from '@features/business/components/BusinessSetupPrimitives';
import type { CustomerDirectoryView } from '@features/business/utils/crmMappers';

cssInterop(Pressable, { className: 'style' });

const copy = strings.customerCrm;

const segmentTone: Record<string, BusinessPillTone> = {
  brand: 'brand',
  success: 'success',
  tertiary: 'tertiary',
  warning: 'warning',
  neutral: 'neutral',
};

const SORTS: CustomerSort[] = ['recent', 'spend', 'visits', 'name'];

export interface CustomerCrmDirectoryScreenProps {
  view?: CustomerDirectoryView;
  isError?: boolean;
  onRetry?: () => void;
  search?: string;
  onChangeSearch?: (value: string) => void;
  filter?: CustomerSegmentFilter;
  onChangeFilter?: (value: CustomerSegmentFilter) => void;
  sort?: CustomerSort;
  onChangeSort?: (value: CustomerSort) => void;
  /** Branch scope options; the first is "All branches" (`value` ''). */
  scopes?: { label: string; value: string }[];
  scope?: string;
  onChangeScope?: (value: string) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  isExporting?: boolean;
  notice?: { tone: 'success' | 'error'; text: string } | null;
  onNotifications?: () => void;
  onScanCode?: () => void;
  onExport?: () => void;
  onMessageCustomer?: (customerId: string) => void;
  onViewProfile?: (customerId: string) => void;
  onOpenAnalytics?: () => void;
}

/**
 * Customer CRM directory: branch-scoped, searchable and filterable list of
 * customers with segment, visit/loyalty stats and the last interaction.
 */
export function CustomerCrmDirectoryScreen({
  view,
  isError,
  onRetry,
  search = '',
  onChangeSearch,
  filter = 'all',
  onChangeFilter,
  sort = 'recent',
  onChangeSort,
  scopes = [],
  scope = '',
  onChangeScope,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  isExporting = false,
  notice,
  onNotifications,
  onScanCode,
  onExport,
  onMessageCustomer,
  onViewProfile,
  onOpenAnalytics,
}: CustomerCrmDirectoryScreenProps) {
  const scopeLabel =
    scopes.find(option => option.value === scope)?.label ?? copy.allBranches;
  const nextSort = SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length];

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        centerTitle: false,
        titleVariant: 'headingSm',
        subtitle: copy.subtitleEyebrow,
        actions: [
          { icon: 'qrCodeScanner', label: copy.scanCode, onPress: onScanCode },
          {
            icon: 'notifications',
            label: strings.businessShell.notificationsLabel,
            onPress: onNotifications,
          },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <VemtapText variant="caption" tone="secondary" className="mt-1" numberOfLines={2}>
        {copy.intro}
      </VemtapText>

      {scopes.length > 1 ? (
        <View className="z-10 mt-2">
          <BusinessScopePicker
            label={scopeLabel}
            value={scope}
            options={scopes}
            onChange={value => onChangeScope?.(value)}
          />
        </View>
      ) : null}

      <Input
        containerClassName="mt-3"
        value={search}
        onChangeText={value => onChangeSearch?.(value)}
        placeholder={copy.searchPlaceholder}
        accessibilityLabel={copy.searchLabel}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <View className="mt-3">
        <BusinessChipScroller>
          {(view?.filters ?? copy.filters.map(chip => ({ ...chip, count: '' }))).map(
            chip => (
              <BusinessSelectionChip
                key={chip.key}
                label={chip.count ? `${chip.label} (${chip.count})` : chip.label}
                selected={filter === chip.key}
                showCheck={false}
                onPress={() => onChangeFilter?.(chip.key)}
              />
            ),
          )}
        </BusinessChipScroller>
      </View>

      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={copy.loading} />
        )
      ) : (
        <>
          <BusinessPanel className="mt-3" tone="tint">
            <SetupCallout
              icon="insights"
              tone="plain"
              iconSurface="circle"
              iconSize={19}
              title={view.insightTitle}
              titleClassName="font-sans-semibold"
              bodyVariant="bodyMd"
              body={view.insightBody}
            />
            <View className="flex-row items-center justify-between gap-2 border-t border-border pt-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.export}
                accessibilityState={{ disabled: isExporting }}
                disabled={isExporting}
                hitSlop={8}
                onPress={onExport}
                className="flex-row items-center gap-1.5"
              >
                <Icon name="download" size={15} color={colors.primary} />
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {isExporting
                    ? strings.businessIntelligence.exportReport.generating
                    : copy.export}
                </VemtapText>
              </Pressable>
            </View>
            {notice ? (
              <VemtapText
                variant="caption"
                className={
                  notice.tone === 'success' ? 'text-badge-discount-text' : 'text-error'
                }
              >
                {notice.text}
              </VemtapText>
            ) : null}
          </BusinessPanel>

          <View className="mt-3 flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {view.showing}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${copy.sortPrefix}${copy.sorts[sort]}`}
              onPress={() => onChangeSort?.(nextSort)}
              className="flex-row items-center gap-1"
            >
              <VemtapText
                variant="caption"
                className="font-sans-medium text-secondary"
                numberOfLines={1}
              >
                {`${copy.sortPrefix}${copy.sorts[sort]}`}
              </VemtapText>
              <Icon name="expandMore" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>

          {view.rows.length === 0 ? (
            <EmptyState
              className="mt-3"
              icon="group"
              variant="contained"
              title={search || filter !== 'all' ? copy.noMatches.title : copy.empty.title}
              description={
                search || filter !== 'all' ? copy.noMatches.body : copy.empty.body
              }
            />
          ) : null}

          <View className="mt-2 gap-3">
            {view.rows.map(customer => (
              <View
                key={customer.id}
                className="gap-3 rounded-card border border-border bg-surface p-3 shadow-sm"
              >
                <View className="flex-row items-start gap-3">
                  <View className="h-12 w-12 shrink-0">
                    {customer.avatarUrl ? (
                      <BusinessProductImage
                        source={{ uri: customer.avatarUrl }}
                        alt={customer.name}
                        className="h-full w-full rounded-full"
                      />
                    ) : (
                      <BusinessInitialsAvatar initials={customer.initials} tone="brand" />
                    )}
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center justify-between gap-2">
                      <VemtapText
                        variant="labelMd"
                        className="min-w-0 flex-1 font-sans-semibold"
                        numberOfLines={1}
                      >
                        {customer.name}
                      </VemtapText>
                      <BusinessStatusPill
                        label={customer.segment}
                        tone={segmentTone[customer.segmentTone] ?? 'neutral'}
                      />
                    </View>
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="mt-0.5"
                      numberOfLines={1}
                    >
                      {customer.contact}
                    </VemtapText>
                  </View>
                </View>

                <View className="flex-row overflow-hidden rounded-field border border-border bg-surface-subtle py-2">
                  {customer.stats.map((stat, index) => (
                    <View
                      key={stat.label}
                      className={`min-w-0 flex-1 items-center px-1 ${
                        index > 0 ? 'border-l border-border' : ''
                      }`}
                    >
                      <VemtapText
                        variant="labelSm"
                        className={`font-sans-bold ${index === 3 ? 'text-primary' : ''}`}
                        numberOfLines={1}
                      >
                        {stat.value}
                      </VemtapText>
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                        {stat.label}
                      </VemtapText>
                    </View>
                  ))}
                </View>

                <View className="flex-row items-start gap-1.5">
                  <Icon name={customer.icon} size={15} color={colors.textTertiary} />
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="min-w-0 flex-1"
                  >
                    {customer.firstSeen}
                    <VemtapText variant="caption" className="font-sans-medium text-text">
                      {customer.lastSeen}
                    </VemtapText>
                    <VemtapText
                      variant="caption"
                      className={
                        customer.contextTone === 'success'
                          ? 'text-badge-discount-text'
                          : 'text-text-secondary'
                      }
                    >
                      {customer.context}
                    </VemtapText>
                  </VemtapText>
                </View>

                <View className="flex-row gap-2 border-t border-border pt-3">
                  <Button
                    label={copy.message}
                    labelVariant="labelSm"
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onPress={() => onMessageCustomer?.(customer.id)}
                  />
                  <Button
                    label={copy.viewProfile}
                    labelVariant="labelSm"
                    size="sm"
                    className="flex-1"
                    onPress={() => onViewProfile?.(customer.id)}
                    rightIcon={
                      <Icon name="arrowForward" size={15} color={colors.surface} />
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          {hasMore ? (
            <Button
              className="mt-3"
              label={copy.loadMore}
              labelVariant="labelSm"
              variant="secondary"
              loading={isLoadingMore}
              disabled={isLoadingMore}
              onPress={onLoadMore}
            />
          ) : null}
        </>
      )}

      <BusinessPanel className="mt-4 items-center gap-2" tone="low">
        <SetupCallout
          icon="lock"
          tone="plain"
          iconSurface="plain"
          iconSize={16}
          body={copy.compliance}
          bodyVariant="caption"
          bodyClassName="text-center"
        />
        <BusinessLinkRow
          label={copy.analyticsLink}
          icon="northEast"
          onPress={onOpenAnalytics}
        />
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
