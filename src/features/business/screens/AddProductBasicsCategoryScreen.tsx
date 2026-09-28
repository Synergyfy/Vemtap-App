import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessActionDock,
  BusinessCheckRow,
  BusinessProductImage,
  BusinessProgress,
  BusinessScreenLayout,
  BusinessTextArea,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import {
  businessMedia,
  productIdentity,
} from '@features/business/data/businessSetupData';

export type ProductBasicsValue = {
  title: string;
  brand: string;
  unbranded: boolean;
  categoryPath: string;
  description: string;
  condition: 'Fresh / New' | 'Packaged' | 'Surplus';
};

export interface AddProductBasicsCategoryScreenProps {
  onBack: () => void;
  onContinue?: (value: ProductBasicsValue) => void;
  onSaveDraft?: (value: ProductBasicsValue) => void;
  onChangePhoto?: () => void;
  onChangeCategory?: (level: 'primary' | 'sub' | 'classification') => void;
  onAddHighlight?: (highlight: string) => void;
}

const conditions: Array<{
  id: ProductBasicsValue['condition'];
  label: string;
  detail: string;
  icon: 'lightbulb' | 'inventory' | 'sync';
}> = [
  { id: 'Fresh / New', label: 'Fresh / New', detail: 'Made to order', icon: 'lightbulb' },
  { id: 'Packaged', label: 'Packaged', detail: 'Sealed box', icon: 'inventory' },
  { id: 'Surplus', label: 'Surplus', detail: 'Special batch', icon: 'sync' },
];

const highlights = ['Gluten-free', 'Halal certified', 'Eco packaging'];

