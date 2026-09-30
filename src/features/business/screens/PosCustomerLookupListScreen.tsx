import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessInfoStrip,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  posCustomerCards,
  posCustomerSegments,
  type PosCustomerCard,
} from '@features/business/data/businessPosCustomerData';

const copy = strings.posCustomerLookupList;

/** Segment dot colours, keyed by the chip that owns it. */
const segmentDot: Record<PosCustomerCard['tier'], string> = {
  vip: 'bg-primary',
  regular: 'bg-surface-container-highest',
  table: 'bg-surface-container-highest',
  new: 'bg-success',
};

export interface PosCustomerLookupListScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSelectBranch?: () => void;
  onSyncRegister?: () => void;
  onOpenCrmHub?: () => void;
  onSearch?: () => void;
  onScan?: () => void;
  onNewCustomer?: () => void;
  onSelectSegment?: (segmentId: string) => void;
  onAttach?: (customerId: string) => void;
  onOpenDossier?: (customerId: string) => void;
  onOpenOverflow?: (customerId: string) => void;
}

/**
 * `pos_customer_lookup_2` - the till CRM list. Segment chips filter patrons and
 * each card carries its own attach/dossier pair; the design's own bottom tab
 * bar is intentionally not rendered (BusinessTabBar owns navigation).
 */
export function PosCustomerLookupListScreen({
  onBack,
  onOpenProfile,
  onSelectBranch,
  onSyncRegister,
  onOpenCrmHub,
  onSearch,
  onScan,
  onNewCustomer,
  onSelectSegment,
  onAttach,
  onOpenDossier,
  onOpenOverflow,
}: PosCustomerLookupListScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.branchLabel,
        onBack,
        showAvatar: false,
        titleAccessory: (
          <View className="mt-1 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-success" />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.onlineBadge}
            </VemtapText>
          </View>
        ),
        actions: [
          { icon: 'sync', label: copy.syncActionLabel, onPress: onSyncRegister },
          {
            icon: 'accountCircle',
            label: copy.profileActionLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <View className="h-2 w-2 shrink-0 rounded-full bg-success" />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.tillStatus}
          </VemtapText>
        </View>
        <BusinessStatusPill label={copy.linkBadge} tone="brand" icon="bolt" />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.branchLabel}
        onPress={onSelectBranch}
        className="mt-2 min-h-11 flex-row items-center gap-1.5 self-start rounded-lg px-2 active:bg-surface-tint"
      >
        <Icon name="store" size={18} color={colors.primary} />
        <VemtapText variant="headingSm" className="font-sans-semibold" numberOfLines={1}>
          {copy.branchLabel}
        </VemtapText>
        <Icon name="expandMore" size={18} color={colors.primary} />
      </Pressable>

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

      <View className="mt-3 flex-row items-center gap-2">
        <View className="min-w-0 flex-1">
          <BusinessSearchTrigger
            placeholder={copy.searchPlaceholder}
            onPress={onSearch}
            surface="bordered"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.searchPlaceholder}
          onPress={onScan}
          className="h-11 w-11 shrink-0 items-center justify-center rounded-field bg-surface-container-low active:scale-95"
        >
          <Icon name="barcodeScan" size={20} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.newCta}
          onPress={onNewCustomer}
          className="h-11 w-11 shrink-0 items-center justify-center rounded-field bg-primary active:scale-95"
        >
          <Icon name="personAdd" size={20} color={colors.surface} />
        </Pressable>
      </View>

      <View className="mt-3">
        <BusinessChipScroller>
          {posCustomerSegments.map(segment => (
            <BusinessCountChip
              key={segment.id}
              label={segment.label}
              icon={segment.icon}
              count={segment.id === 'all' ? '4' : undefined}
              selected={segment.active}
              onPress={() => onSelectSegment?.(segment.id)}
            />
          ))}
        </BusinessChipScroller>
      </View>

      <View className="mt-3 gap-2.5">
        {posCustomerCards.map(customer => (
          <View key={customer.id} className="rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-start gap-3">
              <BusinessInitialsAvatar
                initials={customer.initials}
                size="md"
                tone={
                  customer.tier === 'vip'
                    ? 'brand'
                    : customer.tier === 'new'
                      ? 'success'
                      : 'neutral'
                }
              />
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={1}
                  >
                    {customer.name}
                  </VemtapText>
                  <View
                    className={`h-2 w-2 shrink-0 rounded-full ${segmentDot[customer.tier]}`}
                  />
                </View>
                <BusinessStatusPill
                  label={customer.tierLabel}
                  tone={customer.tier === 'vip' ? 'brand' : 'neutral'}
                  className="mt-1 self-start"
                />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-1"
                  numberOfLines={1}
                >
                  {customer.phone}
                  {customer.email ? `  \u2022  ${customer.email}` : ''}
                </VemtapText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.optionsLabel.replace('{name}', customer.name)}
                onPress={() => onOpenOverflow?.(customer.id)}
                hitSlop={8}
                className="h-8 w-8 shrink-0 items-center justify-center rounded-full active:bg-surface-container"
              >
                <Icon name="more" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View className="mt-2 flex-row flex-wrap items-center gap-2 rounded-field bg-surface-tint px-2.5 py-2">
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {customer.pointsLabel}
                </VemtapText>
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {customer.pointsValue}
                </VemtapText>
              </View>
              {customer.pendingPoints ? (
                <View className="shrink-0 items-end">
                  <VemtapText variant="micro" tone="success" numberOfLines={1}>
                    {customer.pendingPoints}
                  </VemtapText>
                </View>
              ) : null}
            </View>

            {customer.expanded ? (
              <View className="mt-2 gap-2">
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { label: copy.visitsLabel, value: copy.visitsValue },
                    { label: copy.spendLabel, value: copy.spendValue },
                    { label: copy.lastVisitLabel, value: copy.lastVisitValue },
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
                <View className="flex-row items-center gap-2 rounded-field bg-warning-container px-2.5 py-2">
                  <Icon name="localOffer" size={15} color={colors.tertiary} />
                  <VemtapText
                    variant="caption"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={1}
                  >
                    {customer.dealTitle}
                  </VemtapText>
                  <BusinessStatusPill label={copy.autoApplyBadge} tone="warning" />
                </View>
              </View>
            ) : (
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-2"
                numberOfLines={1}
              >
                {`${copy.lastVisitPrefix} ${customer.lastVisit}`}
              </VemtapText>
            )}

            <View className="mt-3 flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.attachLabel
                  .replace('{action}', customer.attachCta)
                  .replace('{name}', customer.name)}
                onPress={() => onAttach?.(customer.id)}
                className="min-h-11 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-primary active:scale-[0.98]"
              >
                <Icon name="link" size={16} color={colors.surface} />
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-surface"
                  numberOfLines={1}
                >
                  {customer.attachCta}
                </VemtapText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.attachLabel
                  .replace('{action}', customer.dossierCta)
                  .replace('{name}', customer.name)}
                onPress={() => onOpenDossier?.(customer.id)}
                className="min-h-11 shrink-0 flex-row items-center justify-center gap-1 rounded-field bg-surface-container px-3 active:scale-[0.98]"
              >
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {customer.dossierCta}
                </VemtapText>
                <Icon name="arrowForward" size={15} color={colors.text} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </BusinessScreenLayout>
  );
}
