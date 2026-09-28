import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { LocationMapView } from '@components/shared/LocationMapView';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessLocationCopy as copy } from '@features/business/businessCopy';
import { countryFlags, primaryBranchRegion } from '@features/business/businessData';
import { BusinessSectionHeading } from '@features/business/components/BusinessPrimitives';
import {
  FieldInput,
  PrimaryActionButton,
  SectionMetaRow,
  SetupStepBar,
  SetupSectionCard,
  StatusPill,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const MAP_HEIGHT = 210;
const FLAG_NIGERIA = countryFlags.nigeria;

export interface BusinessLocationDraft {
  search: string;
  street: string;
  landmark: string;
  district: string;
}

export interface WhereIsYourBusinessLocatedScreenProps {
  onBack?: () => void;
  onContinue?: (draft: BusinessLocationDraft) => void;
  onSaveDraft?: (draft: BusinessLocationDraft) => void;
  onUseCurrentLocation?: () => void;
  onRecenter?: () => void;
  onToggleMapLayers?: () => void;
  onClusterInfo?: () => void;
  initialValue?: Partial<BusinessLocationDraft>;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/where_is_your_business_located/code.html
 */
export function WhereIsYourBusinessLocatedScreen({
  onBack,
  onContinue,
  onSaveDraft,
  onUseCurrentLocation,
  onRecenter,
  onToggleMapLayers,
  onClusterInfo,
  initialValue,
}: WhereIsYourBusinessLocatedScreenProps) {
  const defaultSearch = 'Plot 1428, Adetokunbo Ademola Crescent, Wuse 2';
  const [search, setSearch] = useState(initialValue?.search ?? defaultSearch);
  const [street, setStreet] = useState(
    initialValue?.street ?? 'Plot 1428, Adetokunbo Ademola Crescent, Wuse 2, Abuja',
  );
  const [landmark, setLandmark] = useState(
    initialValue?.landmark ?? 'Opposite Cubana Suites, Ground Floor (Suite G-02)',
  );

  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const onClearSearch = useCallback(() => setSearch(''), []);
  const onUseGps = useCallback(() => {
    setSearch('Adetokunbo Ademola Cres, Wuse 2, Abuja 904101');
    onUseCurrentLocation?.();
  }, [onUseCurrentLocation]);

  const draft = useMemo<BusinessLocationDraft>(
    () => ({ search, street, landmark, district: copy.whereLocated.district }),
    [landmark, search, street],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader
        title={copy.whereLocated.header}
        onBack={handleBack}
        compactTitle
        progress={{ activeIndex: 0, total: 3 }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SetupStepBar
          step={copy.whereLocated.step}
          percent={copy.whereLocated.percent}
          progress={50}
          stepStyle="plain"
          stepMarker="number"
          stepNumber={2}
        />

        <View className="gap-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-heading-md"
          >
            {copy.whereLocated.title}
          </VemtapText>
          <VemtapText tone="secondary">{copy.whereLocated.subtitle}</VemtapText>
        </View>

        <View className="gap-3">
          <View className="min-h-[52px] flex-row items-center gap-2 rounded-field bg-surface-container-lowest px-4 shadow-sm">
            <Icon name="search" size={22} color={colors.primary} />
            <TextInput
              accessibilityLabel={copy.whereLocated.searchPlaceholder}
              value={search}
              onChangeText={setSearch}
              placeholder={copy.whereLocated.searchPlaceholder}
              placeholderTextColor={colors.textTertiary}
              className="min-w-0 flex-1 text-body-md text-text"
            />
            {search.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.whereLocated.clearSearch}
                hitSlop={8}
                onPress={onClearSearch}
                className="h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest active:scale-95"
              >
                <Icon name="close" size={16} color={colors.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.whereLocated.useCurrentLocation}
            onPress={onUseGps}
            className="min-h-[46px] flex-row items-center justify-between gap-2 rounded-field bg-surface-tint-blue px-4 active:bg-secondary-container"
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <Icon name="myLocation" size={20} color={colors.primary} />
              <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
                {copy.whereLocated.useCurrentLocation}
              </VemtapText>
            </View>
            <View className="shrink-0 flex-row items-center gap-1">
              <VemtapText variant="caption" className="text-primary">
                {copy.whereLocated.gpsReady}
              </VemtapText>
              <View className="ml-1 h-2 w-2 rounded-full bg-badge-discount-text" />
            </View>
          </Pressable>
        </View>

        <View
          className="w-full overflow-hidden rounded-card bg-surface-container-high shadow-sm"
          style={{ height: MAP_HEIGHT }}
        >
          <LocationMapView
            region={primaryBranchRegion}
            style={StyleSheet.absoluteFill}
            scrollEnabled
            zoomEnabled
            showsUserLocation
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.10)', 'transparent', 'rgba(0,0,0,0.40)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View className="absolute left-3 right-3 top-3 flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5 self-start rounded-full bg-surface-container-lowest/95 px-3 py-1.5 shadow-md">
              <Icon name="storefront" size={16} color={colors.tertiaryContainer} />
              <VemtapText
                variant="labelSm"
                className="min-w-0 flex-1 font-sans-semibold text-text"
                numberOfLines={1}
              >
                {copy.whereLocated.mapPinLabel}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.whereLocated.mapLayers}
              hitSlop={6}
              onPress={onToggleMapLayers}
              className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest/95 shadow-md active:scale-95"
            >
              <Icon name="layers" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View className="pointer-events-none absolute inset-0 items-center justify-center">
            <View className="items-center">
              <View className="mb-1 flex-row items-center gap-1 rounded-md bg-inverse-surface px-2 py-1 shadow-lg">
                <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-inverse-on-surface"
                >
                  {copy.whereLocated.mapPinTag}
                </VemtapText>
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
                <Icon name="locationOn" size={24} color={colors.surface} />
              </View>
              <View className="mt-0.5 h-1 w-3 rounded-full bg-black/40" />
            </View>
          </View>
          <View className="pointer-events-none absolute inset-x-0 bottom-3 flex-row justify-center px-3">
            <View className="flex-row items-center gap-1.5 rounded-full bg-inverse-surface/90 px-3.5 py-1.5 shadow-lg">
              <Icon name="touchApp" size={15} color={colors.primaryFixedDim} />
              <VemtapText
                variant="caption"
                className="font-sans-medium text-inverse-on-surface"
              >
                {copy.whereLocated.mapHint}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.whereLocated.mapRecenter}
            hitSlop={6}
            onPress={onRecenter ?? onUseCurrentLocation}
            className="absolute bottom-12 right-3 h-9 w-9 items-center justify-center rounded-field bg-surface-container-lowest shadow-md active:scale-90"
          >
            <Icon name="myLocation" size={18} color={colors.surfaceDark} />
          </Pressable>
        </View>

        <SetupSectionCard tone="lowest" className="gap-3.5">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <View className="min-w-0 flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-surface-tint-blue">
                <Icon name="hub" size={17} color={colors.primary} />
              </View>
              <VemtapText variant="headingSm" className="text-text">
                {copy.whereLocated.territoryTitle}
              </VemtapText>
            </View>
            <StatusPill label={copy.whereLocated.territoryBadge} tone="success" />
          </View>
          <View className="flex-row gap-2.5">
            <View className="min-w-0 flex-1 gap-2.5">
              <SectionMetaRow
                label={copy.whereLocated.countryLabel}
                value={`${FLAG_NIGERIA} ${copy.whereLocated.country}`}
              />
              <SectionMetaRow
                label={copy.whereLocated.stateLabel}
                value={copy.whereLocated.state}
              />
            </View>
            <View className="min-w-0 flex-1 gap-2.5">
              <SectionMetaRow
                label={copy.whereLocated.cityLabel}
                value={copy.whereLocated.city}
              />
              <SectionMetaRow
                label={copy.whereLocated.districtLabel}
                value={copy.whereLocated.district}
                emphasized
              />
            </View>
          </View>
          <View className="gap-1.5 rounded-field bg-surface-tint-blue p-3">
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                <Icon name="insights" size={16} color={colors.primary} />
                <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                  {copy.whereLocated.clusterTitle}
                </VemtapText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.whereLocated.clusterInfo}
                hitSlop={6}
                onPress={onClusterInfo}
              >
                <Icon name="info" size={16} color={colors.secondary} />
              </Pressable>
            </View>
            <View className="flex-row items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-2.5 py-1.5 shadow-sm">
              <VemtapText
                variant="labelSm"
                className="min-w-0 flex-1 font-sans-semibold text-text"
                numberOfLines={1}
              >
                {copy.whereLocated.clusterName}
              </VemtapText>
              <VemtapText
                variant="caption"
                className="shrink-0 font-sans-semibold text-primary"
              >
                {copy.whereLocated.clusterStatus}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary" className="leading-tight">
              {copy.whereLocated.clusterBody}
            </VemtapText>
          </View>
        </SetupSectionCard>

        <View className="gap-3">
          <BusinessSectionHeading
            title={copy.whereLocated.detailsTitle}
            trailing={
              <VemtapText variant="caption" tone="secondary">
                {copy.whereLocated.detailsBadge}
              </VemtapText>
            }
          />
          <FieldInput
            label={copy.whereLocated.streetLabel}
            value={street}
            onChangeText={setStreet}
            accessibilityLabel={copy.whereLocated.streetLabel}
            tone="lowest"
            trailingIcon="checkCircle"
            trailingIconColor={colors.badgeDiscountText}
          />
          <FieldInput
            label={copy.whereLocated.landmarkLabel}
            value={landmark}
            onChangeText={setLandmark}
            placeholder={copy.whereLocated.landmarkPlaceholder}
            accessibilityLabel={copy.whereLocated.landmarkLabel}
            tone="lowest"
            trailingIcon="editNote"
          />
        </View>
      </ScrollView>

      <View className="items-center gap-3 px-6 pb-6 pt-0">
        <PrimaryActionButton
          label={copy.whereLocated.continue}
          onPress={() => onContinue?.(draft)}
        />
        <TextActionButton
          label={copy.whereLocated.saveDraft}
          icon="save"
          onPress={() => onSaveDraft?.(draft)}
        />
      </View>
    </SafeAreaView>
  );
}
