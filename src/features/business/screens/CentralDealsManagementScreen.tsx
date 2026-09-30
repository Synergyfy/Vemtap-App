import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessActionTile,
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessLinkRow,
  BusinessPanel,
  BusinessProgressMeter,
  BusinessScopePicker,
  BusinessSearchTrigger,
  BusinessSegmentTabs,
  BusinessSheetActionRow,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  businessOpsImageById,
  businessOpsMedia,
} from '@features/business/data/businessOpsImages';

cssInterop(Pressable, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.centralDeals;

const tabs = copy.tabs.map(tab => ({
  key: tab.key,
  label: tab.label,
  count: tab.count,
}));

/** 1 = full-bleed media cards, 2 = compact thumbnails, 3 = discovery + sheet. */
export type CentralDealsLayout = 'hero' | 'compact' | 'discovery';

export interface CentralDealsManagementScreenProps {
  layout?: CentralDealsLayout;
  onNotifications?: () => void;
  onCreateDeal?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
  onChangeScope?: (value: string) => void;
  onBoostDeal?: (dealId: string) => void;
  onEditDeal?: (dealId: string) => void;
  onPauseDeal?: (dealId: string) => void;
  onDealActions?: (dealId: string) => void;
  onViewLedger?: () => void;
  onOpenDeal?: (dealId: string) => void;
}

interface DealCardProps {
  deal: (typeof copy.variants)[number];
  imageUri: string;
  imageAlt: string;
  layout: CentralDealsLayout;
  onBoost?: () => void;
  onEdit?: () => void;
  onPause?: () => void;
  onMore?: () => void;
  onOpen?: () => void;
}

/**
 * One deal card for every central-deals layout. `hero` keeps the full-bleed
 * media banner and metrics bar; `compact` swaps in the 96px thumbnail row and
 * logistics lines. Only the shell changes — copy and metrics stay identical.
 */
function DealCard({
  deal,
  imageUri,
  imageAlt,
  layout,
  onBoost,
  onEdit,
  onPause,
  onMore,
  onOpen,
}: DealCardProps) {
  const isHero = layout !== 'compact';
  const urgent = layout === 'discovery' && deal.id === 'lunch';

  if (isHero) {
    return (
      <View className="overflow-hidden rounded-card-lg bg-surface shadow-sm">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={deal.title}
          onPress={onOpen}
          className="relative h-40 w-full bg-surface-container-high"
        >
          <BusinessProductImage
            source={{ uri: imageUri }}
            alt={imageAlt}
            className="h-full w-full"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
            locations={[0.4, 1]}
            className="absolute inset-0"
          />
          <View className="absolute left-2.5 top-2.5 flex-row items-center gap-1.5">
            <View className="rounded-full bg-badge-discount-bg px-2.5 py-1">
              <VemtapText
                variant="micro"
                className="font-sans-bold text-badge-discount-text"
              >
                {deal.discount}
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-surface px-2.5 py-1">
              <View
                className={`h-2 w-2 rounded-full ${urgent ? 'bg-tertiary' : 'bg-badge-discount-text'}`}
              />
              <VemtapText variant="micro" className="font-sans-medium">
                {deal.status}
              </VemtapText>
            </View>
          </View>
          <View className="absolute bottom-2.5 left-2.5 right-2.5 flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1 rounded-md bg-inverse-surface px-2 py-1">
              <Icon name="schedule" size={13} color={colors.inverseOnSurface} />
              <VemtapText
                variant="micro"
                className="text-inverse-on-surface"
                numberOfLines={1}
              >
                {deal.schedule}
              </VemtapText>
            </View>
            {onMore ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.moreActions}
                hitSlop={8}
                onPress={onMore}
                className="h-8 w-8 items-center justify-center rounded-full bg-inverse-surface active:scale-95"
              >
                <Icon name="more" size={18} color={colors.surface} />
              </Pressable>
            ) : null}
          </View>
        </Pressable>

        <View className="gap-3 p-3">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {deal.title}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-0.5"
                numberOfLines={2}
              >
                {deal.subtitle}
              </VemtapText>
            </View>
            <View className="shrink-0 items-end">
              <VemtapText variant="labelMd" className="font-sans-bold text-primary">
                {deal.price}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {deal.wasPrice}
              </VemtapText>
            </View>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Icon name="store" size={14} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {deal.branches}
            </VemtapText>
          </View>

          <BusinessProgressMeter
            label={`${deal.claims} · ${deal.redeemed}`}
            value={deal.conversion}
            percent={deal.percent}
            tone={
              layout === 'discovery' && deal.id === 'cold-brew' ? 'tertiary' : 'primary'
            }
          />

          <View className="flex-row gap-2">
            <BusinessActionTile
              label={copy.boostDeal}
              icon="rocket"
              tone="brand"
              onPress={onBoost}
            />
            <BusinessActionTile label={copy.edit} icon="edit" onPress={onEdit} />
            <BusinessActionTile label={copy.pause} icon="hourglass" onPress={onPause} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-3 rounded-card bg-surface p-3 shadow-sm">
      <View className="flex-row gap-3">
        <View className="relative h-24 w-24 shrink-0 overflow-hidden rounded-card bg-surface-container shadow-sm">
          <BusinessProductImage
            source={{ uri: imageUri }}
            alt={imageAlt}
            className="h-full w-full"
          />
          <View className="absolute left-1.5 top-1.5 rounded-full bg-badge-discount-bg px-1.5 py-0.5">
            <VemtapText
              variant="micro"
              className="font-sans-bold text-badge-discount-text"
            >
              {deal.discount}
            </VemtapText>
          </View>
        </View>
        <View className="min-w-0 flex-1 justify-between">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
              <VemtapText
                variant="caption"
                className="min-w-0 font-sans-medium text-badge-discount-text"
                numberOfLines={1}
              >
                {deal.status}
              </VemtapText>
            </View>
            {onMore ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.moreActions}
                hitSlop={8}
                onPress={onMore}
              >
                <Icon name="more" size={18} color={colors.textTertiary} />
              </Pressable>
            ) : null}
          </View>
          <VemtapText
            variant="labelMd"
            className="mt-1 font-sans-semibold"
            numberOfLines={1}
          >
            {deal.title}
          </VemtapText>
          <View className="mt-1 flex-row items-baseline gap-2">
            <VemtapText variant="labelMd" className="font-sans-bold text-primary">
              {deal.price}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" className="line-through">
              {deal.wasPrice}
            </VemtapText>
          </View>
        </View>
      </View>

      <BusinessProgressMeter
        label={`${deal.claims} · ${deal.redeemed}`}
        value={deal.conversion}
        percent={deal.percent}
      />

      <View className="flex-row items-center gap-2">
        <Icon name="locationOn" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1"
          numberOfLines={1}
        >
          {deal.logistics}
        </VemtapText>
      </View>

      <View className="flex-row gap-2">
        <BusinessActionTile
          label={copy.boostDeal}
          icon="rocket"
          tone="brand"
          onPress={onBoost}
        />
        <BusinessActionTile label={copy.edit} icon="edit" onPress={onEdit} />
        <BusinessActionTile label={copy.pause} icon="hourglass" onPress={onPause} />
      </View>
    </View>
  );
}

