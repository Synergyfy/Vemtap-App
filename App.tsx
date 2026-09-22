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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colorScheme } from 'nativewind';
import './src/theme/nativewind'; // must run before any screen uses className
import { queryClient, queryCachePersister, PERSIST_BUSTER } from '@store/queryClient';
import { ThemeProvider, useTheme } from '@theme/ThemeProvider';
import { ErrorBoundary } from '@components/shared/ErrorBoundary';
import { OfflineBanner } from '@components/shared/OfflineBanner';
import { ToastHost } from '@components/shared/ToastHost';
import { RootNavigator } from '@navigation/RootNavigator';
import { useIsOnline } from '@hooks/useNetworkStatus';
import { useUiStore } from '@store/uiStore';
import { registerAuthBridge } from '@api/client';
import { useAuthStore } from '@store/authStore';
import { startOfflineReplay } from '@services/offlineReplay';
import { refreshFeatureFlags } from '@services/featureFlags';
import { initPushNotifications } from '@services/pushNotifications';
import { analytics } from '@services/analytics';
import { logger } from '@utils/logger';

// Design system is light-only. Force light before first paint so NativeWind
// never follows the OS dark scheme during boot (black screen after splash).
colorScheme.set('light');

const shellStyles = StyleSheet.create({ root: { flex: 1 } });
const loadingTextStyle = StyleSheet.create({
  loadingText: { color: '#066CF4', fontSize: 16 },
});

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

function Shell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isOnline = useIsOnline();
  const toast = useUiStore(state => state.toast);

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      {!isOnline ? <OfflineBanner /> : null}
      <View className="flex-1">{children}</View>
      <ToastHost toast={toast} />
    </View>
  );
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

  if (!bootReady || (!fontsLoaded && !fontTimeout)) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-background">
          <View className="flex-row items-center gap-3">
            <ActivityIndicator size="large" color="#066CF4" />
            <Text style={loadingTextStyle.loadingText}>Loading VEMTAP...</Text>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

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
                <Shell>
                  <RootNavigator />
                </Shell>
              </QueryClientProvider>
            </PersistQueryClientProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