export function AddProductBasicsCategoryScreen({
  onBack,
  onContinue,
  onSaveDraft,
  onChangePhoto,
  onChangeCategory,
  onAddHighlight,
}: AddProductBasicsCategoryScreenProps) {
  const [title, setTitle] = useState<string>(productIdentity.basicsTitle);
  const [brand, setBrand] = useState<string>(productIdentity.brand);
  const [unbranded, setUnbranded] = useState(false);
  const [description, setDescription] = useState<string>(productIdentity.description);
  const [condition, setCondition] =
    useState<ProductBasicsValue['condition']>('Fresh / New');
  const value = useMemo(
    () => ({
      title,
      brand,
      unbranded,
      categoryPath: productIdentity.categoryPath,
      description,
      condition,
    }),
    [brand, condition, description, title, unbranded],
  );

  return (
    <BusinessScreenLayout
      header={{
        title: 'Add New Product',
        eyebrow: 'Step 2 of 4',
        onBack,
        actionLabel: 'Draft',
        onAction: () => onSaveDraft?.(value),
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label="Continue to Pricing & Inventory"
            labelVariant="labelMd"
            labelNumberOfLines={2}
            className="min-h-[52px] shadow-lg"
            rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
            onPress={() => onContinue?.(value)}
          />
          <Button
            label="Save as Draft & Exit"
            labelVariant="labelMd"
            variant="ghost"
            className="min-h-9"
            leftIcon={<Icon name="save" size={16} color={colors.textSecondary} />}
            onPress={() => onSaveDraft?.(value)}
          />
        </BusinessActionDock>
      }
    >
      <View className="gap-2">
        <BusinessProgress
          label="Step 1 of 4: Product Basics"
          percent={25}
          completionLabel="25% completed"
          segments={4}
        />
        <VemtapText variant="caption" tone="secondary">
          Enter essential item details just like top retail marketplaces (Jumia, Temu).
        </VemtapText>
      </View>

      <View className="mt-2 gap-6">
        <SetupCard className="gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <VemtapText variant="headingSm" className="text-heading-sm">
                  Product Media
                </VemtapText>
                <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-badge-discount-text"
                  >
                    Required
                  </VemtapText>
                </View>
              </View>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                Up to 6 high-res shots
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Photo guidelines"
              hitSlop={8}
              className="flex-row items-center gap-1"
              onPress={onChangePhoto}
            >
              <Icon name="help" size={16} color={colors.primary} />
              <VemtapText variant="caption" className="font-sans-medium text-primary">
                Guidelines
              </VemtapText>
            </Pressable>
          </View>

          <View className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-container-low">
            <BusinessProductImage
              source={businessMedia.ribeyeCover}
              alt="Woodfire seared Angus ribeye steak served on a rustic slate board"
              className="h-full w-full"
            />
            <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-full bg-inverse-surface/85 px-2.5 py-1 shadow-sm">
              <Icon name="star" size={14} color={colors.badgeDiscountBg} />
              <VemtapText variant="caption" className="text-inverse font-sans-semibold">
                Cover Photo
              </VemtapText>
            </View>
            <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 shadow-sm">
              <Icon name="drag" size={14} color={colors.text} />
              <VemtapText variant="caption" className="font-sans-medium">
                Drag to arrange
              </VemtapText>
            </View>
            <Button
              label="Change"
              labelVariant="labelSm"
              variant="outline"
              size="sm"
              fullWidth={false}
              className="absolute bottom-3 right-3 min-h-9 rounded-lg border-0 bg-surface/95 px-3"
              leftIcon={<Icon name="imagePlus" size={16} color={colors.primary} />}
              onPress={onChangePhoto}
            />
          </View>

          <View className="mt-1 flex-row gap-1">
            {[
              businessMedia.ribeyeThumbnailOne,
              businessMedia.ribeyeThumbnailTwo,
              businessMedia.ribeyeThumbnailThree,
            ].map((source, index) => (
              <View
                key={source.uri}
                className={cn(
                  'relative aspect-square flex-1 overflow-hidden rounded-lg bg-surface-container-high shadow-sm',
                  index === 0 && 'border-2 border-primary',
                )}
              >
                <BusinessProductImage
                  source={source}
                  alt={`Product media thumbnail ${index + 1}`}
                  className="h-full w-full"
                />
                <View className="absolute bottom-0.5 left-0.5 rounded bg-surface-dark/75 px-1">
                  <VemtapText className="text-inverse font-sans-bold text-micro">
                    {index + 1}
                  </VemtapText>
                </View>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add product photo"
              className="aspect-square flex-1 flex-col items-center justify-center rounded-lg bg-surface-container-low active:scale-95"
              onPress={onChangePhoto}
            >
              <Icon name="plus" size={20} color={colors.primary} />
              <VemtapText className="mt-0.5 text-micro text-text-secondary">
                Add
              </VemtapText>
            </Pressable>
            <View className="aspect-square flex-1 items-center justify-center rounded-lg bg-surface-container-low/60">
              <Icon name="camera" size={18} color={colors.outline} />
            </View>
          </View>

          <View className="flex-row items-start gap-2 rounded-xl bg-surface-tint p-3">
            <Icon name="lightbulb" size={20} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              <VemtapText className="font-sans-semibold text-primary">
                Pro Tip:
              </VemtapText>{' '}
              Clear, well-lit photos on clean neutral backgrounds unlock{' '}
              <VemtapText className="font-sans-semibold text-primary">
                3x higher customer engagement
              </VemtapText>{' '}
              and faster checkouts.
            </VemtapText>
          </View>
        </SetupCard>

        <SetupCard>
          <View className="gap-1">
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                Product Title <VemtapText className="text-error">*</VemtapText>
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary">
                {title.length} / 80
              </VemtapText>
            </View>
            <Input
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              accessibilityLabel="Product Title"
              placeholder="e.g. Woodfire Aged Angus Ribeye..."
              containerClassName="gap-0"
              className="bg-surface-subtle"
              fieldClassName="bg-surface-subtle"
              trailingIcon={<Icon name="close" size={18} color={colors.textTertiary} />}
              onTrailingIconPress={() => setTitle('')}
            />
          </View>
          <View className="gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              Brand or Kitchen Producer
            </VemtapText>
            <Input
              value={brand}
              onChangeText={setBrand}
              editable={!unbranded}
              accessibilityLabel="Brand or Kitchen Producer"
              placeholder="Search or enter brand name"
              containerClassName="gap-0"
              className="bg-surface-subtle"
              fieldClassName="bg-surface-subtle"
              leadingIcon={
                <Icon name="storefront" size={20} color={colors.textTertiary} />
              }
            />
            <BusinessCheckRow
              title="This item is unbranded, artisanal, or homemade"
              selected={unbranded}
              onPress={() => {
                const next = !unbranded;
                setUnbranded(next);
                setBrand(next ? 'Unbranded / Homemade' : productIdentity.brand);
              }}
              className="-ml-1 mt-1 bg-transparent p-0"
            />
          </View>
        </SetupCard>

        <SetupCard className="gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <VemtapText variant="headingSm" className="text-heading-sm">
                Category Placement
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                Helps buyers locate your item across channels
              </VemtapText>
            </View>
            <Icon name="category" size={22} color={colors.primary} />
          </View>
          <View className="gap-2 rounded-xl bg-surface-subtle p-3">
            <CategoryLevel
              label="Primary Category"
              value="Food & Dining"
              icon="restaurant"
              active
              onPress={() => onChangeCategory?.('primary')}
            />
            <View className="ml-9 h-px bg-surface-container-high" />
            <CategoryLevel
              label="Sub-Category"
              value="Grill, Steaks & BBQ"
              icon="grill"
              onPress={() => onChangeCategory?.('sub')}
            />
            <View className="ml-9 h-px bg-surface-container-high" />
            <CategoryLevel
              label="Item Classification"
              value={productIdentity.itemClassification}
              icon="fire"
              onPress={() => onChangeCategory?.('classification')}
            />
          </View>
        </SetupCard>

        <SetupCard>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
              Description & Highlights
            </VemtapText>
            <View className="shrink-0 flex-row items-center gap-1">
              <Icon name="autoAwesome" size={14} color={colors.badgeDiscountText} />
              <VemtapText variant="caption" className="text-badge-discount-text">
                AI Polish Ready
              </VemtapText>
            </View>
          </View>
          <BusinessTextArea
            value={description}
            onChangeText={setDescription}
            accessibilityLabel="Description and Highlights"
            placeholder="List ingredients, taste notes, or preparation specifics..."
            minHeight={128}
          />
          <View className="flex-row flex-wrap gap-1.5 pt-1">
            {highlights.map(highlight => (
              <Pressable
                key={highlight}
                accessibilityRole="button"
                accessibilityLabel={`Add ${highlight}`}
                className="flex-row items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 active:bg-surface-container-high"
                onPress={() => {
                  setDescription(current => `${current}\n• ${highlight}`);
                  onAddHighlight?.(highlight);
                }}
              >
                <Icon name="plus" size={13} color={colors.textSecondary} />
                <VemtapText variant="caption" tone="secondary">
                  {highlight}
                </VemtapText>
              </Pressable>
            ))}
          </View>
        </SetupCard>

        <SetupCard className="gap-3">
          <VemtapText variant="headingSm" className="text-heading-sm">
            Item Condition
          </VemtapText>
          <VemtapText variant="caption" tone="secondary">
            Accurate conditions build customer credibility
          </VemtapText>
          <View className="flex-row gap-2">
            {conditions.map(option => {
              const selected = condition === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  className={cn(
                    'min-w-0 flex-1 flex-col items-center gap-1 rounded-xl p-3 active:scale-95',
                    selected ? 'bg-surface-tint shadow-sm' : 'bg-surface-subtle',
                  )}
                  onPress={() => setCondition(option.id)}
                >
                  <Icon
                    name={option.icon}
                    size={22}
                    color={selected ? colors.primary : colors.textSecondary}
                  />
                  <VemtapText
                    variant="labelSm"
                    className={cn('text-center', selected ? 'text-primary' : 'text-text')}
                  >
                    {option.label}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" className="text-center">
                    {option.detail}
                  </VemtapText>
                </Pressable>
              );
            })}
          </View>
        </SetupCard>
      </View>
    </BusinessScreenLayout>
  );
}

function CategoryLevel({
  label,
  value,
  icon,
  active = false,
  onPress,
}: {
  label: string;
  value: string;
  icon: 'restaurant' | 'grill' | 'fire';
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between gap-2 py-1">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <View
          className={cn(
            'h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            active ? 'bg-primary-fixed' : 'bg-surface-container-high',
          )}
        >
          <Icon
            name={icon}
            size={16}
            color={active ? colors.primary : colors.onSecondaryContainer}
          />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="tertiary">
            {label}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {value}
          </VemtapText>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Change ${label}`}
        hitSlop={8}
        className="min-h-9 justify-center rounded px-2"
        onPress={onPress}
      >
        <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
          Change
        </VemtapText>
      </Pressable>
    </View>
  );
}
