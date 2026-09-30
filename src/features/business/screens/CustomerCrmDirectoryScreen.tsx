import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
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
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import { SetupCallout } from '@features/business/components/BusinessSetupPrimitives';
import { businessOpsImageById } from '@features/business/data/businessOpsImages';

cssInterop(Pressable, { className: 'style' });

const copy = strings.customerCrm;

const segmentTone: Record<string, BusinessPillTone> = {
  brand: 'brand',
  success: 'success',
  tertiary: 'tertiary',
  warning: 'warning',
};

const badgeIcon: Record<string, IconName> = {
  check: 'check',
  starFilled: 'starFilled',
  person: 'person',
};

export interface CustomerCrmDirectoryScreenProps {
  onNotifications?: () => void;
  onScanCode?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
  onChangeScope?: (value: string) => void;
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
  onNotifications,
  onScanCode,
  onSearch,
  onFilter,
  onChangeScope,
  onExport,
  onMessageCustomer,
  onViewProfile,
  onOpenAnalytics,
}: CustomerCrmDirectoryScreenProps) {
  const [filter, setFilter] = useState('all');
  const [scope, setScope] = useState('wuse');

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        centerTitle: false,
        titleVariant: 'headingSm',
        subtitle: copy.subtitleEyebrow,
        actions: [
          { icon: 'qrCodeScanner', label: copy.scanCode, onPress: onScanCode },
          { icon: 'notifications', label: copy.headerTitle, onPress: onNotifications },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="mt-1 flex-row items-center justify-between gap-2">
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {copy.intro}
        </VemtapText>
      </View>

      <View className="mt-2 flex-row items-center justify-between gap-2">
        <BusinessScopePicker
          label={`${strings.locationsBranches.branches[0].name} (482 Customers)`}
          value={scope}
          options={strings.locationsBranches.branches.map((branch, index) => ({
            label: `${branch.name} ${copy.scopeCounts[index].suffix}`,
            value: branch.id,
          }))}
          onChange={value => {
            setScope(value);
            onChangeScope?.(value);
          }}
        />
        <View className="flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
          <VemtapText
            variant="caption"
            className="font-sans-medium text-badge-discount-text"
          >
            {copy.liveSync}
          </VemtapText>
        </View>
      </View>

      <BusinessSearchTrigger
        className="mt-3"
        surface="bordered"
        placeholder={copy.searchPlaceholder}
        filterLabel={undefined}
        onPress={onSearch}
        onFilterPress={onFilter}
      />

      <View className="mt-3">
        <BusinessChipScroller>
          {copy.filters.map(chip => (
            <BusinessSelectionChip
              key={chip.key}
              label={chip.label}
              selected={filter === chip.key}
              showCheck={false}
              onPress={() => setFilter(chip.key)}
            />
          ))}
        </BusinessChipScroller>
      </View>

      <BusinessPanel className="mt-3" tone="tint">
        <SetupCallout
          icon="insights"
          tone="plain"
          iconSurface="circle"
          iconSize={19}
          title={copy.insightsTitle}
          titleClassName="font-sans-semibold"
          bodyVariant="bodyMd"
          body={copy.insightsBody}
        />
        <View className="flex-row items-center justify-between gap-2 border-t border-border pt-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.export}
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
              {copy.export}
            </VemtapText>
          </Pressable>
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.updated}
          </VemtapText>
        </View>
      </BusinessPanel>

      <View className="mt-3 flex-row items-center justify-between gap-2">
        <VemtapText
          variant="labelMd"
          className="min-w-0 flex-1 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.showingLabel}
        </VemtapText>
        <View className="flex-row items-center gap-1">
          <VemtapText
            variant="caption"
            className="font-sans-medium text-secondary"
            numberOfLines={1}
          >
            {copy.sort}
          </VemtapText>
          <Icon name="expandMore" size={14} color={colors.textSecondary} />
        </View>
      </View>

      <View className="mt-2 gap-3">
        {copy.customers.map(customer => {
          const image = businessOpsImageById[customer.id];
          return (
            <View
              key={customer.id}
              className="gap-3 rounded-card border border-border bg-surface p-3 shadow-sm"
            >
              <View className="flex-row items-start gap-3">
                <View className="relative h-12 w-12 shrink-0">
                  {image ? (
                    <BusinessProductImage
                      source={image}
                      alt={image.alt}
                      className="h-full w-full rounded-full"
                    />
                  ) : null}
                  {'badge' in customer && customer.badge ? (
                    <View className="absolute -bottom-1 -right-1 h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Icon
                        name={badgeIcon[customer.badge]}
                        size={10}
                        color={colors.surface}
                      />
                    </View>
                  ) : null}
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
                  {'company' in customer && customer.company ? (
                    <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                      {customer.company}
                    </VemtapText>
                  ) : null}
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
                      className={`font-sans-bold ${
                        index === 3
                          ? customer.segmentTone === 'brand'
                            ? 'text-primary'
                            : customer.segmentTone === 'success'
                              ? 'text-badge-discount-text'
                              : customer.segmentTone === 'tertiary'
                                ? 'text-secondary'
                                : 'text-tertiary'
                          : ''
                      }`}
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
                <Icon
                  name={customer.timestampIcon as IconName}
                  size={15}
                  color={colors.textTertiary}
                />
                <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                  {`${customer.firstSeen}`}
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
          );
        })}
      </View>

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
