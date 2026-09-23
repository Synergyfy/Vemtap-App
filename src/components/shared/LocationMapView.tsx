import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';

export interface LocationMapViewProps {
  region: Region;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  pitchEnabled?: boolean;
  rotateEnabled?: boolean;
  showsUserLocation?: boolean;
}

function isExpoGo(): boolean {
  return process.env.EXPO_GO === '1' || process.env.EXPO_GO === 'true';
}

/**
 * True when a real Android Maps key was inlined at bundle time.
 * app.json alone cannot evaluate process.env — key comes from app.config.js
 * reading EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID.
 */
function hasAndroidMapsKey(): boolean {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;
  return Boolean(key && key.trim().length > 10 && !key.includes('process.env'));
}

/**
 * Designed map base used when real tiles cannot render (Expo Go Android ships an
 * expired/missing Google Maps key → blank/black tiles). Keeps the UI intentional
 * on both platforms until a dev/production build provides a valid key via
 * android.config.googleMaps.apiKey.
 */
const FALLBACK_BLOCKS = [
  { id: 'b1', left: '4%', top: '8%', width: '26%', height: '18%' },
  { id: 'b2', left: '36%', top: '12%', width: '28%', height: '14%' },
  { id: 'b3', left: '68%', top: '6%', width: '26%', height: '22%' },
  { id: 'b4', left: '6%', top: '44%', width: '22%', height: '20%' },
  { id: 'b5', left: '34%', top: '48%', width: '30%', height: '16%' },
  { id: 'b6', left: '70%', top: '42%', width: '24%', height: '24%' },
  { id: 'b7', left: '10%', top: '72%', width: '28%', height: '18%' },
  { id: 'b8', left: '44%', top: '74%', width: '22%', height: '16%' },
  { id: 'b9', left: '72%', top: '72%', width: '22%', height: '20%' },
] as const;

const H_ROADS = [
  { id: 'h1', top: '18%', major: true },
  { id: 'h2', top: '38%', major: false },
  { id: 'h3', top: '58%', major: true },
  { id: 'h4', top: '78%', major: false },
] as const;

const V_ROADS = [
  { id: 'v1', left: '16%', major: true },
  { id: 'v2', left: '36%', major: false },
  { id: 'v3', left: '56%', major: true },
  { id: 'v4', left: '76%', major: false },
] as const;

const ROAD_MARKS = [
  { id: 'l1', left: '18%', top: '34%' },
  { id: 'l2', left: '58%', top: '14%' },
  { id: 'l3', left: '40%', top: '62%' },
] as const;

function MapTilesFallback() {
  return (
    <View style={fallbackStyles.root} pointerEvents="none" accessibilityElementsHidden>
      <View style={fallbackStyles.base} />
      {FALLBACK_BLOCKS.map(b => (
        <View
          key={b.id}
          style={[
            fallbackStyles.block,
            { left: b.left, top: b.top, width: b.width, height: b.height },
          ]}
        />
      ))}
      {H_ROADS.map(r => (
        <View
          key={r.id}
          style={[
            r.major ? fallbackStyles.roadHMajor : fallbackStyles.roadHMinor,
            { top: r.top },
          ]}
        />
      ))}
      {V_ROADS.map(r => (
        <View
          key={r.id}
          style={[
            r.major ? fallbackStyles.roadVMajor : fallbackStyles.roadVMinor,
            { left: r.left },
          ]}
        />
      ))}
      {ROAD_MARKS.map(l => (
        <View
          key={l.id}
          style={[fallbackStyles.roadLabel, { left: l.left, top: l.top }]}
        />
      ))}
      <View style={fallbackStyles.center} />
      <View style={fallbackStyles.pin}>
        <View style={fallbackStyles.pinDot} />
      </View>
    </View>
  );
}

/**
 * Shared map panel used by Manual Location Search and Confirm Location.
 * iOS: Apple Maps (no key). Android: Google Maps via PROVIDER_GOOGLE when a
 * real key is present (dev/prod builds via app.config.js). Expo Go Android or
 * missing key → designed MapTilesFallback only (Expo Go's Maps key is blank/expired;
 * an opaque MapView would cover the fallback with empty tiles).
 */
export function LocationMapView({
  region,
  style,
  children,
  scrollEnabled = true,
  zoomEnabled = true,
  pitchEnabled = false,
  rotateEnabled = false,
  showsUserLocation = false,
}: LocationMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const useFallbackOnly = useMemo(() => {
    if (Platform.OS !== 'android') {
      return false;
    }
    return isExpoGo() || !hasAndroidMapsKey();
  }, []);

  useEffect(() => {
    if (useFallbackOnly) return;
    mapRef.current?.animateToRegion(region, 350);
  }, [region, useFallbackOnly]);

  return (
    <View style={[styles.container, style]}>
      {useFallbackOnly ? (
        <MapTilesFallback />
      ) : (
        <>
          <MapTilesFallback />
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={region}
            scrollEnabled={scrollEnabled}
            zoomEnabled={zoomEnabled}
            pitchEnabled={pitchEnabled}
            rotateEnabled={rotateEnabled}
            showsUserLocation={showsUserLocation}
            showsMyLocationButton={false}
            showsCompass={false}
            toolbarEnabled={false}
            loadingEnabled
          />
        </>
      )}
      {children}
    </View>
  );
}

const fallbackStyles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  base: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E7EEF8',
  },
  block: {
    position: 'absolute',
    backgroundColor: '#D5E0F0',
    borderRadius: 4,
  },
  roadHMajor: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#FFFFFF',
  },
  roadHMinor: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#F3F6FB',
  },
  roadVMajor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#FFFFFF',
  },
  roadVMinor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#F3F6FB',
  },
  center: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 48,
    height: 48,
    marginLeft: -24,
    marginTop: -24,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 108, 244, 0.18)',
  },
  roadLabel: {
    position: 'absolute',
    width: 52,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  pin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 22,
    height: 22,
    marginLeft: -11,
    marginTop: -11,
    borderRadius: 11,
    backgroundColor: '#066CF4',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    minHeight: 1,
    minWidth: 1,
  },
});
