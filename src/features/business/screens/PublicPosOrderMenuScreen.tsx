import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessInfoStrip,
  BusinessPanel,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
  type BusinessPillTone,
} from '@features/business/components/BusinessPrimitives';
import {
  publicPosMenuCategories,
  publicPosMenuItems,
  type PublicPosMenuItem,
} from '@features/business/data/businessPublicPosData';

const copy = strings.publicPosMenu;

const badgeTone: Record<PublicPosMenuItem['badgeTone'], BusinessPillTone> = {
  warning: 'warning',
  success: 'success',
  neutral: 'neutral',
  brand: 'brand',
};

export interface PublicPosOrderMenuScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenCart?: () => void;
  onShare?: () => void;
  onChangeTable?: () => void;
  onSearch?: () => void;
  onOpenFilters?: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onCustomize?: (itemId: string) => void;
  onAddItem?: (itemId: string) => void;
  onReviewOrder?: () => void;
}

/**
 * `public_pos_order_from_urban_grill_bistro` - the guest-facing menu. The hero
 * banner, category rail and dish cards are all one composition surface; the cart
 * hand-off and the sticky review bar are the only navigation this screen owns.
 */
export function PublicPosOrderMenuScreen({
  onBack,
  onOpenProfile,
  onOpenCart,
  onShare,
  onChangeTable,
  onSearch,
  onOpenFilters,
  onSelectCategory,
  onCustomize,
  onAddItem,
  onReviewOrder,
}: PublicPosOrderMenuScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        subtitle: copy.headerSubtitle,
        onBack,
        titleVariant: 'labelMd',
        showAvatar: false,
        titleAccessory: (
          <View className="mt-1 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-success" />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.kitchenLiveBadge}
            </VemtapText>
          </View>
        ),
        actions: [
          { icon: 'groceries', label: copy.cartActionLabel, onPress: onOpenCart },
          { icon: 'share', label: copy.shareActionLabel, onPress: onShare },
          {
            icon: 'accountCircle',
            label: copy.profileActionLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.activeTrayLabel}
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
                {copy.activeTrayMeta}
              </VemtapText>
            </View>
            <View className="min-w-[45%]">
              <Button
                label={copy.reviewOrderCta}
                labelVariant="labelMd"
                onPress={onReviewOrder}
                rightIcon={<Icon name="arrowForward" size={16} color={colors.surface} />}
              />
            </View>
          </View>
        </BusinessActionDock>
      }
    >
      <BusinessPanel>
        <View className="flex-row items-start gap-2.5">
          <View className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-tint">
            <Icon name="restaurant" size={20} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={1}
              >
                {copy.venueName}
              </VemtapText>
              <Icon name="verified" size={15} color={colors.success} />
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.venueMeta}
            </VemtapText>
            <View className="mt-1 flex-row flex-wrap items-center gap-2">
              <View className="flex-row items-center gap-1">
                <Icon name="star" size={13} color={colors.tertiary} />
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {copy.venueRating}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {copy.venueReviews}
                </VemtapText>
              </View>
              <View className="flex-row items-center gap-1">
                <Icon name="schedule" size={13} color={colors.textSecondary} />
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {copy.venuePrep}
                </VemtapText>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.tableTitle}
          onPress={onChangeTable}
          className="mt-3 flex-row items-center gap-2.5 rounded-field bg-surface-tint px-3 py-2.5 active:scale-[0.99]"
        >
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
            <Icon name="tableRestaurant" size={17} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.tableTitle}
            </VemtapText>
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.tableMeta}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.changeCta}
            </VemtapText>
            <Icon name="autorenew" size={15} color={colors.primary} />
          </View>
        </Pressable>
      </BusinessPanel>

      <View className="mt-3">
        <BusinessSearchTrigger
          placeholder={copy.searchPlaceholder}
          onPress={onSearch}
          onFilterPress={onOpenFilters}
          filterLabel={copy.filterCta}
        />
      </View>

      <View className="mt-3">
        <BusinessChipScroller>
          {publicPosMenuCategories.map(category => (
            <BusinessCountChip
              key={category.id}
              label={category.label}
              icon={category.icon}
              selected={category.id === 'combos'}
              onPress={() => onSelectCategory?.(category.id)}
            />
          ))}
        </BusinessChipScroller>
      </View>

      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2 rounded-field bg-surface-tint px-3 py-2.5">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="tableBar" size={15} color={colors.primary} />
          <VemtapText variant="caption" className="min-w-0 flex-1" numberOfLines={2}>
            {copy.orderingFor}
          </VemtapText>
        </View>
        <BusinessStatusPill
          label={copy.dineFreeBadge}
          tone="brand"
          className="shrink-0"
        />
      </View>

      <View className="mt-3 gap-2.5">
        {publicPosMenuItems.map(item => (
          <View
            key={item.id}
            className="overflow-hidden rounded-card bg-surface shadow-sm"
          >
            <View className="h-28 items-center justify-center bg-surface-container">
              <View className="items-center gap-1">
                <Icon
                  name={
                    item.special
                      ? 'grill'
                      : item.id === 'mojito'
                        ? 'glassCocktail'
                        : 'food'
                  }
                  size={26}
                  color={colors.textSecondary}
                />
                {item.badge ? (
                  <BusinessStatusPill
                    label={item.badge}
                    tone={badgeTone[item.badgeTone]}
                    icon={item.badgeTone === 'success' ? 'localOffer' : undefined}
                  />
                ) : null}
              </View>
            </View>
            <View className="p-3">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {item.name}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-0.5"
                numberOfLines={3}
              >
                {item.body}
              </VemtapText>
              <View className="mt-2.5 flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row flex-wrap items-baseline gap-1.5">
                  <VemtapText
                    variant="bodyMd"
                    className="font-sans-bold text-primary"
                    numberOfLines={1}
                  >
                    {item.price}
                  </VemtapText>
                  {item.wasPrice ? (
                    <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                      {`${copy.wasLabel} ${item.wasPrice}`}
                    </VemtapText>
                  ) : null}
                </View>
                <View className="shrink-0 flex-row items-center gap-2">
                  {item.special ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${copy.customizeCta} ${item.name}`}
                      onPress={() => onCustomize?.(item.id)}
                      className="min-h-9 flex-row items-center gap-1 rounded-field bg-surface-container px-2.5 active:scale-95"
                    >
                      <Icon name="tune" size={14} color={colors.text} />
                      <VemtapText
                        variant="caption"
                        className="font-sans-semibold"
                        numberOfLines={1}
                      >
                        {copy.customizeCta}
                      </VemtapText>
                    </Pressable>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item.cta} ${item.name}`}
                    onPress={() => onAddItem?.(item.id)}
                    className="min-h-9 flex-row items-center gap-1 rounded-field bg-primary px-3 active:scale-95"
                  >
                    <Icon name="plus" size={15} color={colors.surface} />
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-surface"
                      numberOfLines={1}
                    >
                      {item.cta}
                    </VemtapText>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <BusinessInfoStrip
        className="mt-3"
        icon="info"
        body={copy.dietaryNote}
        tone="subtle"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.viewCartCta}
        onPress={onOpenCart}
        className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm active:scale-[0.99]"
      >
        <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
          <Icon name="groceries" size={18} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.trayTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.payNote}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center gap-2">
          <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
            {'\u20a625,700'}
          </VemtapText>
          <Icon name="arrowForward" size={16} color={colors.text} />
        </View>
      </Pressable>
    </BusinessScreenLayout>
  );
}
