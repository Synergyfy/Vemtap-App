import React from 'react';
import { StyleSheet, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import type { Region } from 'react-native-maps';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { LocationMapView } from '@components/shared/LocationMapView';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessInlineAction,
  BusinessProductImage,
  BusinessProgress,
  BusinessScreenLayout,
  BusinessStatusPill,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import { ServiceSectionHeader } from '@features/business/components/ServiceFlowPrimitives';
import { ProductVariantList } from '@features/business/components/BusinessProductContent';
import {
  businessMedia,
  productBranches,
  productIdentity,
  productVariants,
} from '@features/business/data/businessSetupData';

export interface ReviewProductSummaryScreenProps {
  onBack: () => void;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  onInspectPreview?: () => void;
  onEditMedia?: () => void;
  onEditBasics?: () => void;
  onEditPricing?: () => void;
  onEditBranches?: () => void;
  onEditFulfillment?: () => void;
  onEditDescription?: () => void;
}

cssInterop(View, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const abujaRegion: Region = {
  latitude: 9.0765,
  longitude: 7.3986,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export function ReviewProductSummaryScreen({
  onBack,
  onPublish,
  onSaveDraft,
  onInspectPreview,
  onEditMedia,
  onEditBasics,
  onEditPricing,
  onEditBranches,
  onEditFulfillment,
  onEditDescription,
}: ReviewProductSummaryScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: 'Review Product Summary',
        subtitle: 'Merchant Portal · Product Setup',
        onBack,
        stepBadge: 'Step 4 of 4',
        centerTitle: false,
      }}
      contentContainerClassName="gap-6 pb-12"
    >
      <BusinessProgress
        label="Step 4 of 4: Final Review"
        percent={100}
        completionLabel="100% Complete"
      />

      <View className="flex-row items-start gap-3 rounded-xl bg-surface-tint p-4 shadow-sm">
        <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon name="verified" size={20} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="headingSm">Ready for customers</VemtapText>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            All regulatory labels and branch logistics match VEMTAP Instant Commerce
            standards.
          </VemtapText>
        </View>
      </View>

      <View className="overflow-hidden rounded-card bg-surface shadow-md">
        <View className="relative h-56 w-full bg-surface-container-high">
          <BusinessProductImage
            source={businessMedia.ribeyeAlternate}
            alt="Woodfire seared aged ribeye steak with rosemary potatoes"
            className="h-full w-full"
          />
          <View className="absolute left-3 top-3 flex-row flex-wrap items-center gap-1">
            <View className="flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2.5 py-1 shadow-sm">
              <Icon name="fire" size={14} color={colors.badgeDiscountText} />
              <VemtapText
                variant="labelSm"
                className="font-sans-bold text-badge-discount-text"
              >
                Fresh / Made to order
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-inverse-surface/85 px-2.5 py-1">
              <Icon name="camera" size={14} color={colors.inverseOnSurface} />
              <VemtapText variant="labelSm" className="text-inverse">
                4 Photos
              </VemtapText>
            </View>
          </View>
          <Button
            label="Edit Media"
            labelVariant="labelSm"
            variant="outline"
            size="sm"
            fullWidth={false}
            className="absolute bottom-3 right-3 min-h-9 rounded-full border-0 bg-surface/90 px-3"
            leftIcon={<Icon name="edit" size={16} color={colors.primary} />}
            onPress={onEditMedia}
          />
        </View>
        <View className="gap-3 p-4">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1">
              <Icon name="storefront" size={15} color={colors.primary} />
              <VemtapText
                variant="caption"
                tone="secondary"
                className="font-sans-medium"
                numberOfLines={1}
              >
                {productIdentity.brand}
              </VemtapText>
            </View>
            <BusinessInlineAction
              label="Edit Basics"
              icon="forward"
              onPress={onEditBasics}
            />
          </View>
          <View>
            <VemtapText variant="headingMd" className="text-heading-md">
              {productIdentity.name}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" className="mt-1">
              {productIdentity.categoryPath}
            </VemtapText>
          </View>
        </View>
      </View>

      <SetupCard>
        <ServiceSectionHeader
          boxedIcon
          title="Pricing & Variants"
          icon="payments"
          subtitle="3 sizes configured"
          actionLabel="Edit"
          onAction={onEditPricing}
        />
        <View className="flex-row items-center justify-between gap-3 rounded-xl bg-surface-subtle p-3">
          <View className="min-w-0">
            <VemtapText variant="caption" tone="secondary">
              Display Base Price
            </VemtapText>
            <View className="mt-0.5 flex-row flex-wrap items-baseline gap-2">
              <VemtapText variant="headingMd" className="font-sans-bold text-heading-md">
                ₦14,000
              </VemtapText>
              <VemtapText tone="tertiary" className="line-through">
                ₦16,000
              </VemtapText>
            </View>
          </View>
          <BusinessStatusPill label="Save ₦2,000" tone="success" />
        </View>
        <VemtapText
          variant="labelSm"
          tone="secondary"
          className="font-sans-semibold uppercase tracking-wider"
        >
          Active Portions
        </VemtapText>
        <ProductVariantList
          variants={productVariants.map(item => ({ ...item }))}
          readOnly
        />
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-1.5">
            <Icon name="inventory" size={16} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary">
              Total Stock:{' '}
              <VemtapText className="font-sans-semibold text-text">48 units</VemtapText>
            </VemtapText>
          </View>
          <View className="rounded bg-surface-container px-2 py-0.5">
            <VemtapText className="text-on-secondary-fixed text-caption">
              SKU: {productIdentity.sku}
            </VemtapText>
          </View>
        </View>
      </SetupCard>

      <SetupCard>
        <ServiceSectionHeader
          boxedIcon
          title="Branch Availability"
          icon="hub"
          subtitle="2 Outlets serving this item"
          actionLabel="Edit"
          onAction={onEditBranches}
        />
        <View className="relative h-28 overflow-hidden rounded-lg bg-surface-container shadow-sm">
          <LocationMapView
            region={abujaRegion}
            style={StyleSheet.absoluteFill}
            scrollEnabled={false}
            zoomEnabled={false}
          />
          <View className="absolute bottom-2 left-2 flex-row items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 shadow-sm">
            <Icon name="pinDrop" size={14} color={colors.primary} />
            <VemtapText variant="caption" className="font-sans-semibold">
              Abuja Central Metros
            </VemtapText>
          </View>
        </View>
        <View className="gap-2">
          {productBranches.slice(0, 2).map((branch, index) => (
            <View
              key={branch.id}
              className="gap-1 rounded-lg bg-surface-container-low p-3"
            >
              <View className="flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-row flex-wrap items-center gap-1.5">
                  <VemtapText variant="labelMd" className="font-sans-semibold">
                    {branch.name}
                  </VemtapText>
                  {index === 0 ? <BusinessStatusPill label="Flagship" /> : null}
                </View>
                <VemtapText variant="labelMd" className="shrink-0 font-sans-bold">
                  {branch.price}
                </VemtapText>
              </View>
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center gap-1">
                  <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
                  <VemtapText variant="caption" tone="secondary">
                    {branch.stock}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="caption"
                  tone={index === 0 ? 'tertiary' : 'error'}
                  className={cn('text-right', index === 1 && 'font-sans-medium')}
                >
                  {index === 0 ? branch.priceNote : `Customized Price (+₦500)`}
                </VemtapText>
              </View>
            </View>
          ))}
        </View>
        <View className="flex-row items-center gap-2 rounded-lg bg-surface-tint p-2.5">
          <Icon name="tune" size={18} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
            <VemtapText className="font-sans-semibold text-text">
              Dynamic Mode:
            </VemtapText>{' '}
            Prices are independently adjusted by branch operational costs.
          </VemtapText>
        </View>
      </SetupCard>

      <SetupCard>
        <ServiceSectionHeader
          boxedIcon
          title="Fulfillment & Dispatch"
          icon="delivery"
          subtitle="Delivery rules for this item"
          actionLabel="Edit"
          onAction={onEditFulfillment}
        />
        <View className="gap-2">
          <FulfillmentRow
            title="In-Store Pickup / Dine-In Walk"
            subtitle="Ready in 15 mins upon confirmation"
            status="Instant"
            statusTone="success"
          />
          <FulfillmentRow
            title="Local Delivery / Express Dispatch"
            subtitle="Hot insulated bike courier"
            status="20 - 30 mins"
            statusTone="brand"
          />
          <View className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-container-low/70 p-3 opacity-80">
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-error-container">
                <Icon name="block" size={16} color={colors.error} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  tone="secondary"
                  className="font-sans-medium"
                >
                  Interstate Cargo Waybill
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  Fresh cooked items cannot travel interstate
                </VemtapText>
              </View>
            </View>
            <VemtapText
              variant="labelSm"
              className="shrink-0 font-sans-semibold text-error"
            >
              Perishable
            </VemtapText>
          </View>
        </View>
      </SetupCard>

      <SetupCard>
        <ServiceSectionHeader
          boxedIcon
          title="Description & Story"
          icon="book"
          actionLabel="Edit"
          onAction={onEditDescription}
        />
        <VemtapText
          tone="secondary"
          className="rounded-xl bg-surface-subtle p-3 leading-relaxed"
        >
          “{productIdentity.description}”
        </VemtapText>
        <View className="flex-row flex-wrap gap-2">
          <BusinessStatusPill label="Gluten-free" icon="lightbulb" tone="neutral" />
          <BusinessStatusPill label="Halal certified" icon="starFilled" tone="neutral" />
          <BusinessStatusPill label="Eco packaging" icon="sync" tone="neutral" />
        </View>
      </SetupCard>

      <View className="overflow-hidden rounded-xl shadow-sm">
        <LinearGradient
          colors={['#EDF2FF', colors.surfaceTint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center justify-between gap-3 p-4"
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <Icon name="visibility" size={22} color={colors.surface} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-bold">
                Consumer View Preview
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                Simulate live tap-to-order screen
              </VemtapText>
            </View>
          </View>
          <Button
            label="Inspect"
            labelVariant="labelSm"
            variant="outline"
            size="sm"
            fullWidth={false}
            className="min-h-10 border-0 bg-surface px-4"
            onPress={onInspectPreview}
          />
        </LinearGradient>
      </View>

      <View className="gap-3">
        <Button
          label="Publish Product to Storefront 🚀"
          labelVariant="labelMd"
          labelNumberOfLines={2}
          className="shadow-lg"
          onPress={onPublish}
        />
        <Button
          label="Save as Draft"
          labelVariant="labelMd"
          variant="secondary"
          className="min-h-12 border-0 bg-surface-container"
          leftIcon={<Icon name="bookmark" size={18} color={colors.text} />}
          onPress={onSaveDraft}
        />
        <VemtapText variant="caption" tone="tertiary" className="px-4 text-center">
          You can edit details or convert this item into a promotional deal anytime from
          your merchant dashboard.
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}

function FulfillmentRow({
  title,
  subtitle,
  status,
  statusTone,
}: {
  title: string;
  subtitle: string;
  status: string;
  statusTone: 'brand' | 'success';
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-subtle p-3">
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
          <Icon name="check" size={16} color={colors.badgeDiscountText} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary">
            {subtitle}
          </VemtapText>
        </View>
      </View>
      <VemtapText
        variant="labelSm"
        className={cn(
          'shrink-0 font-sans-bold',
          statusTone === 'success' ? 'text-success' : 'text-primary',
        )}
      >
        {status}
      </VemtapText>
    </View>
  );
}
