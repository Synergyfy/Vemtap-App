import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { LocationMapView } from '@components/shared/LocationMapView';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { strings } from '@constants/strings';
import { AREA_OPTIONS, areaCoords } from '@constants/locations';
import type { AuthStackParamList } from '@navigation/types';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ManualLocationSearch'>;

export interface ManualLocationSearchScreenProps {
  /**
   * Applies the chosen district and leaves the screen. Supplied by the signed-in
   * home flow; when omitted the screen falls back to its own navigator and
   * continues into the signup confirmation step. One component, two shells —
   * the area list and validation cannot drift between them (AGENTS rule 17).
   */
  onSelected?: (area: string) => void;
  onBack?: () => void;
  /** Suggested district to preselect. */
  initialArea?: string;
}

/**
 * Conversion of stitch_vemtap_design_system/5._manual_location_search/code.html
 */
export function ManualLocationSearchScreen({
  onSelected,
  onBack,
  initialArea = 'Apo',
}: ManualLocationSearchScreenProps = {}) {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState(initialArea);
  const [selected, setSelected] = useState(initialArea);

  const goBack = useMemo(
    () => onBack ?? (() => navigation.goBack()),
    [navigation, onBack],
  );
  const applyArea = useMemo(
    () =>
      onSelected ??
      ((area: string) => navigation.navigate('LocationConfirmation', { area })),
    [navigation, onSelected],
  );

  const onClear = useCallback(() => setQuery(''), []);

  const onUseCurrent = useCallback(() => {
    setSelected('Apo');
    setQuery('Apo');
    applyArea('Apo');
  }, [applyArea]);

  const onContinue = useCallback(() => {
    applyArea(selected);
  }, [applyArea, selected]);

  const ctaLabel = useMemo(() => strings.auth.manualContinueWith(selected), [selected]);

  const mapRegion = useMemo(() => areaCoords(selected), [selected]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between bg-surface px-6 pb-3 pt-2"
        style={navbarBottomShadow}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.common.goBack}
          hitSlop={8}
          className="-ml-2 h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-low"
          onPress={goBack}
        >
          <Icon name="backIos" size={22} color={colors.surfaceDark} />
        </Pressable>
        <VemtapText
          accessibilityRole="header"
          variant="headingSm"
          className="max-w-[200px] text-center"
          numberOfLines={1}
        >
          {strings.auth.manualHeader}
        </VemtapText>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Icon name="person" size={18} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView
        contentContainerClassName="flex-grow px-6 pb-4 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        {/* Context */}
        <View className="mb-6 gap-1">
          <View className="flex-row items-center gap-1 self-start rounded-full bg-surface-container-high px-2 py-0.5">
            <Icon name="nearMe" size={16} color={colors.primary} />
            <VemtapText className="font-sans-medium text-label-sm text-primary">
              {strings.auth.manualChip}
            </VemtapText>
          </View>
          <VemtapText
            variant="headingXl"
            accessibilityRole="header"
            className="text-heading-xl"
          >
            {strings.auth.manualTitle}
          </VemtapText>
          <VemtapText tone="secondary">{strings.auth.manualSubtitle}</VemtapText>
        </View>

        {/* Search */}
        <View className="mb-4 h-[54px] flex-row items-center gap-2 rounded-xl bg-surface-canvas px-4 shadow-sm">
          <Icon name="search" size={22} color={colors.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={strings.auth.manualSearchPlaceholder}
            placeholderTextColor={colors.textTertiary}
            className="h-full flex-1 text-body-md text-text"
            accessibilityLabel={strings.auth.manualSearchPlaceholder}
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.auth.manualClearSearch}
              hitSlop={8}
              className="h-7 w-7 items-center justify-center rounded-full bg-surface-container active:scale-95"
              onPress={onClear}
            >
              <Icon name="close" size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {/* Live map preview of the selected area (structure from HTML) */}
        <View className="relative mb-6 h-24 overflow-hidden rounded-xl bg-surface-container shadow-sm">
          <LocationMapView
            region={mapRegion}
            style={StyleSheet.absoluteFill}
            scrollEnabled={false}
            zoomEnabled={false}
          />
          <LinearGradient
            colors={['transparent', 'rgba(20, 27, 43, 0.2)', 'rgba(20, 27, 43, 0.75)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View
            className="absolute inset-x-0 bottom-0 flex-row items-end justify-between p-3"
            pointerEvents="none"
          >
            <View className="flex-row items-center gap-1.5">
              <Icon name="explore" size={18} color={colors.primary} />
              <VemtapText className="font-sans-semibold text-label-sm text-white">
                {strings.auth.manualMapCaption}
              </VemtapText>
            </View>
            <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
              <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
                {strings.auth.manualOffersBadge}
              </VemtapText>
            </View>
          </View>
        </View>

        {/* Use current location */}
        <Pressable
          accessibilityRole="button"
          className="mb-6 w-full flex-row items-center gap-3 rounded-xl bg-surface-container-low p-3 active:scale-[0.99]"
          onPress={onUseCurrent}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/20 shadow-sm">
            <Icon name="myLocation" size={20} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText className="text-button-md text-text">
              {strings.auth.manualUseCurrent}
            </VemtapText>
            <VemtapText numberOfLines={1} className="text-caption text-text-secondary">
              {strings.auth.manualUseCurrentSub}
            </VemtapText>
          </View>
          <Icon name="forward" size={20} color={colors.outline ?? '#727786'} />
        </Pressable>

        {/* Suggestions */}
        <View className="mb-2 flex-row items-center justify-between">
          <VemtapText className="font-sans-semibold text-label-sm uppercase tracking-wider text-text-tertiary">
            {strings.auth.manualSuggested}
          </VemtapText>
          <VemtapText className="font-sans-medium text-caption text-primary">
            {strings.auth.manualRegion}
          </VemtapText>
        </View>

        <View
          className="gap-2"
          accessibilityRole="radiogroup"
          accessibilityLabel={strings.auth.manualSuggested}
        >
          {AREA_OPTIONS.map(area => {
            const isSelected = selected === area.name;
            return (
              <Pressable
                key={area.name}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                className={`flex-row items-center justify-between rounded-xl p-3 active:scale-[0.99] ${
                  isSelected
                    ? 'border-[1.5px] border-primary bg-surface-tint'
                    : 'border-[1.5px] border-transparent bg-surface-canvas shadow-sm'
                }`}
                onPress={() => {
                  setSelected(area.name);
                  setQuery(area.name);
                }}
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-3">
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-full ${
                      isSelected ? 'bg-primary' : 'bg-surface-container'
                    }`}
                  >
                    <Icon
                      name="locationOn"
                      size={18}
                      color={isSelected ? '#FFFFFF' : (colors.secondary ?? '#4A5E88')}
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center gap-2">
                      <VemtapText
                        className={
                          isSelected
                            ? 'font-sans-semibold text-heading-sm text-primary'
                            : 'text-button-md text-text'
                        }
                        numberOfLines={1}
                      >
                        {area.name}
                      </VemtapText>
                      {isSelected ? (
                        <View className="rounded bg-primary px-1 py-0.5">
                          <VemtapText className="font-sans-medium text-caption text-white">
                            {strings.auth.manualSelected}
                          </VemtapText>
                        </View>
                      ) : null}
                    </View>
                    <VemtapText
                      numberOfLines={1}
                      className="text-caption text-text-secondary"
                    >
                      {strings.auth.manualAreaSub}
                    </VemtapText>
                  </View>
                </View>
                {isSelected ? (
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Icon name="check" size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  <VemtapText className="text-caption text-text-tertiary">
                    {area.distance}
                  </VemtapText>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Insight */}
        <View className="mt-4 flex-row items-center gap-3 rounded-xl bg-surface-container-low p-3">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-container-high">
            <Icon name="bolt" size={18} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText className="font-sans-semibold text-label-sm text-text">
              {strings.auth.manualInsightTitle}
            </VemtapText>
            <VemtapText numberOfLines={1} className="text-caption text-text-secondary">
              {strings.auth.manualInsightBody}
            </VemtapText>
          </View>
        </View>
      </ScrollView>

      {/* Bottom deck */}
      <View className="border-t border-border/40 bg-surface px-6 pb-6 pt-2">
        <Button
          label={ctaLabel}
          rightIcon={<Icon name="arrowForward" size={20} color="#FFFFFF" />}
          onPress={onContinue}
        />
        <View className="mt-2 flex-row items-center justify-center gap-1">
          <VemtapText className="text-center text-caption text-text-secondary">
            {strings.auth.manualOwnVenue}{' '}
          </VemtapText>
          <VemtapText className="font-sans-medium text-caption text-primary">
            {strings.auth.manualSetupVemtap}
          </VemtapText>
          <Icon name="arrowForward" size={12} color={colors.primary} />
        </View>
      </View>
    </SafeAreaView>
  );
}
