import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
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
import type { ProductDraft } from '@store/catalogueDraftStore';
import { useBusinessBranches } from '@features/business/hooks/useCatalogueMutations';

export interface ReviewProductSummaryScreenProps {
  /** The product being set up (`catalogueDraftStore`). */
  draft?: ProductDraft;
  publishing?: boolean;
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

/** "14,000" or "14000" → 14000; blank or invalid → null. */
function amount(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`;

const FULFILLMENT_LABELS: Record<string, string> = {
  pickup: 'In-store pickup',
  delivery: 'Delivery',
  dinein: 'Dine-in',
  'dine-in': 'Dine-in',
};

/**
 * Final check before publishing: everything shown is what the owner entered in
 * the earlier steps, so what they confirm is exactly what customers will see.
 */
export function ReviewProductSummaryScreen({
  draft,
  publishing = false,
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
  const liveBranches = useBusinessBranches();
  const price = amount(draft?.regularPrice);
  const compareAt = amount(draft?.compareAtPrice);
  const saving =
    price !== null && compareAt !== null && compareAt > price ? compareAt - price : 0;
  const variants = draft?.variants ?? [];
  const totalStock = variants.reduce((total, variant) => total + variant.inventory, 0);
  const photos = [draft?.mainImage, ...(draft?.galleryImages ?? [])].filter(
    (uri, index, all): uri is string => Boolean(uri) && all.indexOf(uri) === index,
  );
  const branches = (liveBranches.data ?? []).filter(branch =>
    (draft?.branchIds ?? []).includes(branch.id),
  );
  const fulfillment = draft?.fulfillmentModes ?? [];

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

      <View className="overflow-hidden rounded-card bg-surface shadow-md">
        <View className="relative h-56 w-full items-center justify-center bg-surface-container-high">
          {photos[0] ? (
            <BusinessProductImage
              source={{ uri: photos[0] }}
              alt={draft?.name || 'Product photo'}
              className="h-full w-full"
            />
          ) : (
            <View className="items-center gap-1">
              <Icon name="camera" size={32} color={colors.textTertiary} />
              <VemtapText variant="caption" tone="tertiary">
                No photos yet
              </VemtapText>
            </View>
          )}
          <View className="absolute left-3 top-3 flex-row flex-wrap items-center gap-1">
            {draft?.condition ? (
              <View className="flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2.5 py-1 shadow-sm">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-bold text-badge-discount-text"
                >
                  {draft.condition}
                </VemtapText>
              </View>
            ) : null}
            {photos.length ? (
              <View className="flex-row items-center gap-1 rounded-full bg-inverse-surface/85 px-2.5 py-1">
                <Icon name="camera" size={14} color={colors.inverseOnSurface} />
                <VemtapText variant="labelSm" className="text-inverse">
                  {`${photos.length} photo${photos.length === 1 ? '' : 's'}`}
                </VemtapText>
              </View>
            ) : null}
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
            {draft?.brand ? (
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1">
                <Icon name="storefront" size={15} color={colors.primary} />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="font-sans-medium"
                  numberOfLines={1}
                >
                  {draft.brand}
                </VemtapText>
              </View>
            ) : (
              <View className="flex-1" />
            )}
            <BusinessInlineAction
              label="Edit Basics"
              icon="forward"
              onPress={onEditBasics}
            />
          </View>
          <View>
            <VemtapText variant="headingMd" className="text-heading-md">
              {draft?.name || 'Untitled product'}
            </VemtapText>
            {draft?.categoryName ? (
              <VemtapText variant="caption" tone="tertiary" className="mt-1">
                {draft.categoryName}
              </VemtapText>
            ) : null}
          </View>
        </View>
      </View>

      <SetupCard>
        <ServiceSectionHeader
          boxedIcon
          title="Pricing & Variants"
          icon="payments"
          subtitle={
            variants.length
              ? `${variants.length} option${variants.length === 1 ? '' : 's'} configured`
              : 'Single price'
          }
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
                {price !== null ? naira(price) : 'Not set'}
              </VemtapText>
              {saving > 0 && compareAt !== null ? (
                <VemtapText tone="tertiary" className="line-through">
                  {naira(compareAt)}
                </VemtapText>
              ) : null}
            </View>
          </View>
          {saving > 0 ? (
            <BusinessStatusPill label={`Save ${naira(saving)}`} tone="success" />
          ) : null}
        </View>
        {variants.length ? (
          <>
            <VemtapText
              variant="labelSm"
              tone="secondary"
              className="font-sans-semibold uppercase tracking-wider"
            >
              Options
            </VemtapText>
            <ProductVariantList variants={variants.map(item => ({ ...item }))} readOnly />
          </>
        ) : null}
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          {variants.length ? (
            <View className="flex-row items-center gap-1.5">
              <Icon name="inventory" size={16} color={colors.primary} />
              <VemtapText variant="caption" tone="secondary">
                Total Stock:{' '}
                <VemtapText className="font-sans-semibold text-text">
                  {`${totalStock} unit${totalStock === 1 ? '' : 's'}`}
                </VemtapText>
              </VemtapText>
            </View>
          ) : (
            <View />
          )}
          {draft?.sku ? (
            <View className="rounded bg-surface-container px-2 py-0.5">
              <VemtapText className="text-on-secondary-fixed text-caption">
                SKU: {draft.sku}
              </VemtapText>
            </View>
          ) : null}
        </View>
      </SetupCard>

      <SetupCard>
        <ServiceSectionHeader
          boxedIcon
          title="Branch Availability"
          icon="hub"
          subtitle={`${branches.length} outlet${branches.length === 1 ? '' : 's'} serving this item`}
          actionLabel="Edit"
          onAction={onEditBranches}
        />
        {branches.length ? (
          <View className="gap-2">
            {branches.map(branch => (
              <View
                key={branch.id}
                className="gap-1 rounded-lg bg-surface-container-low p-3"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={1}
                  >
                    {branch.name}
                  </VemtapText>
                  {price !== null ? (
                    <VemtapText variant="labelMd" className="shrink-0 font-sans-bold">
                      {naira(price)}
                    </VemtapText>
                  ) : null}
                </View>
                <View className="flex-row items-center gap-1">
                  <View
                    className={`h-1.5 w-1.5 rounded-full ${draft?.inStock === false ? 'bg-error' : 'bg-badge-discount-text'}`}
                  />
                  <VemtapText variant="caption" tone="secondary">
                    {draft?.inStock === false ? 'Out of stock' : 'In stock'}
                  </VemtapText>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <VemtapText variant="caption" tone="secondary">
            No branch selected yet. Pick at least one so customers can find this item.
          </VemtapText>
        )}
      </SetupCard>

      <SetupCard>
        <ServiceSectionHeader
          boxedIcon
          title="Fulfillment"
          icon="delivery"
          subtitle="How customers get this item"
          actionLabel="Edit"
          onAction={onEditFulfillment}
        />
        {fulfillment.length ? (
          <View className="gap-2">
            {fulfillment.map(mode => (
              <View
                key={mode}
                className="flex-row items-center gap-3 rounded-lg bg-surface-subtle p-3"
              >
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
                  <Icon name="check" size={16} color={colors.badgeDiscountText} />
                </View>
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold"
                >
                  {FULFILLMENT_LABELS[mode] ?? mode}
                </VemtapText>
              </View>
            ))}
          </View>
        ) : (
          <VemtapText variant="caption" tone="secondary">
            No fulfillment option chosen yet.
          </VemtapText>
        )}
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
          {draft?.description ? `“${draft.description}”` : 'No description yet.'}
        </VemtapText>
        {draft?.attributes.length ? (
          <View className="flex-row flex-wrap gap-2">
            {draft.attributes.map(attribute => (
              <BusinessStatusPill key={attribute} label={attribute} tone="neutral" />
            ))}
          </View>
        ) : null}
      </SetupCard>

      {onInspectPreview ? (
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
                  See how customers will see this item
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
      ) : null}

      <View className="gap-3">
        <Button
          label={publishing ? 'Publishing…' : 'Publish Product to Storefront 🚀'}
          labelVariant="labelMd"
          labelNumberOfLines={2}
          className="shadow-lg"
          disabled={publishing}
          onPress={onPublish}
        />
        <Button
          label={publishing ? 'Saving…' : 'Save as Draft'}
          labelVariant="labelMd"
          variant="secondary"
          className="min-h-12 border-0 bg-surface-container"
          disabled={publishing}
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
