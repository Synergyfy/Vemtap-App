import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { FilterChip } from '@components/filters/FilterChip';
import { FilterSection } from '@components/filters/FilterSection';
import { RangeSlider } from '@components/ui/RangeSlider';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import {
  AREA_OPTIONS,
  AREA_PILL_LABELS,
  DEFAULT_AREA,
  type AreaName,
} from '@constants/locations';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

const copy = strings.homeLocation;

export interface ChangeLocationRadiusSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Currently active area, so the sheet opens on live state rather than defaults. */
  area?: AreaName;
  radiusKm?: number;
  onApply: (selection: ChangeLocationRadiusSelection) => void;
  /** Hands off to the full manual-search page; the sheet stays the only overlay. */
  onSearchArea?: (query: string) => void;
  onUseCurrentLocation?: () => void;
}

export interface ChangeLocationRadiusSelection {
  area: AreaName;
  radiusKm: number;
  /** Deal count the apply action promises for the pending selection. */
  dealCount: number;
}

/** Deal count the design promises for the Apo/5 km default. */
const DEAL_COUNT = 34;

/** Fictional Abuja district label used in the coverage sentence. */
const AREA_LONG_LABELS: Record<AreaName, string> = {
  Apo: 'Apo District',
  'Wuse 2': 'Wuse II',
  Maitama: 'Maitama',
  Garki: 'Garki',
  Jabi: 'Jabi',
};

/**
 * Change Location & Radius — opened from the "Apo, Abuja" control in the
 * consumer Home navbar.
 * stitch_vemtap_mobile_app_design/vemtap_consumer_home_change_location_radius_modal
 *
 * The source is a grabber + bottom-anchored `max-h-[88vh]` panel, so it is built
 * on the shared `BottomSheet` (delayed-fade scrim, Android-back dismissal) and
 * composes the shared filter chips/section and the shared `RangeSlider` rather
 * than forking a second location or slider control.
 */
export function ChangeLocationRadiusSheet({
  visible,
  onClose,
  area = DEFAULT_AREA,
  radiusKm = 5,
  onApply,
  onSearchArea,
  onUseCurrentLocation,
}: ChangeLocationRadiusSheetProps) {
  const [pendingArea, setPendingArea] = useState<AreaName>(area);
  const [pendingRadius, setPendingRadius] = useState<number>(radiusKm);

  // A wider radius or a different district surfaces more deals, so the apply
  // action can never promise a stale count.
  const dealCount = useMemo(
    () => DEAL_COUNT + (pendingRadius - radiusKm) * 2 + (pendingArea === area ? 0 : 9),
    [area, pendingArea, pendingRadius, radiusKm],
  );

  function chooseArea(next: AreaName) {
    setPendingArea(next);
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={copy.title}>
      <View className="gap-1 px-6 pb-1">
        <VemtapText variant="bodyMd" tone="secondary">
          {copy.subtitle}
        </VemtapText>
      </View>

      <ScrollView
        className="mt-3 max-h-[60vh]"
        contentContainerClassName="gap-4 px-6 pb-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: true }}
          accessibilityLabel={copy.autoDetectTitle}
          onPress={() => {
            setPendingArea(DEFAULT_AREA);
            onUseCurrentLocation?.();
          }}
          className="flex-row items-center gap-3 rounded-card bg-surface-tint p-3.5 active:opacity-80"
        >
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
            <Icon name="myLocation" size={20} color={colors.surface} />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.autoDetectTitle}
              </VemtapText>
              <View className="rounded-full bg-success-container px-2 py-0.5">
                <VemtapText variant="micro" className="font-sans-semibold text-success">
                  {copy.autoDetectBadge}
                </VemtapText>
              </View>
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.autoDetectMeta}
            </VemtapText>
          </View>
          <Icon name="checkCircle" size={22} color={colors.primary} />
        </Pressable>

        <FilterSection title={copy.selectTitle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.searchPlaceholder}
            onPress={() => onSearchArea?.('')}
            className="flex-row items-center gap-2 rounded-field bg-surface-subtle px-3 py-2.5 active:opacity-80"
          >
            <Icon name="search" size={18} color={colors.textSecondary} />
            <VemtapText
              variant="bodyMd"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {copy.searchPlaceholder}
            </VemtapText>
            <Icon name="close" size={16} color={colors.textTertiary} />
          </Pressable>

          <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1.5">
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.popular}
            </VemtapText>
            {AREA_OPTIONS.map(option => (
              <FilterChip
                key={option.name}
                label={
                  option.name === pendingArea
                    ? `${AREA_PILL_LABELS[option.name]} ${copy.selectedSuffix}`
                    : AREA_PILL_LABELS[option.name]
                }
                selected={option.name === pendingArea}
                onPress={() => chooseArea(option.name)}
              />
            ))}
          </View>
        </FilterSection>

        <FilterSection title={copy.radiusTitle}>
          <RangeSlider
            value={pendingRadius}
            min={copy.radiusTicks[0]}
            max={copy.radiusTicks[copy.radiusTicks.length - 1]}
            ticks={copy.radiusTicks}
            showValuePill
            accessibilityLabel={copy.adjustRadius}
            formatTick={tick => copy.km(Number(tick))}
            formatValue={km => copy.withinKm(km)}
            onChange={setPendingRadius}
          />
          <View className="flex-row flex-wrap gap-1.5 pt-1">
            {copy.radiusQuick.map(km => (
              <FilterChip
                key={km}
                label={copy.km(km)}
                selected={km === pendingRadius}
                onPress={() => setPendingRadius(km)}
              />
            ))}
          </View>
        </FilterSection>

        <View className="flex-row items-start gap-2.5 rounded-card bg-surface-subtle p-3.5">
          <Icon name="info" size={16} color={colors.textSecondary} />
          <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
            {copy.foundWithin(AREA_LONG_LABELS[pendingArea], pendingRadius)}
          </VemtapText>
        </View>
      </ScrollView>

      <View className="mt-4 gap-2 px-6">
        <Button
          label={copy.apply(dealCount)}
          labelVariant="button"
          size="md"
          accessibilityLabel={copy.apply(dealCount)}
          className="min-h-[52px] w-full rounded-xl"
          leftIcon={<Icon name="tune" size={18} color={colors.surface} />}
          onPress={() => {
            onApply({ area: pendingArea, radiusKm: pendingRadius, dealCount });
            onClose();
          }}
        />
        <Button
          label={copy.cancelKeep(AREA_PILL_LABELS[area], radiusKm)}
          labelVariant="labelMd"
          variant="ghost"
          size="md"
          accessibilityLabel={copy.cancelKeep(AREA_PILL_LABELS[area], radiusKm)}
          onPress={onClose}
        />
      </View>
    </BottomSheet>
  );
}
