import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { AppModal } from '@components/ui/Modal';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessAnalyticsRow } from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  BusinessPanel,
  BusinessToggleChip,
} from '@features/business/components/BusinessOpsPrimitives';
import { parseLocalDate, type AnalyticsPreset } from '@store/analyticsFilterStore';

const copy = strings.businessIntelligence.filters;

const PRESETS: AnalyticsPreset[] = ['today', '7d', '30d', '90d', 'year', 'custom'];
const DEFAULT_PRESET: AnalyticsPreset = '30d';
const MAX_DAYS = 366;

export interface AnalyticsFilterSelection {
  preset: AnalyticsPreset;
  customFrom: string | null;
  customTo: string | null;
  branchId: string | null;
}

export interface AnalyticsFilterBranch {
  id: string;
  name: string;
  address?: string;
}

export interface AnalyticsFilterSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  value: AnalyticsFilterSelection;
  branches: readonly AnalyticsFilterBranch[];
  onApply?: (selection: AnalyticsFilterSelection) => void;
}

/** A custom window is usable when both dates parse, run forwards and fit a year. */
export function isValidCustomRange(from: string, to: string): boolean {
  const start = parseLocalDate(from);
  const end = parseLocalDate(to);
  if (!start || !end || start > end) return false;
  return (end.getTime() - start.getTime()) / 86_400_000 < MAX_DAYS;
}

/**
 * Analytics Filter Settings.
 * stitch_vemtap_mobile_app_design/analytics_filter_settings — the source is a
 * centered scrim'd card (no bottom anchor, no grabber), so it uses the shared
 * modal shell rather than the bottom sheet. It edits a draft of the shared
 * analytics window (period + branch) and hands it back on Apply.
 */
export function AnalyticsFilterSettingsSheet({
  visible,
  onClose,
  value,
  branches,
  onApply,
}: AnalyticsFilterSettingsSheetProps) {
  const [preset, setPreset] = useState<AnalyticsPreset>(value.preset);
  const [customFrom, setCustomFrom] = useState(value.customFrom ?? '');
  const [customTo, setCustomTo] = useState(value.customTo ?? '');
  const [branchId, setBranchId] = useState<string | null>(value.branchId);

  // Reopening starts from what is applied, not from an abandoned draft.
  useEffect(() => {
    if (!visible) return;
    setPreset(value.preset);
    setCustomFrom(value.customFrom ?? '');
    setCustomTo(value.customTo ?? '');
    setBranchId(value.branchId);
  }, [visible, value]);

  const customInvalid = preset === 'custom' && !isValidCustomRange(customFrom, customTo);
  const activeCount = (preset === DEFAULT_PRESET ? 0 : 1) + (branchId ? 1 : 0);

  function reset() {
    setPreset(DEFAULT_PRESET);
    setCustomFrom('');
    setCustomTo('');
    setBranchId(null);
  }

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={copy.title}
      className="max-h-[86%]"
    >
      <ScrollView
        className="max-h-[68vh]"
        contentContainerClassName="gap-4 pb-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="min-w-0">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.scope}
          </VemtapText>
          <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
            {copy.scopeMeta(branches.length)}
          </VemtapText>
        </View>

        <BusinessPanel tone="subtle" className="gap-2">
          <VemtapText variant="labelSm" className="font-sans-semibold">
            {copy.rangeTitle}
          </VemtapText>
          <View className="flex-row flex-wrap gap-1.5">
            {PRESETS.map(option => (
              <BusinessToggleChip
                key={option}
                label={copy.ranges[option]}
                icon="calendar"
                selected={option === preset}
                onPress={() => setPreset(option)}
              />
            ))}
          </View>
          {preset === 'custom' ? (
            <View className="gap-2">
              <VemtapText variant="micro" tone="secondary">
                {copy.customTitle}
              </VemtapText>
              <Input
                label={copy.startDate}
                value={customFrom}
                onChangeText={setCustomFrom}
                placeholder="2026-10-01"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
              />
              <Input
                label={copy.endDate}
                value={customTo}
                onChangeText={setCustomTo}
                placeholder="2026-10-31"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
              />
              {customInvalid && (customFrom || customTo) ? (
                <VemtapText variant="micro" className="text-error">
                  {copy.customInvalid}
                </VemtapText>
              ) : null}
            </View>
          ) : null}
        </BusinessPanel>

        {branches.length > 1 ? (
          <BusinessPanel tone="subtle" className="gap-2">
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText variant="labelSm" className="font-sans-semibold">
                {copy.locationsTitle}
              </VemtapText>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.locationsMeta}
              </VemtapText>
            </View>
            <BusinessAnalyticsRow
              title={copy.allLocations}
              subtitle={copy.allLocationsMeta}
              icon="layers"
              trailing={branchId === null ? copy.selected : undefined}
              trailingTone="brand"
              onPress={() => setBranchId(null)}
            />
            {branches.map(branch => (
              <BusinessAnalyticsRow
                key={branch.id}
                title={branch.name}
                subtitle={branch.address || undefined}
                icon="storefront"
                trailing={branch.id === branchId ? copy.selected : undefined}
                trailingTone="brand"
                onPress={() => setBranchId(branch.id)}
              />
            ))}
          </BusinessPanel>
        ) : null}
      </ScrollView>

      <View className="flex-row items-center gap-2 pt-4">
        <Button
          label={copy.reset}
          labelVariant="labelMd"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={reset}
        />
        <Button
          label={
            activeCount > 0
              ? copy.applyActive.replace('{count}', String(activeCount))
              : copy.apply
          }
          labelVariant="labelMd"
          size="sm"
          className="min-h-[44px] flex-1"
          disabled={customInvalid}
          leftIcon={<Icon name="check" size={18} color={colors.surface} />}
          onPress={() => {
            onApply?.({
              preset,
              customFrom: preset === 'custom' ? customFrom.trim() : null,
              customTo: preset === 'custom' ? customTo.trim() : null,
              branchId,
            });
            onClose();
          }}
        />
      </View>
    </AppModal>
  );
}
