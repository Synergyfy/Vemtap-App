import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { businessOpsMedia } from '@features/business/data/businessOpsImages';
import {
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
  BusinessTextArea,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessConditionTileRow,
  BusinessHighlightChipRow,
  BusinessPanel,
  BusinessToastPill,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  FieldInput,
  HorizontallyScrollableRow,
  SetupCallout,
  SetupSectionHeading,
} from '@features/business/components/BusinessSetupPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.addProductBasics;

export interface AddProductBasicsMediaScreenProps {
  onBack?: () => void;
  onContinue?: () => void;
  onSaveDraft?: () => void;
  onChangeCategory?: (field: string) => void;
  onAddMedia?: () => void;
}

/**
 * Step 1 of the product builder: media, title & producer, category placement,
 * description and item condition. Uses the shared setup primitives so the form
 * fields match the rest of the onboarding flow.
 */
export function AddProductBasicsMediaScreen({
  onBack,
  onContinue,
  onSaveDraft,
  onChangeCategory,
  onAddMedia,
}: AddProductBasicsMediaScreenProps) {
  const [title, setTitle] = useState<string>(copy.titleValue);
  const [producer, setProducer] = useState<string>(copy.producerValue);
  const [description, setDescription] = useState<string>(copy.descriptionValue);
  const [unbranded, setUnbranded] = useState(false);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [condition, setCondition] = useState('fresh');
  const [saved, setSaved] = useState(false);

  const toggleAttribute = (value: string) => {
    setAttributes(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value],
    );
  };

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        eyebrow: copy.headerStep,
        onBack,
        titleVariant: 'labelMd',
        centerTitle: false,
        actionLabel: copy.draft,
        onAction: () => {
          setSaved(true);
          onSaveDraft?.();
        },
      }}
      contentContainerClassName="pb-8"
      footer={
        <View className="gap-2 pb-2">
          <Button
            label={copy.continue}
            labelVariant="labelMd"
            onPress={onContinue}
            rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.saveDraft}
            onPress={() => {
              setSaved(true);
              onSaveDraft?.();
            }}
            className="min-h-10 flex-row items-center justify-center gap-1.5"
          >
            <Icon name="save" size={16} color={colors.textSecondary} />
            <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
              {copy.saveDraft}
            </VemtapText>
          </Pressable>
        </View>
      }
    >
      <View className="gap-2 rounded-card bg-surface p-3">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.stepLabel}
            </VemtapText>
            <BusinessStatusPill label={copy.mediaRequired} tone="success" />
          </View>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.percentLabel}
          </VemtapText>
        </View>
        <View className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <View className="h-2 w-1/3 rounded-full bg-primary" />
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="storefront" size={14} color={colors.textTertiary} />
          <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
            {copy.stepHint}
          </VemtapText>
        </View>
      </View>

      <BusinessPanel className="mt-3">
        <SetupSectionHeading title={copy.mediaTitle} badge={copy.mediaRequired} />
        <View className="relative h-48 w-full overflow-hidden rounded-card bg-surface-container-highest">
          <BusinessProductImage
            source={businessOpsMedia.productLamb}
            alt={businessOpsMedia.productLamb.alt}
            className="h-full w-full"
          />
          <View className="absolute left-2.5 top-2.5 flex-row items-center gap-1.5">
            <View className="flex-row items-center gap-1 rounded-full bg-inverse-surface px-2.5 py-1">
              <Icon name="starFilled" size={12} color={colors.badgeDiscountBg} />
              <VemtapText variant="micro" className="font-sans-semibold text-surface">
                {copy.coverPhoto}
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-inverse-surface px-2 py-1">
              <Icon name="drag" size={12} color={colors.inverseOnSurface} />
              <VemtapText variant="micro" className="text-inverse-on-surface">
                {copy.dragToArrange}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.change}
            onPress={onAddMedia}
            className="absolute bottom-2.5 right-2.5 min-h-9 flex-row items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 shadow-md active:scale-95"
          >
            <Icon name="camera" size={15} color={colors.textSecondary} />
            <VemtapText variant="caption" className="font-sans-semibold">
              {copy.change}
            </VemtapText>
          </Pressable>
        </View>
        <HorizontallyScrollableRow>
          {[
            businessOpsMedia.productLamb,
            businessOpsMedia.dealLunch,
            businessOpsMedia.dealSpa,
          ].map((image, index) => (
            <Pressable
              key={image.uri}
              accessibilityRole="image"
              accessibilityLabel={`${copy.coverPhoto} ${index + 1}`}
              onPress={onAddMedia}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-field ${
                index === 0 ? 'border-2 border-primary' : 'bg-surface-subtle'
              }`}
            >
              <BusinessProductImage
                source={image}
                alt={image.alt}
                className="h-full w-full"
              />
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.addTile}
            onPress={onAddMedia}
            className="h-16 w-16 shrink-0 items-center justify-center rounded-field border-2 border-dashed border-border-active bg-surface-tint"
          >
            <Icon name="plus" size={18} color={colors.primary} />
            <VemtapText variant="micro" className="font-sans-semibold text-primary">
              {copy.addTile}
            </VemtapText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.extraTile}
            onPress={onAddMedia}
            className="h-16 w-16 shrink-0 items-center justify-center rounded-field bg-surface-subtle"
          >
            <Icon name="imagePlus" size={18} color={colors.textTertiary} />
            <VemtapText variant="micro" tone="tertiary">
              {copy.extraTile}
            </VemtapText>
          </Pressable>
        </HorizontallyScrollableRow>
        <SetupCallout
          icon="lightbulb"
          tone="subtle"
          title={copy.proTipPrefix}
          body={copy.proTipBody}
          iconSize={18}
        />
      </BusinessPanel>

      <BusinessPanel className="mt-3">
        <FieldInput
          label={copy.titleLabel}
          value={title}
          onChangeText={setTitle}
          placeholder={copy.titlePlaceholder}
          accessibilityLabel={copy.titleLabel}
          maxLength={80}
          trailingIcon="close"
          trailingIconColor={colors.textTertiary}
          onTrailingIconPress={() => setTitle('')}
        />
        <VemtapText variant="micro" tone="tertiary" className="-mt-1 self-end">
          {copy.titleCounter}
        </VemtapText>
        <FieldInput
          label={copy.producerLabel}
          value={producer}
          onChangeText={setProducer}
          placeholder={copy.producerPlaceholder}
          accessibilityLabel={copy.producerLabel}
          leadingIcon="storefront"
        />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: unbranded }}
          accessibilityLabel={copy.unbranded}
          onPress={() => setUnbranded(value => !value)}
          className="flex-row items-center gap-2.5"
        >
          <View
            className={`h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
              unbranded
                ? 'border-primary bg-primary'
                : 'border-outline-variant bg-surface'
            }`}
          >
            {unbranded ? <Icon name="check" size={13} color={colors.surface} /> : null}
          </View>
          <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
            {copy.unbranded}
          </VemtapText>
        </Pressable>
      </BusinessPanel>

      <BusinessPanel className="mt-3">
        <View className="flex-row items-start gap-2.5">
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <Icon name="hub" size={17} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.categoryTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5 leading-tight"
            >
              {copy.categorySubtitle}
            </VemtapText>
          </View>
        </View>
        <View className="overflow-hidden rounded-field border border-border">
          {copy.categories.map((row, index) => (
            <View
              key={row.label}
              className={`flex-row items-center justify-between gap-3 p-3 ${
                index > 0 ? 'border-t border-border' : ''
              }`}
            >
              <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface">
                  <Icon
                    name={row.icon as IconName}
                    size={15}
                    color={colors.textSecondary}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="micro"
                    tone="tertiary"
                    className="font-sans-medium uppercase"
                  >
                    {row.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {row.value}
                  </VemtapText>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${copy.categoryChange} ${row.label}`}
                hitSlop={8}
                onPress={() => onChangeCategory?.(row.label)}
              >
                <VemtapText variant="caption" className="font-sans-bold text-primary">
                  {copy.categoryChange}
                </VemtapText>
              </Pressable>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.descriptionTitle}
          </VemtapText>
          <View className="flex-row items-center gap-1 rounded-full bg-surface-tint px-2 py-0.5">
            <Icon name="autoAwesome" size={12} color={colors.primary} />
            <VemtapText variant="micro" className="font-sans-semibold text-primary">
              {copy.aiPolish}
            </VemtapText>
          </View>
        </View>
        <BusinessTextArea
          value={description}
          onChangeText={setDescription}
          placeholder={copy.descriptionPlaceholder}
          accessibilityLabel={copy.descriptionTitle}
          minHeight={96}
        />
        <BusinessHighlightChipRow
          options={copy.attributes}
          selected={attributes}
          prefix={copy.attributePrefix}
          onPress={toggleAttribute}
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.conditionTitle}
        subtitle={copy.conditionSubtitle}
      >
        <BusinessConditionTileRow
          options={copy.conditions.map(option => ({
            id: option.id,
            icon: option.icon as IconName,
            label: option.label,
            sub: option.sub,
          }))}
          value={condition}
          onChange={setCondition}
        />
      </BusinessPanel>

      {saved ? (
        <BusinessToastPill message={strings.centralCatalogue.updatedToast} />
      ) : null}
    </BusinessScreenLayout>
  );
}
