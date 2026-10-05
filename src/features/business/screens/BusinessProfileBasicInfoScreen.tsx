import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { VemtapText } from '@components/ui/Text';
import { businessProfileCopy as copy } from '@features/business/businessCopy';
import { BusinessCategoryPickerSheet } from '@features/business/components/BusinessCategoryPickerSheet';
import {
  FieldInput,
  FieldSelect,
  PrimaryActionButton,
  SelectableChip,
  SetupCallout,
  SetupStepBar,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import { ConsumerPreviewRow } from '@features/business/components/BusinessSetupCards';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const DESCRIPTION_MAX = 250;
const SPECIALTY_MAX = 2;

export interface BusinessBasicInfoValue {
  name: string;
  /**
   * Category name, kept for display and preview. `categoryId` / `subcategoryId`
   * come from the live taxonomy because `register/owner` needs real UUIDs — the
   * invented labels this screen used to offer could never produce one.
   */
  category: string;
  categoryId?: string;
  subcategoryId?: string;
  otherSubcategoryName?: string;
  specialties: string[];
  description: string;
}

export interface BusinessProfileBasicInfoScreenProps {
  onBack?: () => void;
  onContinue?: (value: BusinessBasicInfoValue) => void;
  onSaveDraft?: (value: BusinessBasicInfoValue) => void;
  initialValue?: Partial<BusinessBasicInfoValue>;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/business_profile_1._basic_information/code.html
 */
export function BusinessProfileBasicInfoScreen({
  onBack,
  onContinue,
  onSaveDraft,
  initialValue,
}: BusinessProfileBasicInfoScreenProps) {
  const [name, setName] = useState(initialValue?.name ?? 'Urban Grill & Bistro');
  // Starts unselected: the previous default was an invented category that has no
  // counterpart in the API taxonomy, so it could not have been submitted.
  const [category, setCategory] = useState(initialValue?.category ?? '');
  const [categoryId, setCategoryId] = useState(initialValue?.categoryId);
  const [subcategoryId, setSubcategoryId] = useState(initialValue?.subcategoryId);
  const [otherSubcategoryName, setOtherSubcategoryName] = useState(
    initialValue?.otherSubcategoryName,
  );
  const [specialties, setSpecialties] = useState<string[]>(
    initialValue?.specialties ?? [],
  );
  const [description, setDescription] = useState(
    initialValue?.description ??
      'Artisanal wood-fired steaks, fresh gourmet burgers, and handcrafted botanical cocktails right in the vibrant heart of the city.',
  );
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const onPickCategory = useCallback(
    (selection: {
      categoryId: string;
      categoryName: string;
      subcategoryId?: string;
      subcategoryName?: string;
      otherSubcategoryName?: string;
    }) => {
      setCategory(selection.categoryName);
      setCategoryId(selection.categoryId);
      setSubcategoryId(selection.subcategoryId);
      setOtherSubcategoryName(selection.otherSubcategoryName);
      setSpecialties(
        [selection.subcategoryName, selection.otherSubcategoryName].filter(
          (choice): choice is string => Boolean(choice),
        ),
      );
      setCategorySheetOpen(false);
    },
    [],
  );

  const value = useMemo<BusinessBasicInfoValue>(
    () => ({
      name,
      category,
      categoryId,
      subcategoryId,
      otherSubcategoryName,
      specialties,
      description,
    }),
    [
      category,
      categoryId,
      description,
      name,
      otherSubcategoryName,
      specialties,
      subcategoryId,
    ],
  );

  const specialtiesSubtitle =
    specialties.length > 0
      ? specialties.join(' • ')
      : copy.basicInfo.previewEmptySubtitle;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader title={copy.basicInfo.header} onBack={handleBack} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SetupStepBar
          step={copy.basicInfo.step}
          percent={copy.basicInfo.percent}
          progress={33}
          stepStyle="plain"
        />

        <View className="gap-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-heading-md"
          >
            {copy.basicInfo.title}
          </VemtapText>
          <VemtapText tone="secondary">{copy.basicInfo.subtitle}</VemtapText>
        </View>

        <SetupCallout
          icon="verifiedUser"
          title={copy.basicInfo.trustTitle}
          body={copy.basicInfo.trustBody}
          iconSurface="circleMd"
          className="p-4"
        />

        <View className="gap-6">
          <View className="gap-1.5">
            <View className="flex-row items-center gap-1">
              <VemtapText variant="labelMd" className="text-text">
                {copy.basicInfo.nameLabel}
              </VemtapText>
              <VemtapText variant="labelMd" tone="error">
                *
              </VemtapText>
            </View>
            <FieldInput
              value={name}
              onChangeText={setName}
              placeholder={copy.basicInfo.namePlaceholder}
              leadingIcon="storefront"
              tone="lowest"
              accessibilityLabel={copy.basicInfo.nameLabel}
            />
          </View>

          <View className="gap-1.5">
            <FieldSelect
              label={copy.basicInfo.categoryLabel}
              value={category}
              placeholder={copy.basicInfo.categoryPlaceholder}
              accessibilityLabel={copy.basicInfo.categoryLabel}
              onPress={() => setCategorySheetOpen(true)}
              tone="lowest"
            />
            <VemtapText variant="caption" tone="tertiary" className="px-1">
              {copy.basicInfo.categoryHint}
            </VemtapText>
          </View>

          <View className="gap-1.5">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-1">
                <VemtapText variant="labelMd" className="text-text">
                  {copy.basicInfo.specialtyLabel}
                </VemtapText>
                <VemtapText variant="labelMd" tone="secondary">
                  {copy.basicInfo.specialtyHint}
                </VemtapText>
              </View>
              <TextActionButton
                label={copy.basicInfo.changeCategory}
                onPress={() => setCategorySheetOpen(true)}
              />
            </View>
            {specialties.length > 0 ? (
              <View className="flex-row flex-wrap gap-2 pt-0.5">
                {specialties.slice(0, SPECIALTY_MAX).map((option: string) => (
                  <SelectableChip
                    key={option}
                    label={option}
                    selected
                    showCheck
                    onPress={() => setCategorySheetOpen(true)}
                  />
                ))}
              </View>
            ) : (
              <VemtapText variant="caption" tone="tertiary" className="px-1">
                {category ? copy.basicInfo.specialtyEmpty : copy.basicInfo.categoryFirst}
              </VemtapText>
            )}
          </View>

          <View className="gap-1.5">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText variant="labelMd" className="text-text">
                {copy.basicInfo.descriptionLabel}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {description.length} / {DESCRIPTION_MAX}
              </VemtapText>
            </View>
            <FieldInput
              value={description}
              onChangeText={setDescription}
              placeholder={copy.basicInfo.descriptionPlaceholder}
              maxLength={DESCRIPTION_MAX}
              multiline
              tone="lowest"
              accessibilityLabel={copy.basicInfo.descriptionLabel}
              className="min-h-[104px] items-start"
            />
            <VemtapText variant="caption" tone="tertiary" className="px-1">
              {copy.basicInfo.descriptionHint}
            </VemtapText>
          </View>
        </View>

        <View className="gap-2 rounded-card bg-surface-container-lowest p-4 shadow-sm">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText
              variant="labelSm"
              tone="tertiary"
              className="font-sans-semibold uppercase tracking-wider"
            >
              {copy.basicInfo.previewLabel}
            </VemtapText>
            <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
              <VemtapText
                variant="caption"
                className="font-sans-medium text-badge-discount-text"
              >
                {copy.basicInfo.previewBadge}
              </VemtapText>
            </View>
          </View>
          <ConsumerPreviewRow
            name={name.trim() || copy.basicInfo.previewEmptyTitle}
            specialties={specialtiesSubtitle}
            districtLabel={copy.basicInfo.previewDistrict}
          />
        </View>
      </ScrollView>

      <View className="gap-4 px-6 pb-6 pt-0">
        <PrimaryActionButton
          label={copy.basicInfo.continue}
          onPress={() => onContinue?.(value)}
        />
        <View className="items-center gap-3">
          <TextActionButton
            label={copy.basicInfo.saveDraft}
            onPress={() => onSaveDraft?.(value)}
          />
          <ProgressDots total={3} activeIndex={0} />
        </View>
      </View>

      {/* Mounted only while open so the taxonomy query does not run on a screen
          that has not asked for it. BottomSheet still animates its own exit,
          because the sheet unmounts only after the close animation finishes. */}
      {categorySheetOpen ? (
        <BusinessCategoryPickerSheet
          categoryId={categoryId}
          subcategoryId={subcategoryId}
          onSelect={onPickCategory}
          onClose={() => setCategorySheetOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}
