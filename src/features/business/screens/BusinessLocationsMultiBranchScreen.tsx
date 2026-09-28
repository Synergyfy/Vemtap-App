import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessLocationCopy as copy } from '@features/business/businessCopy';
import { branchSummaries, type BranchSummary } from '@features/business/businessData';
import {
  PrimaryActionButton,
  SetupSectionCard,
  SetupStepBar,
  SwitchToggle,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  AddBranchRow,
  BranchCard,
} from '@features/business/components/BusinessSetupCards';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface BusinessLocationsValue {
  multiLocation: boolean;
  branches: BranchSummary[];
}

export interface BusinessLocationsMultiBranchScreenProps {
  onBack?: () => void;
  onContinue?: (value: BusinessLocationsValue) => void;
  onAddBranch?: () => void;
  onEditBranch?: (branch: BranchSummary) => void;
  onManageHours?: (branch: BranchSummary) => void;
  onContactConcierge?: () => void;
  branches?: BranchSummary[];
  initialMultiLocation?: boolean;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/your_business_locations_multi_branch_check/code.html
 */
export function BusinessLocationsMultiBranchScreen({
  onBack,
  onContinue,
  onAddBranch,
  onEditBranch,
  onManageHours,
  onContactConcierge,
  branches = branchSummaries,
  initialMultiLocation = true,
}: BusinessLocationsMultiBranchScreenProps) {
  const [multiLocation, setMultiLocation] = useState(initialMultiLocation);

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const visibleBranches = useMemo(
    () => (multiLocation ? branches : branches.slice(0, 1)),
    [branches, multiLocation],
  );

  const value = useMemo<BusinessLocationsValue>(
    () => ({ multiLocation, branches: visibleBranches }),
    [multiLocation, visibleBranches],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader
        title={copy.locations.header}
        onBack={handleBack}
        compactTitle
        progress={{ activeIndex: 0, total: 3 }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-10 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-3">
          <SetupStepBar
            step={copy.locations.step}
            percent={copy.locations.percent}
            progress={60}
            dot
            pillTone="neutral"
          />

          <View className="gap-1">
            <VemtapText
              accessibilityRole="header"
              variant="headingMd"
              className="text-heading-md"
            >
              {copy.locations.title}
            </VemtapText>
            <VemtapText tone="secondary" className="mt-1">
              {copy.locations.subtitleLead}{' '}
              <VemtapText className="font-sans-medium text-badge-discount-text">
                ● {copy.locations.subtitleActive}
              </VemtapText>{' '}
              {copy.locations.subtitleTail}
            </VemtapText>
          </View>
        </View>

        <SetupSectionCard className="gap-2 border border-border">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 gap-0.5">
              <VemtapText variant="headingSm" className="text-text">
                {copy.locations.multiTitle}
              </VemtapText>
              <View className="mt-0.5 flex-row items-center gap-1.5">
                <Icon name="checkBold" size={18} color={colors.primary} />
                <VemtapText
                  variant="labelSm"
                  className="min-w-0 flex-1 font-sans-semibold text-primary"
                >
                  {copy.locations.multiLabel}
                </VemtapText>
              </View>
            </View>
            <View className="shrink-0 pt-0.5">
              <SwitchToggle
                value={multiLocation}
                onValueChange={setMultiLocation}
                accessibilityLabel={copy.locations.multiLabel}
                showCheck
              />
            </View>
          </View>
          <View className="mt-1 gap-1 border-t border-border pt-2">
            <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
              {copy.locations.multiBody}
            </VemtapText>
          </View>
        </SetupSectionCard>

        <View className="gap-4">
          {visibleBranches.map(branch => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={() => onEditBranch?.(branch)}
              onManageHours={() => onManageHours?.(branch)}
            />
          ))}
        </View>

        <AddBranchRow onPress={onAddBranch} />
      </ScrollView>

      <View className="gap-2 px-6 pb-3 pt-0">
        <PrimaryActionButton
          label={copy.locations.continue}
          onPress={() => onContinue?.(value)}
        />
        <VemtapText
          variant="caption"
          tone="secondary"
          className="px-4 text-center leading-normal"
        >
          {copy.locations.footnote}
        </VemtapText>
        <View className="flex-row flex-wrap items-center justify-center gap-1 pt-1">
          <VemtapText variant="labelSm" tone="tertiary">
            {copy.locations.conciergeLead}
          </VemtapText>
          <TextActionButton
            label={copy.locations.concierge}
            tone="brand"
            onPress={onContactConcierge}
            className="min-h-[32px] px-1"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
