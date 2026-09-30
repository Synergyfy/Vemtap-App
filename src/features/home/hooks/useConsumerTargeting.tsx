import React, { useCallback, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from '@components/shared/OfflineBanner';
import { HomeHeader } from '@components/home/HomeHeader';
import type { LocationTargetingControlsProps } from '@components/home/LocationTargetingControls';
import { useIsOnline } from '@hooks/useNetworkStatus';
import { strings } from '@constants/strings';
import { AREA_PILL_LABELS, type AreaName } from '@constants/locations';
import { useLocationStore } from '@store/locationStore';
import {
  ChangeLocationRadiusSheet,
  type ChangeLocationRadiusSelection,
} from '@features/home/components/ChangeLocationRadiusSheet';

cssInterop(View, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

export interface ConsumerTargetingHeaderProps {
  /** Overline text: the greeting on Home, the section name on the Deals feed. */
  title?: string;
  /** Shows the greeting wave. Off when a section title is supplied. */
  showGreeting?: boolean;
}

export interface UseConsumerTargetingOptions extends ConsumerTargetingHeaderProps {
  /** Opens the shared district-selection page. */
  onOpenLocationSelect: () => void;
  /** Device-location request behind the sheet's auto-detect row. */
  onUseCurrentLocation?: () => void;
}

export interface ConsumerTargeting {
  area: AreaName;
  radiusKm: number;
  locationLabel: string;
  radiusLabel: string;
  /** Spread into `HomeHeader` so every navbar is wired identically. */
  headerProps: {
    title?: string;
    showGreeting?: boolean;
  } & LocationTargetingControlsProps;
  /**
   * The location/radius pair on its own, for surfaces that show targeting inside
   * their body rather than in the navbar (the Discover section header).
   */
  controlsProps: LocationTargetingControlsProps;
  /** Renders the navbar (status bar + offline banner included) and the sheet. */
  renderChrome: (content: ReactNode) => ReactNode;
  /** Apply a sheet selection. */
  applyTargeting: (selection: ChangeLocationRadiusSelection) => void;
  radiusSheetOpen: boolean;
  openRadiusSheet: () => void;
  closeRadiusSheet: () => void;
  /** The sheet element, for surfaces that mount their own chrome (Discover). */
  renderRadiusSheet: () => ReactNode;
}

/**
 * The one owner of the consumer top-navbar targeting behaviour.
 *
 * Home and the Deals feed show the same bar, differing only in the overline
 * text, and both must open the same district-selection page and the same
 * location/radius sheet. Composing both from here means a change to the bar, the
 * sheet or the active district can never land on one screen and miss the other
 * (AGENTS rule 17).
 */
export function useConsumerTargeting({
  title,
  showGreeting,
  onOpenLocationSelect,
  onUseCurrentLocation,
}: UseConsumerTargetingOptions): ConsumerTargeting {
  const isOnline = useIsOnline();
  const [sheetOpen, setSheetOpen] = useState(false);

  const area = useLocationStore(state => state.area);
  const radiusKm = useLocationStore(state => state.radiusKm);
  const setTargeting = useLocationStore(state => state.setTargeting);

  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const applyTargeting = useCallback(
    (selection: ChangeLocationRadiusSelection) => {
      setTargeting(selection.area, selection.radiusKm);
    },
    [setTargeting],
  );

  const locationLabel = `${AREA_PILL_LABELS[area]}, Abuja`;
  const radiusLabel = strings.homeLocation.withinKm(radiusKm);

  const controlsProps = useMemo<LocationTargetingControlsProps>(
    () => ({
      location: locationLabel,
      radius: radiusLabel,
      onPressLocation: onOpenLocationSelect,
      onPressRadius: openSheet,
    }),
    [locationLabel, onOpenLocationSelect, openSheet, radiusLabel],
  );

  const headerProps = useMemo(
    () => ({ title, showGreeting, ...controlsProps }),
    [controlsProps, showGreeting, title],
  );

  const renderRadiusSheet = useCallback(
    () => (
      <ChangeLocationRadiusSheet
        visible={sheetOpen}
        onClose={closeSheet}
        area={area}
        radiusKm={radiusKm}
        onApply={applyTargeting}
        onSearchArea={onOpenLocationSelect}
        onUseCurrentLocation={onUseCurrentLocation}
      />
    ),
    [
      applyTargeting,
      area,
      closeSheet,
      onOpenLocationSelect,
      onUseCurrentLocation,
      radiusKm,
      sheetOpen,
    ],
  );

  const renderChrome = useCallback(
    (content: ReactNode) => (
      <View className="flex-1 bg-background">
        {/* Status bar + navbar share solid white so the iPhone inset blends with the header. */}
        <SafeAreaView edges={['top']} className="bg-surface">
          {!isOnline ? <OfflineBanner /> : null}
          <HomeHeader {...headerProps} />
        </SafeAreaView>
        {content}
        {renderRadiusSheet()}
      </View>
    ),
    [headerProps, isOnline, renderRadiusSheet],
  );

  return {
    area,
    radiusKm,
    locationLabel,
    radiusLabel,
    headerProps,
    controlsProps,
    renderChrome,
    applyTargeting,
    radiusSheetOpen: sheetOpen,
    openRadiusSheet: openSheet,
    closeRadiusSheet: closeSheet,
    renderRadiusSheet,
  };
}
