import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessProfileCopy as copy } from '@features/business/businessCopy';
import {
  primaryCategories,
  subcategorySpecialties,
} from '@features/business/businessData';
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
  category: string;
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
  const [category, setCategory] = useState(
    initialValue?.category ?? primaryCategories[0],
  );
  const [specialties, setSpecialties] = useState<string[]>(
    initialValue?.specialties ?? ['Grill & Steakhouse', 'Bistro & Cafe'],
  );
  const [description, setDescription] = useState(
    initialValue?.description ??
      'Artisanal wood-fired steaks, fresh gourmet burgers, and handcrafted botanical cocktails right in the vibrant heart of the city.',
  );
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const onToggleSpecialty = useCallback((label: string) => {
    setSpecialties(current => {
      if (current.includes(label)) {
        return current.filter(item => item !== label);
      }
      if (current.length >= SPECIALTY_MAX) {
        return current;
      }
      return [...current, label];
    });
  }, []);

  const onSelectCategory = useCallback((option: string) => {
    setCategory(option);
    setCategorySheetOpen(false);
  }, []);

  const value = useMemo<BusinessBasicInfoValue>(
    () => ({ name, category, specialties, description }),
    [category, description, name, specialties],
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
              <VemtapText variant="caption" className="font-sans-semibold text-primary">
                {specialties.length} / {SPECIALTY_MAX} selected
              </VemtapText>
            </View>
            <View className="flex-row flex-wrap gap-2 pt-0.5">
              {subcategorySpecialties.map(option => (
                <SelectableChip
                  key={option}
                  label={option}
                  selected={specialties.includes(option)}
                  showCheck
                  onPress={() => onToggleSpecialty(option)}
                />
              ))}
            </View>
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

      <BottomSheet
        visible={categorySheetOpen}
        onClose={() => setCategorySheetOpen(false)}
        title={copy.basicInfo.categoryLabel}
      >
        <ScrollView className="pb-2" contentContainerClassName="gap-1 px-6">
          {primaryCategories.map(option => {
            const selected = option === category;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option}
                onPress={() => onSelectCategory(option)}
                className="min-h-[52px] flex-row items-center justify-between gap-3 rounded-field px-3 active:bg-surface-container-low"
              >
                <VemtapText variant="bodyMd" className="min-w-0 flex-1 text-text">
                  {option}
                </VemtapText>
                {selected ? (
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Icon name="check" size={14} color={colors.surface} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
