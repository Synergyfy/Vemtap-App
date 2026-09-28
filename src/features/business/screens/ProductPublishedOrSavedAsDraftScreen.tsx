import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { ProductStatusSnapshot } from '@features/business/components/BusinessProductContent';
import {
  businessMedia,
  productIdentity,
} from '@features/business/data/businessSetupData';

cssInterop(LinearGradient, { className: 'style' });

export type ProductPublishedStatus = 'live' | 'draft';

export interface ProductPublishedOrSavedAsDraftScreenProps {
  onBack: () => void;
  onMakeDeal?: () => void;
  onViewCatalog?: () => void;
  onAddAnother?: () => void;
  onStatusChange?: (status: ProductPublishedStatus) => void;
}

export function ProductPublishedOrSavedAsDraftScreen({
  onBack,
  onMakeDeal,
  onViewCatalog,
  onAddAnother,
  onStatusChange,
}: ProductPublishedOrSavedAsDraftScreenProps) {
  const [status, setStatus] = useState<ProductPublishedStatus>('live');
  const live = status === 'live';
  const changeStatus = (nextStatus: ProductPublishedStatus) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  };

  return (
    <BusinessScreenLayout
      header={{
        title: 'Product Published Or Saved As Draft',
        subtitle: 'Merchant Portal · Product Setup',
        stepBadge: 'Step 4 of 4',
        onBack,
        centerTitle: false,
      }}
      contentContainerClassName="pb-8"
    >
      <View className="items-center pt-4">
        <View className="relative my-2 h-16 w-16 items-center justify-center rounded-full bg-surface-tint shadow-sm">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary shadow-lg">
            <Icon name="checkCircle" size={26} color={colors.surface} />
          </View>
          <Icon name="autoAwesome" size={20} color={colors.tertiaryContainer} />
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingMd"
          className="mt-2 text-center text-heading-md"
        >
          {live ? 'Product is Live on Storefront!' : 'Product Saved as Draft'}
        </VemtapText>
        <VemtapText tone="secondary" className="mt-1 max-w-[320px] text-center">
          {live ? (
            <>
              Shoppers within{' '}
              <VemtapText className="font-sans-semibold text-text">3.5 km</VemtapText> can
              now discover, browse, and order this item in real-time.
            </>
          ) : (
            'Hidden from customer search. Safe to update, edit pricing, or publish whenever you are ready.'
          )}
        </VemtapText>
        <View
          accessibilityRole="tablist"
          accessibilityLabel="Product status"
          className="mt-4 w-full max-w-[342px] flex-row items-center rounded-full bg-surface-container p-1 shadow-inner"
        >
          <StatusTab
            label="Live on Storefront"
            selected={live}
            onPress={() => changeStatus('live')}
          />
          <StatusTab
            label="Saved as Draft"
            selected={!live}
            onPress={() => changeStatus('draft')}
          />
        </View>
      </View>

      <View className="mt-3 gap-4">
        <ProductStatusSnapshot
          image={businessMedia.ribeyeAlternate}
          imageAlt="Woodfire Aged Ribeye Steak"
          imageBadge="2 Locs"
          name={productIdentity.name}
          price={
            <VemtapText>
              ₦12,000{' '}
              <VemtapText className="text-caption text-text-secondary">to</VemtapText>{' '}
              ₦19,500
            </VemtapText>
          }
          statusLabel={live ? 'Active in Catalog' : 'Draft Mode'}
          statusTone={live ? 'success' : 'neutral'}
          catalogId={`ID #${productIdentity.catalogId}`}
          footer={
            <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-subtle p-2">
              <View className="flex-row items-center gap-1.5">
                <Icon name="inventory" size={16} color={colors.secondary} />
                <VemtapText variant="labelSm" tone="secondary">
                  48 units in stock
                </VemtapText>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Icon name="storefront" size={16} color={colors.secondary} />
                <VemtapText variant="labelSm" tone="secondary">
                  Victoria Island & Lekki 1
                </VemtapText>
              </View>
            </View>
          }
        />

        <View className="flex-row items-start gap-2 rounded-xl bg-surface-tint p-4">
          <Icon name="info" size={22} color={colors.primary} />
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
              {live ? 'Live Mode Enabled' : 'Draft Mode Stored Privately'}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5 leading-relaxed"
            >
              {live
                ? 'Live items can be ordered immediately by local shoppers browsing your storefront. You can toggle this to Draft at any time to temporarily pause orders.'
                : 'This item will NOT appear on customer maps, menus, or checkout flows until published.'}
            </VemtapText>
          </View>
        </View>

        <LinearGradient
          colors={[colors.surfaceTint, colors.surface, colors.surfaceContainerHigh]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="overflow-hidden rounded-xl p-4 shadow-xl"
        >
          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <BusinessStatusPill label="Growth Booster" tone="tertiary" icon="fire" />
              <VemtapText variant="caption" className="font-sans-semibold text-primary">
                Instant One-Tap Import
              </VemtapText>
            </View>
            <VemtapText variant="headingSm" className="text-heading-sm">
              Boost Foot Traffic with a VEMTAP Deal 🔥
            </VemtapText>
            <VemtapText tone="secondary">
              Transform this Ribeye Steak into a featured promotional voucher. Photos,
              pricing, and branches will pre-fill into Deal Studio automatically.
            </VemtapText>
            <View className="flex-row items-center gap-2 rounded-lg bg-surface/90 p-2 shadow-sm">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
                <Icon name="trendingUp" size={18} color={colors.badgeDiscountText} />
              </View>
              <VemtapText variant="labelSm" className="min-w-0 flex-1">
                Deals get{' '}
                <VemtapText className="font-sans-bold text-primary">
                  3.8x more views
                </VemtapText>{' '}
                on the Hyperlocal Map & Deals radar.
              </VemtapText>
            </View>
            <Button
              label="Make as a Deal 🔥"
              labelVariant="labelMd"
              className="mt-1 shadow-lg"
              rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
              onPress={onMakeDeal}
            />
          </View>
        </LinearGradient>

        <View className="gap-2 pt-1">
          <Button
            label="View in Products Catalog"
            labelVariant="labelMd"
            className="min-h-[50px] bg-surface-container"
            leftIcon={<Icon name="listView" size={20} color={colors.text} />}
            onPress={onViewCatalog}
          />
          <Button
            label="Add Another Product or Service"
            labelVariant="labelMd"
            variant="ghost"
            className="min-h-12"
            leftIcon={<Icon name="plus" size={18} color={colors.textSecondary} />}
            onPress={onAddAnother}
          />
        </View>
      </View>
    </BusinessScreenLayout>
  );
}

function StatusTab({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className={cn(
        'min-h-10 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-full px-2',
        selected ? 'bg-surface shadow-sm' : 'active:bg-surface-container-low',
      )}
      onPress={onPress}
    >
      <View
        className={cn(
          'h-2 w-2 shrink-0 rounded-full',
          selected ? 'bg-badge-discount-text' : 'bg-text-tertiary',
        )}
      />
      <VemtapText
        variant="labelMd"
        className={cn(
          'text-center',
          selected ? 'font-sans-semibold text-primary' : 'text-text-secondary',
        )}
      >
        {label}
      </VemtapText>
    </Pressable>
  );
}
