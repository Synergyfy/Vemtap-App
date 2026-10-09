import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  View,
  LogBox,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import './global.css';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colorScheme } from 'nativewind';
import './src/theme/nativewind'; // must run before any screen uses className
import { queryClient, queryCachePersister, PERSIST_BUSTER } from '@store/queryClient';
import { ThemeProvider } from '@theme/ThemeProvider';
import { ErrorBoundary } from '@components/shared/ErrorBoundary';
import { OfflineBanner } from '@components/shared/OfflineBanner';
import { ToastHost } from '@components/shared/ToastHost';
import { RootNavigator } from '@navigation/RootNavigator';
import { useIsOnline } from '@hooks/useNetworkStatus';
import { useUiStore } from '@store/uiStore';
import { registerAuthBridge } from '@api/client';
import { useAuthStore } from '@store/authStore';
import { useAuthBootstrap } from '@features/auth/hooks/useAuthBootstrap';
import { useCustomerTokenSync } from '@features/auth/hooks/useCustomerTokenSync';
import { startOfflineReplay } from '@services/offlineReplay';
import { refreshFeatureFlags } from '@services/featureFlags';
import { initPushNotifications } from '@services/pushNotifications';
import { analytics } from '@services/analytics';
import { logger } from '@utils/logger';
import { colors } from '@theme/colors';

// Design system is light-only. Force light before first paint so NativeWind
// never follows the OS dark scheme during boot (black screen after splash).
colorScheme.set('light');

const shellStyles = StyleSheet.create({
  root: { flex: 1 },
  statusBarBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: colors.surface,
  },
});
const loadingTextStyle = StyleSheet.create({
  loadingText: { color: '#066CF4', fontSize: 16 },
});

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  // Android Expo Go / development: expo-notifications remote-push is unsupported
  // and throws dismissible error dialogs — keep the boot clean.
  'expo-notifications',
  'Android Push notifications',
  'remote notifications',
]);

/**
 * iOS ignores StatusBar.backgroundColor — the status bar is transparent and the
 * view underneath supplies the color. A single app-level backdrop paints the top
 * inset white for every screen without adding layout padding or touching each
 * screen's own safe-area handling.
 */
function StatusBarBackdrop() {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View
        pointerEvents="none"
        style={[shellStyles.statusBarBackdrop, { height: topInset }]}
      />
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const isOnline = useIsOnline();
  const toast = useUiStore(state => state.toast);

  return (
    <View className="flex-1 bg-background">
      {!isOnline ? <OfflineBanner /> : null}
      <View className="flex-1">{children}</View>
      <ToastHost toast={toast} />
      <StatusBarBackdrop />
    </View>
  );
}

/**
 * The token repair is a React Query mutation, so the query client has to sit
 * above it. Calling `useCustomerTokenSync()` inside `App()` itself put it
 * outside every provider and the app threw "No QueryClient set" on boot.
 */
function CustomerTokenSync() {
  useCustomerTokenSync();
  return null;
}

export default function App() {
  const [bootReady, setBootReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });
  const [fontTimeout, setFontTimeout] = useState(false);

  useAuthBootstrap();

  useEffect(() => {
    const timer = setTimeout(() => setFontTimeout(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    registerAuthBridge({
      onSessionExpired: () => {
        logger.warn('auth', 'Session expired — clearing auth state');
        useAuthStore.getState().markUnauthenticated();
      },
    });

    const stopOffline = startOfflineReplay();
    refreshFeatureFlags().catch(() => undefined);
    // Never block boot on notifications — Expo Go / missing native modules must not black-screen Android.
    initPushNotifications().catch(() => undefined);
    analytics.logEvent('app_open').catch(() => undefined);

    setBootReady(true);
    return () => {
      stopOffline();
    };
  }, []);

  if (fontError) {
    logger.error('app', 'Font loading failed', fontError);
  }

  const booted = bootReady && (fontsLoaded || fontTimeout);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={shellStyles.root}>
        <SafeAreaProvider>
          <ThemeProvider>
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{
                persister: queryCachePersister,
                maxAge: 1000 * 60 * 60 * 24,
                buster: PERSIST_BUSTER,
              }}
            >
              <QueryClientProvider client={queryClient}>
                {/* Under the client, above the shell: a mis-signed token is
                    repaired before the first screen's fetches run. */}
                <CustomerTokenSync />
                {booted ? (
                  <Shell>
                    <RootNavigator />
                  </Shell>
                ) : (
                  <View className="flex-1 items-center justify-center bg-surface">
                    <View className="flex-row items-center gap-3">
                      <ActivityIndicator size="large" color="#066CF4" />
                      <Text style={loadingTextStyle.loadingText}>Loading VEMTAP...</Text>
                    </View>
                    <StatusBarBackdrop />
                  </View>
                )}
              </QueryClientProvider>
            </PersistQueryClientProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