/**
 * Central deals management. `layout` selects between the three Stitch
 * treatments of the same screen: `hero` (full-bleed media cards + gradient
 * commission summary), `compact` (thumbnail cards + flash alert + net impact
 * footer) and `discovery` (branch selector header, live pulse, and the Deal
 * Actions bottom sheet).
 */
export function CentralDealsManagementScreen({
  layout = 'hero',
  onNotifications,
  onCreateDeal,
  onSearch,
  onFilter,
  onChangeScope,
  onBoostDeal,
  onEditDeal,
  onPauseDeal,
  onDealActions,
  onViewLedger,
  onOpenDeal,
}: CentralDealsManagementScreenProps) {
  const [tab, setTab] = useState('active');
  const [scope, setScope] = useState('wuse');
  const [sheetDeal, setSheetDeal] = useState<string | null>(null);

  const isDiscovery = layout === 'discovery';
  const isCompact = layout === 'compact';

  const header = isDiscovery
    ? {
        title:
          copy.branches2.find(option => option.value === scope)?.label ??
          copy.branches2[1].label,
        eyebrow: copy.branchSelector,
        centerTitle: false,
        titleVariant: 'labelMd' as const,
        actions: [
          {
            icon: 'search' as IconName,
            label: copy.searchPlaceholder,
            onPress: onSearch,
          },
          {
            icon: 'notifications' as IconName,
            label: copy.headerTitle,
            onPress: onNotifications,
          },
        ],
      }
    : isCompact
      ? {
          title: strings.businessHub.title,
          centerTitle: false,
          titleVariant: 'headingSm' as const,
          titleAccessory: <Icon name="verified" size={16} color={colors.primary} />,
          actions: [
            {
              icon: 'swapHoriz' as IconName,
              label: strings.businessHub.title,
              onPress: () => onChangeScope?.(''),
            },
          ],
        }
      : {
          title: copy.headerTitle,
          centerTitle: false,
          titleVariant: 'headingSm' as const,
          leading: (
            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
              <Icon name="storefront" size={19} color={colors.surface} />
            </View>
          ),
          eyebrow: copy.brandEyebrow,
          actions: [
            {
              icon: 'notifications' as IconName,
              label: copy.headerTitle,
              onPress: onNotifications,
            },
          ],
        };

  return (
    <BusinessScreenLayout
      header={header}
      contentContainerClassName="pb-8"
      footer={
        isDiscovery ? (
          <BusinessActionDock>
            <Button
              label={copy.createNewDeal}
              labelVariant="labelMd"
              onPress={onCreateDeal}
              leftIcon={<Icon name="plusCircle" size={20} color={colors.surface} />}
            />
          </BusinessActionDock>
        ) : undefined
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <BusinessScopePicker
          label={copy.branches2[1].label}
          value={scope}
          options={copy.branches2.map(option => ({
            label: option.label,
            value: option.value,
          }))}
          onChange={value => {
            setScope(value);
            onChangeScope?.(value);
          }}
        />
        {isDiscovery ? null : (
          <Button
            label={copy.createDeal}
            labelVariant="labelSm"
            size="sm"
            fullWidth={false}
            onPress={onCreateDeal}
            leftIcon={<Icon name="plus" size={16} color={colors.surface} />}
            className="rounded-full"
          />
        )}
      </View>

      {isCompact ? (
        <View className="mt-3 flex-row items-center justify-between gap-2 rounded-card bg-surface-tint p-3 shadow-sm">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface">
              <Icon name="fire" size={17} color={colors.tertiary} />
            </View>
            <VemtapText variant="labelSm" className="min-w-0 flex-1" numberOfLines={2}>
              {copy.flashAlert}
            </VemtapText>
          </View>
          <VemtapText
            variant="caption"
            className="shrink-0 font-sans-semibold text-primary"
          >
            {copy.live}
          </VemtapText>
        </View>
      ) : null}

      <View className="mt-3">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant={isDiscovery || isCompact ? 'headingMd' : 'bodyMd'}
              className={isDiscovery || isCompact ? 'font-sans-semibold' : undefined}
            >
              {isDiscovery
                ? copy.campaignsTitle
                : isCompact
                  ? copy.activeCampaigns
                  : copy.description}
            </VemtapText>
            {isDiscovery || isCompact ? (
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {isDiscovery ? copy.campaignsSubtitle : copy.activeCampaignsSubtitle}
              </VemtapText>
            ) : null}
          </View>
        </View>
      </View>

      {isDiscovery ? (
        <BusinessSearchTrigger
          className="mt-3"
          placeholder={copy.searchPlaceholder}
          filterLabel={copy.filter}
          onPress={onSearch}
          onFilterPress={onFilter}
        />
      ) : null}

      <View className="mt-3">
        <BusinessSegmentTabs
          tabs={tabs}
          value={tab}
          onChange={setTab}
          accessibilityLabel={copy.headerTitle}
        />
      </View>

      {isDiscovery ? (
        <View className="mt-3 gap-3 rounded-card-lg bg-surface-container p-4">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="insights" size={17} color={colors.primary} />
              <VemtapText
                variant="labelSm"
                className="min-w-0 flex-1 font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {copy.pulseTitle}
              </VemtapText>
            </View>
            <BusinessStatusPill label={copy.pulseSynced} tone="neutral" />
          </View>
          <View className="flex-row gap-2">
            {copy.pulseStats.map((stat, index) => (
              <View key={stat.label} className="min-w-0 flex-1">
                <VemtapText
                  variant="headingLg"
                  className={
                    index === 2
                      ? 'font-sans-bold text-badge-discount-text'
                      : 'font-sans-bold'
                  }
                  numberOfLines={1}
                >
                  {stat.value}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {stat.label}
                </VemtapText>
              </View>
            ))}
          </View>
          <BusinessProgressMeter
            label={copy.pulseProgressLabel}
            value={copy.pulseProgressDelta}
            percent={76}
          />
        </View>
      ) : null}

      <View className="mt-3 gap-3">
        {copy.variants.map(deal => {
          const image = businessOpsImageById[deal.id] ?? businessOpsMedia.dealLunch;
          return (
            <DealCard
              key={deal.id}
              deal={deal}
              imageUri={image.uri}
              imageAlt={image.alt}
              layout={layout}
              onBoost={() => onBoostDeal?.(deal.id)}
              onEdit={() => onEditDeal?.(deal.id)}
              onPause={() => onPauseDeal?.(deal.id)}
              onMore={isDiscovery ? () => setSheetDeal(deal.id) : undefined}
              onOpen={() => onOpenDeal?.(deal.id)}
            />
          );
        })}
      </View>

      {isCompact ? (
        <BusinessPanel
          tone="low"
          className="mt-4"
          icon="verified"
          title={copy.netImpactEyebrow}
        >
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="headingLg" className="font-sans-bold">
              {copy.netRevenue}
            </VemtapText>
            <BusinessStatusPill label={copy.zeroCommission} tone="success" />
          </View>
          <View className="h-px w-full bg-surface-container-highest" />
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5">
              <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
              <VemtapText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                className="min-w-0 flex-1"
              >
                {copy.zeroCommissionNote}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.ledgerStatement}
              hitSlop={8}
              onPress={onViewLedger}
            >
              <VemtapText variant="caption" className="font-sans-semibold text-primary">
                {copy.ledgerStatement}
              </VemtapText>
            </Pressable>
          </View>
        </BusinessPanel>
      ) : isDiscovery ? null : (
        <View className="mt-4 gap-3 overflow-hidden rounded-card-lg bg-surface-tint p-4">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                <Icon name="verified" size={18} color={colors.surface} />
              </View>
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-bold text-primary"
                numberOfLines={2}
              >
                {copy.commissionTitle}
              </VemtapText>
            </View>
            <BusinessStatusPill label={copy.live} tone="brand" />
          </View>
          <View>
            <VemtapText
              variant="micro"
              tone="secondary"
              className="font-sans-semibold uppercase tracking-wider"
            >
              {copy.netRevenueEyebrow}
            </VemtapText>
            <VemtapText variant="headingLg" className="font-sans-bold" numberOfLines={1}>
              {copy.netRevenue}
            </VemtapText>
          </View>
          <VemtapText variant="bodyMd" tone="secondary" className="leading-snug">
            {copy.commissionBody}
          </VemtapText>
          <View className="flex-row items-center justify-between gap-2 rounded-card bg-surface p-3">
            <BusinessLinkRow label={copy.ledgerLink} onPress={onViewLedger} />
            <Icon name="receipt" size={18} color={colors.textTertiary} />
          </View>
        </View>
      )}

      <BottomSheet
        visible={Boolean(sheetDeal)}
        onClose={() => setSheetDeal(null)}
        title={copy.sheetTitle}
      >
        <View className="gap-1 px-6 pb-4">
          {copy.sheetActions.map(action => (
            <BusinessSheetActionRow
              key={action.title}
              icon={action.icon as IconName}
              title={action.title}
              subtitle={action.subtitle}
              tone={action.icon === 'block' ? 'destructive' : 'brand'}
              onPress={() => {
                if (sheetDeal) onDealActions?.(sheetDeal);
                setSheetDeal(null);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </BusinessScreenLayout>
  );
}
